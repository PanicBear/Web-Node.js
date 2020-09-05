// 값으로써의 함수
var f = function(){
  console.log(1+1);
  console.log(1+2);
}

// 값이기에 배열에 들어가는 함수
var a = [f];
a[0]();
 
// 함수를 값으로 넣은 객체와 프로퍼티로 호출
var o = {
  func:f
}
o.func();