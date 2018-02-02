/*jshint esversion: 6 */
'use strict';

const fs = require('fs');                  //Require the fs module (which provides an API) to be able to interact with the file system
const scrapeIt = require("scrape-it");     //Require Scrape It to be able to scrape website for t-shirt information
const json2csv = require('json2csv');      //Require json2csv to be able to save scraped data to CSV file
const dataDirPath = './data';              //Path to data folder
const sitePath = 'http://shirts4mike.com/';//Path to website to scrape

const columnHeaders = [ 'Title', 'Price', 'ImageURL', 'URL', 'Time' ];
const tShirts = [];

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

// Scrape site with Promise interface
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
}).then( ({ data, response }) => {
    // console.log(`Status Code: ${response.statusCode}`)
    // console.log(data)
    const pages = data.pages;

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
        const hour = time.getHours();
        const min = time.getMinutes();
        const sec = time.getSeconds();
        //T-shirt details
        const tShirt = data.page[0];
        tShirt.title = tShirt.title;
        tShirt.price = tShirt.price;
        tShirt.img = tShirt.img;
        tShirt.url = pagePath;
        tShirt.time = `${hour}:${min}:${sec}`;
        // console.log(tShirt);

        //Add this t-shirt object to array
        tShirts.push(tShirt);
      });
    } //For loop ends
}).then( () => {
  //Time variables to be able to set fileName
  const time = new Date();
  const year = time.getFullYear();
  const month = addZero(time.getMonth()+1);
  const day = addZero(time.getDate());
  //File will be named by current date
  const fileName = `${year}-${month}-${day}`;

  var csv = json2csv({ data: tShirts, fields: columnHeaders });

  fs.writeFile(`./data/${fileName}.csv`, csv, function(err) {
    if (err) throw err;
    console.log('file saved');
  });
});


//Save products with details to CSV (Comma-separated values) file
//CSV file named by date, e.g. 2016-11-21.csv
//The column headers in the CSV need to be in a certain order to be correctly entered into a database.
  //They should be in this order: Title, Price, ImageURL, URL, and Time
//CSV file saved in data folder


// HELPERS =====================================================================
function addZero(date){
  let result;
  if (date < 10){
    result = '0'+date
  }
  else {
    result = date;
  }
  return result;
}




// // The scraper gets the price, title, url and image url from the product page
// // Callback interface: scrapeIt( url, options, callback )
// scrapeIt(sitePath, {
//   // Fetch the list items on the start page
//   pages: {
//     listItem: 'ul.products li',
//     data: {
//       url: {
//         selector: 'a',
//         attr: 'href'
//       },
//       price: 'span',
//       title: {
//         selector: 'img',
//         attr: 'alt',
//       },
//       img: {
//         selector: 'img',
//         attr: 'src'
//       }
//     }
//   }
// }, (err, { data }) => {
//   // const errorMessage = `There’s been a 404 error. Cannot connect to ${sitePath}`;
//   // console.log(err || data);
//   if(err){
//     console.error(`There’s been a 404 error. Cannot connect to ${sitePath}`);
//   }
//   else {
//     // console.log(data);
//     const pages = data.pages;
//     const columnHeaders = [ 'Title', 'Price', 'ImageURL', 'URL', 'Time' ];
//     const tShirts = [];
//     //Time variables to be able to set fileName
//     const time = new Date();
//     const year = time.getFullYear();
//     const month = addZero(time.getMonth()+1);
//     const day = addZero(time.getDate());
//     //File will be named by current date
//     const fileName = `${year}-${month}-${day}`;
//
//     // Get specific t-shirt data from each page
//     for (const page of pages){
//       const pagePath = sitePath + page.url;
//
//       scrapeIt(pagePath, {
//         page: {
//           listItem: '.page',
//           data: {
//             price: 'span',
//             title: {
//               selector: 'img',
//               attr: 'alt',
//             },
//             img: {
//               selector: 'img',
//               attr: 'src'
//             }
//           }
//         }
//       }, (err, {data}) => {
//         // console.log(err || data.page)
//         if(err){
//           console.error('An error occured', err);
//         }
//         else {
//           //Get current time
//           const time = new Date();
//           const hour = time.getHours();
//           const min = time.getMinutes();
//           const sec = time.getSeconds();
//
//           const page = data.page[0];
//
//           //T-shirt details saved in a json object
//           const tShirt = {
//             "Title"   : `"${page.title}"`,
//             "Price"   : `"${page.price}"`,
//             "ImageURL": `"${page.img}"`,
//             "URL"     : `"${pagePath}"`,
//             "Time"    : `${hour}:${min}:${sec}`,
//           };
//
//           //Add this t-shirt object to array
//           tShirts.push(tShirt);
//           // if (requests >= 8){
//           //   console.log('time to write file with', tShirts);
//           // }
//
//         }
//       });
//     } //For loop ends
//   }
// });
