var o = {
    v1:'v1',
    v2:'v2',
    f1:function(){
        console.log(this.v1);   // 객체 이름이 변결될 수 있으니 this로 변경
    },
    f2:function(){
        console.log(this.v2);
    }

}

// function f1(){
//     console.log(o.v1);
// }

// function f2(){
//     console.log(o.v2);
// }

// f1();
// f2();

o.f1();
o.f2();