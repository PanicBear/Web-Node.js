var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

var app = http.createServer(function (request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if (pathname === '/') {
        if (queryData.id === undefined) {
            fs.readdir('./data', function (error, filelist) {
                fs.readFile(`./data/${queryData.id}`, 'utf8', function (err, description) {
                    var title = 'Welcome';
                    var description = 'Hello, Node.js'
                    var list = templateList(filelist);
                    var template = templateHTML(title, list, `<h2>${title}</h2>${description}`);
                    response.writeHead(200);
                    response.end(template);
                });
            });
        } else {
            fs.readdir('./data', function (error, filelist) {
                fs.readFile(`./data/${queryData.id}`, 'utf8', function (err, description) {
                    var title = queryData.id.slice(0, -4);
                    var list = templateList(filelist);
                    var template = templateHTML(title, list, `<h2>${title}</h2>${description}`);
                    response.writeHead(200);
                    response.end(template);
                });
            });
        }
    } else if (pathname === '/create') {
        fs.readdir('./data', function (err, filelist) {
            var title = 'Web - create'
            var list = templateList(filelist);
            var template = templateHTML(title, list, `
            <form action="http://localhost:3000/create_process" method="post">
              <p><input type="text" name="title" placeholder="title"></p>
              <p>
                <textarea name="description" placeholder="description"></textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
          `);
          response.writeHead(200);
          response.end(template);
        });
    }else if (pathname === '/create_process'){
        var body = ''; 
        request.on('data', function (data) {
            body += data;

            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6)
                request.connection.destroy();
        });

        request.on('end', function () {
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;
            console.log(post);
            console.log(post.title);
            console.log(post.description);
        });

        response.writeHead(200);
        response.end('SUCCESS');
    } else {
        response.writeHead(404);
        response.end('Not found');
    }
});
app.listen(3000);

// body 중간에 a태그 생성(글 생성용 create)
function templateHTML(title, list, body) {
    return `
    <!doctype html>
    <html>
    <head>
      <title>WEB2 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">WEB2</a></h1>
      ${list}
      <a href="/create">create</a>   
      ${body}
    </body>
    </html>
    `;
}

function templateList(filelist) {
    var list = '<ul>';
    var i = 0;
    while (i < filelist.length) {
        list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i].slice(0, -4)}</a></li>`;
        i = i + 1;
    }
    list = list + '</ul>';
    return list;
}

/* 

    request.on

        웹브라우저가 post 방식으로 데이터를 전송하고자 할 때,
            데이터 수신 시 마다 콜백 함수 호출하도록 약속되어 있다.
            이때, 콜백 함수의 인자 'data'를 통해 정보를 전달

            => 한 번에 다량의 데이터가 전송되어 지연되는 것을 방지하는 콜백 작성


        인자의 종류
            
            request.on('data'

                데이터 수신 시 콜백

            request.on('end'

                받는 데이터가 없을 시 콜백(정보 수신 없을 때)



    require('querystring')

        nodejs가 가진 쿼리스트링이라는 모듈 호출

*/