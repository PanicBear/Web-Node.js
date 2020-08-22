var http = require('http');
var fs = require('fs');
var url = require('url');

var app = http.createServer(function (request, response) {

  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  var title = queryData.id;

  // 쿼리스트링 유무에 관계없이 경로만 출력
  console.log(url.parse(_url, true).pathname) 

  // 루트 디렉토리나 쿼리스트링이 아닌 경우 404
  // http://localhost:3000/khkj
  if (pathname === '/') {
    fs.readFile(`${'data/' + queryData.id + '.txt'}`, 'utf8', function (err, description) {
      var template = `
        <!doctype html>
        <html>
        <head>
          <title>WEB1 - ${title}</title>
          <meta charset="utf-8">
        </head>
        <body>
          <h1><a href="/">WEB</a></h1>
          <ul>
            <li><a href="?id=HTML">HTML</a></li>
            <li><a href="?id=CSS">CSS</a></li>
            <li><a href="?id=JavaScript">JavaScript</a></li>
          </ul>
          <h2>${title}</h2>
          <p>${description}</p>
        </body>
        </html>
        `;
      response.writeHead(200);
      response.end(template);
    });
  } else {
    response.writeHead(404);
    response.end('Not found');
  }
})
app.listen(3000);