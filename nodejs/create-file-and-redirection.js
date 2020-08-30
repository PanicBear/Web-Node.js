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
    } else if (pathname === '/create_process') {
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

            fs.writeFile(`data/${title}.txt`, description, 'utf8', function (err) {
                if (err) return console.log(err);

                response.writeHead(302, { Location: `/?id=${title}.txt` });   // 헤더, 리다이렉션 주소
                response.end(description);
            })
        });
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

    nodejs를 통한 파일 생성


        참고 자료 : https://nodejs.org/en/knowledge/file-system/how-to-write-files-in-nodejs/


        라이브러리

            fs = require('fs');
            fs.writeFile(filename, data, [encoding], [callback])


        본문 사용

            data/${title}에 .txt를 붙인 이유

                기존 예제에서는 파일에 확장자가 없었으나,
                    내가 작성한 코드에는 확장자를 모두 .txt로 붙임

                이런 코드 없애고 싶을 경우, str.split('.') 하고
                    if(str[length-1] === txt) 같은 조건절로 파일 리스트 정리하면 되지 않을까

            fs.writeFile(`data/${title}.txt`, description,'utf8', function(err){
                if(err) return console.log(err);

                response.writeHead(302, {Location: `/?id=${title}`});
                response.end(description);
            })

    
    리다이렉션

        response.writeHead(헤더, 리다이렉션 주소);

            response.writeHead(302, {Location: `/?id=${title}`});

                301 : 영구 이동

                302 : 임시 이동

*/