var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
const { throws } = require('assert');

var template = require('./lib/template.js');

var app = http.createServer(function (request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if (pathname === '/') {
        if (queryData.id === undefined) {   // 홈 디렉토리
            fs.readdir('./data', function (error, filelist) {
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
        } else {
            fs.readdir('./data', function (error, filelist) {   // 특정 카테고리 선택된 페이지

                var filteredId = path.parse(queryData.id).base;

                fs.readFile(`./data/${filteredId}`, 'utf8', function (err, description) {
                    var title = queryData.id.slice(0, -4);
                    var list = template.list(filelist);

                    var sanitizedTitle = sanitizeHtml(title);
                    var sanitizedDescription = sanitizeHtml(description, {allowedTags:['h1']});

                    var html = template.html(
                        sanitizedTitle,
                        list,
                        `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
                        `<a href="/create">create</a> 
                        <a href="/update?id=${queryData.id}">update</a>
                        <form action="delete_process" method="post">
                            <input type="hidden" name="id" value="${sanitizedTitle}">
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
            var filteredId = path.parse(queryData.id).base;
            fs.readFile(`./data/${filteredId}`, 'utf8', function (err, description) {
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
            var filteredId = path.parse(id).base;
            fs.unlink(`data/${filteredId}.txt`, function (error) {
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
    입력을 통해 발생할 수 있는 보안 상의 문제

        의도치 않은 파일 읽기

            http://localhost:3000/?id=../nodejs/Security/userinfo.js와 같이

            상대 경로를 통해 사용자의 정보가 들어있는 파일에 접근할 수 있다.

                ../nodejs/Security/userinf
                module.exports = { id:'egoing', password:'111111' }


            해결방안

                path.parse를 사용하면, 해당 경로의 요소들을 객체로 나타내주기에,
                원하는 정보를 안전하게 접근 가능

                    var path = require('path');
                    path.parse('../userinfo.js');

                        {
                            root: '',
                            dir: '..',
                            base: 'userinfo.js',
                            ext: '.js',
                            name: 'userinfo'
                        }



    출력을 통해 발생할 수 있는 보안 상의 문제

        크로스 사이트 스크립팅(XSS)

            HTML로 이뤄진 웹페이지의 입력 창에서 <script> 태그와 함께 자바스크립트 코드를 사용,
            혹은 HTML 태그들을 사용하여 출력 이나 특정 코드 및 기능을 삽입

                리다이렉트, 알림, 개인정보 수집 등
            
                <script>
                    location:href = 'https://www.naver.com';
                </script>


                    
            해결방안(sanitize-html)


                - 태그로 감싸인 것을 지워버린다


                - 그대로 문자열로 출력한다(https://www.w3schools.com/html/html_entities.asp)

                    < == &lt
                    > == &gt


                - sanitize-html(sanitize = 살균하다)

                    https://www.npmjs.com/package/sanitize-html


                        var sanitizeHtml = require('sanitize-html');
 
                        var dirty = 'some really tacky HTML';
                        var clean = sanitizeHtml(dirty);


                        *** script 태그처럼 위험한 것은 아예 삭제

                            h1태그 같은 양호한 것은 태그만 날리고 출력(구버전?)

                                인줄 알았는데 지금 보니 다 날림


                    api 수정을 통해 필터링 수정 가능

                        var sanitizedDescription = sanitizeHtml(description, {allowedTags:['h1']});

    */