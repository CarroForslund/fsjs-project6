const fs = require('fs'); //Require the fs module (which provides an API) to be able to interact with the file system
const path = './data';    //Path to data folder

//Check if data folder exists
//If not, create data folder
if (!fs.existsSync(path)) {
  console.log('no data folder found');
  fs.mkdir(path, (error) => {
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
