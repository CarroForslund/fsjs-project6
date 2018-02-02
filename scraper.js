//Require the fs module (which provides an API) to be able to interact with the file system
const fs = require('fs');

if (!fs.existsSync('./data')) {
    console.log('no data folder found');
}
else {
  console.log('data folder found');
}

// //function will check if a directory exists, and create it if it doesn't
// function checkDirectory(directory, callback) {
//   fs.stat(directory, function(err, stats) {
//     //Check if error defined and the error code is "not exists"
//     if (err && err.errno === 34) {
//       //Create the directory, call the callback.
//       fs.mkdir(directory, callback);
//     } else {
//       //just in case there was a different error:
//       callback(err)
//     }
//   });
// }
