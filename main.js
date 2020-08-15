var http = require('http');
var fs = require('fs');
var app = http.createServer(function (request, response) {
    var url = request.url;
    if (request.url == '/') {
        url = '/index.html';
    }
    if(request.url == '/favicon.ico'){
        response.writeHead(404);
        response.end();
        return;
    }
    response.writeHead(200);
    console.log(__dirname + url);
    response.end(fs.readFileSync(__dirname + url)); // 사용자에게 보여줄 정보 선정(아파치는 안되고 nodejs는 된다는데, 스프링은 되지않나?)
    // response.end("ClarXo : " + url)
})
app.listen(3000);