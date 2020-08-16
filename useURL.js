// 쿼리 문자열에 입력하는 정보를 출력하는 예제
// http://localhost:3000/?id=ldsfioqhtgoehgopisf

var http = require('http');
var url = require('url');

var app = http.createServer(function (request, response) {

    var _url = request.url;
    console.log('_url : ' + _url)                               // _url : /?id=ldsfioqhtgoehgopisf

    var queryData = url.parse(_url, true).query;
    console.log('queryData : ' + queryData.id);                 // queryData : ldsfioqhtgoehgopisf

    if (_url == '/') {
        _url = '/index.html';
    }
    if (_url == '/favicon.ico') {
        return response.writeHead(404);
    }
    response.writeHead(200);
    response.end(queryData.id);                                 //  /?name=~ 의 경우, queryData.name과 같이 하면 됨
})
app.listen(3000);

/*
    http://opentutorials.org:3000/main?id=HTML&page=12

    http 			    - 프로토콜(http, https, ftp)

    opentutorials.org 	- 호스트(도메인)

    3000			    - 포트번호

    main			    - 경로

    id=HTML&page=12	    - 쿼리 문자열
 */