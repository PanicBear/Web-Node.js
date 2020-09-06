var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
const { throws } = require('assert');

var template = {
// body 중간에 a태그 생성(글 생성용 create)
    html: function (title, list, body, control) {
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
      ${control}
      ${body}
    </body>
    </html>
    `;}, 
    list(filelist) {
        var list = '<ul>';
        var i = 0;
    
        while (i < filelist.length) {
            list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i].slice(0, -4)}</a></li>`;
            i = i + 1;
        }
        list = list + '</ul>';
        return list;
    }
}

var app = http.createServer(function (request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if (pathname === '/') {
        if (queryData.id === undefined) {   // 홈 디렉토리
            fs.readdir('./data', function (error, filelist) {
                fs.readFile(`./data/${queryData.id}`, 'utf8', function (err, description) {
                    var title = 'Welcome';
                    var description = 'Hello, Node.js'
                    var list = template.list(filelist);
                    var html = template.html(
                        title,
                        list,
                        `<h2>${title}</h2>${description}`,
                        `<a href="/create">create</a>`);    // update는 카테고리 선택 창에서만 뜨기에 제외
                    response.writeHead(200);
                    response.end(html);
                });
            });
        } else {
            fs.readdir('./data', function (error, filelist) {   // 특정 카테고리 선택된 페이지
                fs.readFile(`./data/${queryData.id}`, 'utf8', function (err, description) {
                    var title = queryData.id.slice(0, -4);
                    var list = template.list(filelist);
                    var html = template.html(
                        title,
                        list,
                        `<h2>${title}</h2>${description}`,
                        `<a href="/create">create</a> 
                        <a href="/update?id=${queryData.id}">update</a>
                        <form action="delete_process" method="post">
                            <input type="hidden" name="id" value="${title}">
                            <input type="submit" value=delete>
                        </form>`);   // 삭제 버튼 추가
                    response.writeHead(200);
                    response.end(html);
                });
            });
        }
    } else if (pathname === '/create') {
        fs.readdir('./data', function (err, filelist) {
            var title = 'Web - create'
            var list = template.list(filelist);
            var html = template.html(title, list, `
            <form action="/create_process" method="post">
              <p><input type="text" name="title" placeholder="title"></p>
              <p>
                <textarea name="description" placeholder="description"></textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
          `, '');   // update 코드는 필요없으니 공백만
            response.writeHead(200);
            response.end(html);
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
    } else if (pathname === '/update') {
        fs.readdir('./data', function (error, filelist) {   // 특정 카테고리 선택된 페이지
            fs.readFile(`./data/${queryData.id}`, 'utf8', function (err, description) {
                var title = queryData.id.slice(0, -4);
                var list = template.list(filelist);
                var html = template.html(
                    title,
                    list,
                    `<form action="/update_process" method="post">
                        <input type="hidden" name="id" value="${title}">
                        <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                        <p>
                            <textarea name="description" placeholder="description">${description}</textarea>
                        </p>
                        <p>
                            <input type="submit">
                        </p>
                    </form>`,
                    `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
                response.writeHead(200);
                response.end(html);
            });
        });
    } else if (pathname === '/update_process') {
        var body = '';
        request.on('data', function (data) {
            body = body + data;
        });
        request.on('end', function () {
            var post = qs.parse(body);
            var id = post.id;
            var title = post.title;
            var description = post.description;
            fs.rename(`data/${id}.txt`, `data/${title}.txt`, function (error) {
                fs.writeFile(`data/${title}.txt`, description, 'utf8', function (err) {
                    response.writeHead(302, { Location: `/?id=${title}.txt` });
                    response.end();
                })
            });
        });
    } else if (pathname === '/delete_process') {
        var body = '';
        request.on('data', function (data) {
            body = body + data;
        });
        request.on('end', function () {
            var post = qs.parse(body);
            var id = post.id;
            fs.unlink(`data/${id}.txt`, function (error) {
                if (error) {
                    console.log(error);
                    throw error;
                }
                response.writeHead(302, { Location: `/` });
                response.end();
            });
        });
    } else {
        response.writeHead(404);
        response.end('Not found');
    }
});
app.listen(3000);

/*

    

*/