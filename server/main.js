import { Meteor } from 'meteor/meteor';
import puppeteer from 'puppeteer';
import loginPage from './actions/login';
import { updatePolls } from './db/polls';

var fs = require('fs');

const URL_HVTWISTER = 'https://www.facebook.com/groups/hvjalka';
const URL_VOTERS='https://www.facebook.com/browse/option_voters?option_id=';

// Run this when the meteor app is started
Meteor.startup(function () {
	run();
});

async function run() {

	const browser = await puppeteer.launch({
		headless: true,
		defaultViewport: {	
			width: 1920,	
			height: 1080	
		},
		//executablePath: Meteor.settings.private.executablePath,
		args: [
			`--window-size=1920,1080`,  // set browser size
  			//'--user-data-dir=' + Meteor.settings.private.userDataDir,
			//'--disable-gl-drawing-for-tests' // improve performance
		] 
	});
  
	page = await browser.newPage();
  
	// Login to Facebook
	try {
		// Start login function with tries counter set to 1
		page = await loginPage(page);

		// Navigate to the HV Twister group page
		await getPollData(page);
		
		// wait and click the alert button
		//console.log('Waiting for 3s');
		//await page.waitFor(3000);

		await page.close();
        console.log('Page closed');
        
        await browser.close();
		console.log('Browser closed');

	} catch (e) {
		console.log(e);
	}
}

async function getPollData(page) {
	console.log("Navigating to HV Twister page..");
	page.goto(URL_HVTWISTER);

	await page.waitForNavigation();
	console.log("HV Twister page loaded");

	// wait and click the alert button (quickfix - otherwise it will not work)
	console.log('Waiting for 3s');
	await page.waitFor(3000);

	// Close reminders black screen
	await page.keyboard.press('Escape');
	console.log('Escape pressed - black screen closed');

	let previousHeight;
	let scrollLimit = Meteor.settings.private.scrollLimit;

	// Scroll vertically to relevant poll location (increase scrollLimit for more results)
	for(let i=0; i<scrollLimit; i++) {
		try {
			previousHeight = await page.evaluate('document.body.scrollHeight');
			console.log("Starting vertical scroll. Previous height: " + previousHeight);
			await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
			await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
			await page.waitFor(3000);
		} catch(e) {
			console.error("Scrolling failed: " + e.message);
		}
	}

	// Get all posts including a poll
	const polls = await page.evaluate(() => Array.from(document.querySelectorAll('._3ccb:not(._4pu6)'), element => element.innerHTML));

	// Filter out only relevant polls
	await filterRelevantPolls(polls, page);

	//console.log("Waiting for request data..");
	//getGraphQLRequest();

	return page;
};

function writeToFile(content) {
	fs.writeFile('D:/Temp/output.txt', content, function (err) {
		if (err) throw err;
		console.log('Saved!');
	});
}

function getMonth(monthsString) {
	switch(monthsString) {
		case "jaanuar":
			return 0;
		case "veebruar":
			return 1;
		case "märts":
			return 2;
		case "aprill":
			return 3;
		case "mai":
			return 4;
		case "juuni":
			return 5;
		case "juuli":
			return 6;
		case "august":
			return 7;
		case "September":
			return 8;
		case "Oktoober":
			return 9;
		case "november":
			return 10;
		case "detsember":
			return 11;
	}
}

async function filterRelevantPolls(polls, page) {
	// Loop through all polls
	let relevantPolls = [];

	for (let i=0; i<polls.length; i++) {

		console.log("Poll nr " + i);

		// Extract poll creator name
		const name = polls[i].split('rel=\"dialog\" title=\"')[1].split('\" aria-hidden=\"true\"')[0];
		
		// Extract poll date
		const dateString = polls[i].split(/data-utime="[0-9]*" title="/)[1].split('\" data-shorten=\"1\"')[0];
		const temp = dateString.split(". ")[1].split(" ");

		const day = dateString.split(" ")[1].split(".")[0];
		const month = temp[0];
		const year = temp[1];
		const time = temp[3].split(":");

		const date = new Date(year, getMonth(month), day, time[0], time[1]);

		// Extract poll message
		// TODO - add handling logic for multiple paragraphs

		let message = "";
		try {
			message = polls[i].split('<p>')[1].split('</p>')[0];

			// Extract poll options
			const optionsString = polls[i].split('<div class=\"_3con\"><span><span>');
			const options = [];

			for (let iter = 1; iter < optionsString.length; iter++) {
				options.push(optionsString[iter].split('</span></span></div>')[0]);
			}

			// Extract voters for each option
			const votersRow = polls[i].split('<ul class=\"_4cg3 uiList  _4ki _509-\">');
			
			const voters = [];
			let optionVoters = [];

			for (let iter = 1; iter < votersRow.length; iter++) {
				const votersItems = votersRow[iter].split('\" class=\"_2rt_ link\"');
				let votersURL = "";

				// Check if link exists for all voters (More option)
				try {
					const optionId = votersItems[votersItems.length-1].split('/browse/option_voters?option_id=')[1].split('\" role=')[0];
					votersURL = URL_VOTERS + optionId;
					
				} catch (e) {
					console.error("Poll nr " + i + ": " + e.message);
				}

				// If link exists for all voters, get names from URL
				if (votersURL != "") {
					optionVoters.push(await parseVotersURL(page, votersURL));					
				// If link does not exist, get names form poll directly
				} else {
					for (let cell = 0; cell < (votersItems.length - 1); cell++) {
						optionVoters.push(votersItems[cell].split('<li class=\"_43q7\"><a aria-label=\"')[1]);
					}
				}

				voters.push({
					option: options[iter-1],
					voters: optionVoters
				});
				optionVoters = [];
			}

			console.log(voters[0]);
			console.log(voters[1]);

			relevantPolls.push({
				creator: name,
				date: date,
				message: message,
				voters: voters
			})
			
		} catch (e) {
			console.error("Poll nr " + i + ": " + e.message);
		}
	}

	console.log(relevantPolls.length);
	console.log(relevantPolls);

	// Persist results in DB
	updatePolls(relevantPolls);

	//writeToFile(relevantPolls);
	
	return page;
}

async function parseVotersURL(page, url) {
	console.log("Navigating to voters page: " + url);
	page.goto(url);

	await page.waitForNavigation();
	console.log("Voters page loaded");

	const voters = await page.evaluate(() => Array.from(document.querySelectorAll('.fsl.fwb.fcb'), element => element.innerHTML));
	let result = [];

	for (let i=0; i<voters.length; i++) {
		result.push(voters[i].split('hovercard-prefer-more-content-show=\"1\">')[1].split('</a>')[0]);
	}

	return result;
}


