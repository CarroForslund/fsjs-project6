const fs = require('fs');                     //Require the fs module (which provides an API) to be able to interact with the file system
const scrapeIt = require("scrape-it");        //Require Scrape It to be able to scrape website for t-shirt information
const dataDirPath = './data';                 //Path to data folder
const sitePath = 'http://shirts4mike.com/';//Path to website to scrape


// Check if data folder exists. If not, create data folder =====================
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

// The scraper gets the price, title, url and image url from the product page
// Callback interface: scrapeIt( url, options, callback )
scrapeIt(sitePath, {
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
}, (err, { data }) => {
  // const errorMessage = `There’s been a 404 error. Cannot connect to ${sitePath}`;
  // console.log(err || data);
  if(err){
    console.error(`There’s been a 404 error. Cannot connect to ${sitePath}`);
  }
  else {
    // console.log(data);
    const pages = data.pages;

    for (const page of pages){
      const pagePath = sitePath + page.url;
      console.log(pagePath);

      // Fetch the list items on the specific page
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
      }, (err, {data}) => {
        // console.log(err || data.page)
        if(err){
          console.error('An error occured', err);
        }
        else {
          //Product details
          console.log('Price: ', data.page[0].price);
          console.log('Title: ', data.page[0].title);
          console.log('Url: ', pagePath);
          console.log('Img url: ', data.page[0].img);
        }
      })
    }
  }
});

//Save products with details to CSV (Comma-separated values) file
//CSV file named by date, e.g. 2016-11-21.csv
//The column headers in the CSV need to be in a certain order to be correctly entered into a database.
  //They should be in this order: Title, Price, ImageURL, URL, and Time
//CSV file saved in data folder
