/*jshint esversion: 6 */
/*jshint node: true */
'use strict';

// VARIABLES ===================================================================
const fs = require('fs');                  //Require the fs module (which provides an API) to be able to interact with the file system
const scrapeIt = require("scrape-it");     //Require Scrape It to be able to scrape website for t-shirt information
const json2csv = require('json2csv');      //Require json2csv to be able to save scraped data to CSV file
const dataDirPath = './data';              //Path to data folder
const sitePath = 'http://shirts4mike.com/';//Path to website to scrape

const columnHeaders = [ 'Title', 'Price', 'ImageURL', 'URL', 'Time' ];
const tShirts = [];

// DATA DIRECTORY ==============================================================

// Check if data folder exists. If not, create data folder
function checkDataDir(){
  if (!fs.existsSync(dataDirPath)) {
    console.log('no data folder found');
    fs.mkdir(dataDirPath, (error) => {
      if(error){
        console.log('failed to create directory', error);
      }
      else {
        console.log('successfully created directory');
      }
    });
  }
  else {
    console.log('data folder found');
  }
}

// SCRAPE DATA =================================================================

// Scrape site with Promise interface
function scrapeSite(){

  scrapeIt(sitePath + 'shirts.php', {
    // Fetch the list items on the start page
    pages: {
      listItem: 'ul.products li',
      data: {
        url: {
          selector: 'a',
          attr: 'href'
        }
      }
    }
  }).then(({ data, response }) => {
    // console.log(`Status Code: ${response.statusCode}`);
    // console.log(data);
    const pages = data.pages;
    scrapePages(pages);

  }).catch( (error) => {
    const errorMsg = `Cannot connect to ${sitePath}`;
    writeErrorLog(errorMsg);
    // console.error(errorMsg);
  });
}

function scrapePages(pages){
  // Get specific t-shirt data from each page
  for (const page of pages){
    const pagePath = sitePath + page.url;
    scrapeIt(pagePath, {
      page: {
        listItem: '.page',
        data: {
          price: 'span',
          title: {
            selector: 'img',
            attr: 'alt',
          },
          img: {
            selector: 'img',
            attr: 'src'
          }
        }
      }
    }).then(({ data , response }) => {
      //Current time
      const time = new Date();
      const hour = addZero(time.getHours());
      const min = addZero(time.getMinutes());
      const sec = addZero(time.getSeconds());

      // T-shirt object with product details
      const tShirt = {
        Title   : data.page[0].title,
        Price   : data.page[0].price,
        ImageURL: data.page[0].img,
        URL     : pagePath,
        Time    : `${hour}:${min}:${sec}`,
      };

      //Add this t-shirt object to array
      tShirts.push(tShirt);
      writeDataToFile(tShirts);

    }).catch( (error) => {
      writeErrorLog(error);
      console.error(`There's been an error.`, error);
    });

  } //For loop ends

}

// SAVE DATA TO FILE ===========================================================
function writeDataToFile(tShirts){
  const time = new Date();
  const year = time.getFullYear();
  const month = addZero(time.getMonth()+1);
  const date = addZero(time.getDate());
  const fileName = `${year}-${month}-${date}`; //File will be named by current date

  var csv = json2csv({ data: tShirts, fields: columnHeaders });

  fs.writeFile(`./data/${fileName}.csv`, csv, function(err) {
    if (err) throw err;
    console.log('file saved');
  });
}

// WRITE ERROR LOG =============================================================

function writeErrorLog(errorMsg){

  const time = new Date();
  const year = time.getYear();
  const month = time.getMonth();
  const date = time.getDate();
  const hour = addZero(time.getHours());
  const min = addZero(time.getMinutes());
  const sec = addZero(time.getSeconds());
  const timestamp = new Date(year, month, date, hour, min, sec);

  try {
    //Create error log if not existing. If it exists, add log message to the end of the file
    fs.appendFileSync('scraper-error.log', `${timestamp} ${errorMsg}\n`);
    console.log('Error message was successfully saved in scraper-error.log');
  }
  catch (error) {
    console.log(`Couldn't save error message to log-file`);
  }
}

// HELPERS =====================================================================

//Add a zero in fron of date/time if less than 10
function addZero(date){
  let result;
  if (date < 10){
    result = '0'+date;
  }
  else {
    result = date;
  }
  return result;
}

// RUN APP =====================================================================
function run(){
  checkDataDir();
  scrapeSite();
  // writeDataToFile(tShirts);
}

run();
