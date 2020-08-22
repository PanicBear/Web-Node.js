var testFolder = './data';  // 현재 디렉토리/data
var fs = require('fs');

fs.readdir(testFolder, function(error, filelist){
    console.log(filelist);
})