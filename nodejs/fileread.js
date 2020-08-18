const fs = require('fs');

fs.readFile('sample.txt', 'utf8', function(err, data){
    console.log(data);
})

/* fs.unlink('/tmp/hello', (err)=>{
    console.log('successfully deleted /tmp/hello');
}) */