var args = process.argv;
console.log(args);  
// args[0] = 런타임 존재 위치
// args[1] = 실행한 파일의 경로 위치
// args[2] = 입력한 값(nullable)

/* 
    node conditional.js dssergh
    
    [ 'C:\\Program Files\\nodejs\\node.exe',
    'D:\\ ~ \\~\\~\\Web-Node.js\\conditional.js', 내가지움
    'dssergh' ]
*/

// 사용자 입력 값이 '1'일 때 다르게 동작하는 코드
console.log(args[2]);  
console.log('A');
console.log('5');

if(args[2] === '1'){
    console.log('C1');
}else{
    console.log('C2');
}
console.log('D');

