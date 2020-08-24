var fs = require('fs');

// sync가 있으면 동기
// A B C

// console.log('A');
// var result = fs.readFileSync('nodejs/Sync-Async-Callback/sample.txt', 'utf-8');
// console.log(result);
// console.log('C');


// sync가 없으면 비동기
// readFile(파일경로, 인코딩 방법, 콜백)
// A C B

console.log('A');
fs.readFile('nodejs/Sync-Async-Callback/sample.txt', 'utf8', function(err,result){ // 실패 시 에러(첫 번째 파라미터), 성공 시 파일 내용(두 번째 파라미터)
    console.log(result);
})
console.log('C');


/* 
    비동기와 동기의 차이

    비동기 = 반환 값이 존재.

        var result = ~

    동기 = 콜백이 존재

        (~, ~, function(){})
*/

