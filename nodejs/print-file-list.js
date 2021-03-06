var http = require('http');
var fs = require('fs');
var url = require('url');

var app = http.createServer(function (request, response) {

  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  var title = 'Welcome';

  if (pathname === '/') {
    fs.readdir('./data', function (error, filelist) {
      fs.readFile(`${'data/' + queryData.id + '.txt'}`, 'utf8', function (err, description) {
        if (queryData.id === undefined) {
          title = 'Welcome';
          description = 'Hello, Node.js';
        } else {
          title = queryData.id;
        }
        var list = '<ul>'
        for(var i = 0; i<filelist.length;i++){
          list += `<li><a href="?id=${filelist[i].slice(0,-4)}">${filelist[i].slice(0,-4)}</a></li>`
        }
        list += '</ul>';
        var template = `
          <!doctype html>
          <html>
          <head>
            <title>WEB1 - ${title}</title>
            <meta charset="utf-8">
          </head>
          <body>
            <h1><a href="/">WEB</a></h1>
              ${list}
            <h2>${title}</h2>
            <p>${description}</p>
          </body>
          </html>
          `;
        response.writeHead(200);
        response.end(template);
      });
    });
  } else {
    response.writeHead(404);
    response.end('Not found');
  }
})
app.listen(3000);