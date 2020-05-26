const CREDS = require('../config/creds');
const CONFIG = require('../config/config');

// DOM element selectors
const URL_MAIN = 'https://facebook.com/';
const LOGIN_TITLE = 'Facebook - Log In or Sign Up';
const LOGIN_TITLE_US = 'Facebook – log in or sign up';
const LOGGED_IN_TITLE = 'Facebook';
const LOGGED_IN_TITLE_NOTIFICATIONS = /Facebook([0-9])/;
const SEL_USERNAME = '//*[@id="email"]';
const SEL_PASSWORD = '//*[@id="pass"]';

export default async function loginPage(page) {

    let counter = 1;

    try {
        // Set navigation timeout
        await page.setDefaultNavigationTimeout(CONFIG.navTimeOut); 
        console.log("Navigation timeout set to " + CONFIG.navTimeOut/1000 + " seconds");

        await startloginFlow(page);

    } catch (e) {
        console.log("Error logging in: " + e);
        // Close the browser and increase counter of tries
        counter ++;

        // Check if max tries has been reached, otherwise try to login again
        if (counter <= CONFIG.maxLoginTries) {
            console.log("Trying to login again. Try nr: " + counter);
            await startloginFlow(page);

            // wait and click the alert button (quickfix - otherwise it will not work)
            console.log('Waiting for 3s');
            await page.waitFor(3000);

            // Close reminders black screen
            await page.keyboard.press('Escape');
            console.log('Escape pressed - black screen closed');
            
        } else {
            console.log("Maximum number of login tries reached");
            throw new Error('Max login tries reached');
        }
    }

    return page;
}

async function startloginFlow(page) {
    // Open Facebook login page
    await page.goto(URL_MAIN);
    console.log("Facebook page opened");

    await page.title().then(async result => {
        console.log("Page finished loading. Title: " + result);
        
        // Check if logged in page is opened
        if (result === LOGGED_IN_TITLE || result === LOGGED_IN_TITLE_NOTIFICATIONS) {
            // End login flow and return the resulting page object
            console.log("Facebook user logged in");
        } else if (result === LOGIN_TITLE || result === LOGIN_TITLE_US) {
            await enterLoginDetails(page);
        } else {
            // Throw error about incorrect page title
            throw new Error('Incorrect login page');
        }
    });
}

async function enterLoginDetails(page) {
 
    // Enter login details
    await page.waitForXPath(SEL_USERNAME).then((result) => result.focus());
    await page.keyboard.type(CREDS.username);
    await page.waitForXPath(SEL_PASSWORD).then((result) => result.focus());
    await page.keyboard.type(CREDS.password);
    await page.keyboard.press('Enter')
    console.log("Username/Password entered");

    const cookies = await page.cookies()

    console.log(cookies);

    await page.waitForNavigation();

    //Check page title of the loaded page
    await page.title().then(async result => {
        console.log("Page finished loading. Title: " + result);
        // Check if logged in page is opened
        if (result === LOGGED_IN_TITLE || result === LOGGED_IN_TITLE_NOTIFICATIONS) {
            // End login flow and return the resulting page object
            console.log("Facebook user logged in");
        } else {
            // Throw error about incorrect page title
            throw new Error('Incorrect login page');
        }
    });
}