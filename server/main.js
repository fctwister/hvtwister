import { Meteor } from 'meteor/meteor';
import puppeteer from 'puppeteer';
import loginPage from './actions/login';
import { updatePolls } from './db/polls';
import { updatePlayers, addPlayer } from './db/players';
import '../imports/publish/polls';
import '../imports/publish/players';
import { throws } from 'assert';

var fs = require('fs');

const URL_HVTWISTER = 'https://www.facebook.com/groups/hvjalka';
const URL_VOTERS='https://www.facebook.com/browse/option_voters?option_id=';
const SEL_CURRENT_POLL = '/html/body/div[1]/div/div[1]/div[1]/div[3]/div/div/div[1]/div[1]/div[4]/div/div/div/div';
const SEL_VOTERS = '/html/body/div[1]/div[3]/div[1]/div/div[1]/div[2]/div/div/div/div/div[2]/ul';

// Run this when the meteor app is started
Meteor.startup(function () {
	// Update all HV Twister players in DB and return the players array
	// File in /private folder can be accessed this way
	const players = loadPlayersToDB('assets/app/players.json');

	// Initate script to run periodically
	if (Meteor.settings.private.testMode) {
		console.log("App running in test mode");
		run(players);
	} else {
		console.log("App running in production mode");
		// Start scraper after app is launched
		run(players);

		// Set interval for running scraper
		Meteor.setInterval(() => {
			run(players);
		}, Meteor.settings.private.scriptInterval);
	}
});

async function run(players) {
	console.log("Starting the Polls scraper");
	try {
		const browser = await puppeteer.launch({
			headless: Meteor.settings.private.headless,
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

		const context = browser.defaultBrowserContext();
		context.overridePermissions("https://www.facebook.com", ["geolocation", "notifications"]);
	
		page = await browser.newPage();
	
		// Start login function with tries counter set to 1
		page = await loginPage(page);

		// Navigate to the HV Twister group page
		await getPollData(page);
		
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
	const response = await page.goto(URL_HVTWISTER);
	const responseText = await response.text();
	const polls = [];

	// Read all poll urls and add these to the polls array
	const pollsRaw = responseText.split('\"Question\",\"id\":\"');
	for (let i = 1; i < pollsRaw.length; i++) {
		// Extract poll url
		const urlString = pollsRaw[i].split('\"story\":{\"creation_time\":')[1].split(',"url":"')[1];
		const url = urlString.split('\",\"ghl_label\"')[0];
		polls.push(url.replace(/\\/g, ''));
	}	

	/*
	// TODO: Add logic to receive data from GraphQL for scrolled content

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
	
	*/

	// Filter out only relevant polls
	await filterRelevantPolls(polls, page);

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
		case "september":
			return 8;
		case "oktoober":
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

	console.log("Polls length: " + polls.length);

	for (let i=0; i<polls.length; i++) {
		console.log("Poll nr " + i);
		
		try {
			// Navigate to poll URL
			console.log("Navigating to poll: " + polls[i]);
			await page.goto(polls[i]);

			// Select current poll container
			const element = await page.waitForXPath(SEL_CURRENT_POLL);

			// Select current poll text data
			const text = await page.evaluate(element => element.innerHTML, element);

			// Extract poll creator name
			const nameString = text.split('<div class="nc684nl6"><span>');
			
			let name = "";

			if (nameString.length > 1) {
				name = nameString[1].split('</span></div>')[0];
				console.log("Name: " + name);
			} else {
				throw new Error ("Name string has too few elements: " + nameString);
			}

			// Extract poll date
			const dateString = text.split('role="link" tabindex="0"><span>');

			let temp = "";

			if (dateString.length > 1) {
				temp = dateString[1].split('</span></a>')[0].split(" ");
			} else {
				throw new Error ("Date string has too few elements: " + dateString);
			}

			console.log("Date: " + temp);
			
			const currentDate = new Date();

			let day, month, year, time;

			//TODO: add condition for today '1h'

			if(temp[0] === 'Eile' || temp[0] === 'Täna') {
				day = currentDate.getDate() - 1;
				month = currentDate.getMonth();
				year = currentDate.getFullYear();
				time = temp[2].split(":");
			} else {
				day = temp[0].split(".")[0];
				month = getMonth(temp[1]);
				// TODO: What happens if poll from previous year?
				year = currentDate.getFullYear();
				time = temp[3].split(":");
			}

			const date = new Date(year, month, day, time[0], time[1]);
			
			// Extract poll message and voters
			// TODO - add handling logic for multiple paragraphs

			let message = "";
		
			// Extract poll message
			messageString = text.split('<div dir=\"auto\" style=\"text-align: start;\">');

			if (messageString.length > 1) {
				message = messageString[1].split('</div>')[0];
			} else {
				throw new Error ("Message string has too few elements: " + messageString);
			}
			
			// Extract poll options
			const optionsArrayRaw = text.split('<div class=\"ecm0bbzt e5nlhep0 i1fnvgqd btwxx1t3 j83agx80 bp9cbjyn\">');
			const options = [];

			console.log("Poll nr " + i + " options length: " + options.length);
			
			for (let iter = 1; iter < optionsArrayRaw.length; iter++) {

				const optionText = optionsArrayRaw[iter].split('</span></a></span></div><span class=\"oi732d6d ik7dh3pa d2edcug0 hpfvmrgz qv66sw1b c1et5uql a8c37x1j muag1w35 enqfppq2 jq4qci2q a3bd9o3v knj5qynh oo9gr5id\" dir=\"auto\">');
				const optionId = optionsArrayRaw[iter].split('name=\"option_');
				

				if (optionText.length > 1) {
					options.push({
						id: optionId[1].split('\" aria-checked=')[0],
						text: optionText[1].split('</span></div></div></div>')[0],
						pollDate: date
					});
				}
			}

			// Extract voters for each option
			const voters = [];
			let optionVoters = [];

			for (let iter = 0; iter < options.length; iter++) {
				// Navigate to poll URL
				console.log("Navigating to option: " + URL_VOTERS + options[iter].id);
				await page.goto(URL_VOTERS + options[iter].id);

				// Select voters container
				const element = await page.waitForXPath(SEL_VOTERS);

				// Select current poll text data
				const votersListRaw = await page.evaluate(element => element.innerHTML, element);
				const votersList = votersListRaw.split(' alt=\"\" aria-label=\"');

				// Extract voters names
				for (let j = 1; j < votersList.length; j++) {
					const voterName = votersList[j].split('\" role=\"img\">')[0];

					optionVoters.push({
						name: voterName,
						id: getVoterId(voterName)
					});
				}
				
				voters.push({
					option: options[iter],
					voters: optionVoters
				});
				optionVoters = [];
			}

			relevantPolls.push({
				creator: name,
				date: date,
				message: message,
				answers: voters
			})
			
		} catch (e) {
			console.error("Poll nr " + i + ": " + e.message);
			console.log(e);
		}
	}

	console.log(relevantPolls.length);
	console.log(relevantPolls);
	console.log(relevantPolls[0].answers);

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

function loadPlayersToDB(fileName) {
	// Read players from file
	console.log("Reading players from file: " + fileName);
	const players = JSON.parse(fs.readFileSync(fileName, 'utf8')); 
	console.log(players.length);

	// Updating players in database
	updatePlayers(players);

	// Return players object
	return players;
}

function getVoterId(name) {
	// Check if player with that name already exists in the database
	return addPlayer(name); 
}