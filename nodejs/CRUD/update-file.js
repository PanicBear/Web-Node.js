var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

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
                    var list = templateList(filelist);
                    var template = templateHTML(
                        title,
                        list,
                        `<h2>${title}</h2>${description}`,
                        `<a href="/create">create</a>`);    // update는 카테고리 선택 창에서만 뜨기에 제외
                    response.writeHead(200);
                    response.end(template);
                });
            });
        } else {
            fs.readdir('./data', function (error, filelist) {   // 특정 카테고리 선택된 페이지
                fs.readFile(`./data/${queryData.id}`, 'utf8', function (err, description) {
                    var title = queryData.id.slice(0, -4);
                    var list = templateList(filelist);
                    var template = templateHTML(
                        title,
                        list,
                        `<h2>${title}</h2>${description}`,
                        `<a href="/create">create</a> <a href="/update?id=${queryData.id}">update</a>`);   // 신규 카테고리 수정과 선택된 카테고리 수정을 모두 지원 
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
    } else if (pathname === '/update') {
        fs.readdir('./data', function (error, filelist) {   // 특정 카테고리 선택된 페이지
            fs.readFile(`./data/${queryData.id}`, 'utf8', function (err, description) {
                var title = queryData.id.slice(0, -4);
                var list = templateList(filelist);
                var template = templateHTML(
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
                    `<a href="/create">create</a> <a href="/update?id=${queryData.id}">update</a>`);
                response.writeHead(200);
                response.end(template);
            });
        });
    } else if (pathname === '/update_process') {
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
            var id = pst.id;                        // 기존 create_process의 코드를 재활용, 단 구분 위한 id 추가
            var title = post.title;
            var description = post.description;

            fs.rename(`data/${id}`, `data/${title}`, function(error){
                response.writeHead(302, {Location: `/?id={title}`});
                response.end();
            })


            console.log(post);
            

            /* fs.writeFile(`data/${title}.txt`, description, 'utf8', function (err) {
                if (err) return console.log(err);

                response.writeHead(302, { Location: `/?id=${title}.txt` });   // 헤더, 리다이렉션 주소
                response.end(description);
            }) */
        });
    } else {
        response.writeHead(404);
        response.end('Not found');
    }
});
app.listen(3000);

// body 중간에 a태그 생성(글 생성용 create)
function templateHTML(title, list, body, control) {
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

    신규 카테고리 수정과 선택된 카테고리 수정을 모두 지원


    수정 시 고려사항

        title과 description을 변경하는데, title이 변경되면 변경할 파일의 대상을 가리키는 내용 또한 변경되어 없어짐.

            inputtype="hidden"으로 보이지 않는 입력창을 함께 생성하여, 수정 대상을 사전 지정

*/