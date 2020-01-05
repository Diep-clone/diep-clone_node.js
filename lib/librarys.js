'use strict';

exports.randomRange = function(x,y){ // x~y 사이의 랜덤 난수 생성.
    if (x>y){
        let im = x;
        x=y;
        y=im;
    }
    return Math.random() * (y-x) + x;
}

exports.findIndex = function(arr,id){ // 배열에서 id 가 똑같은 인덱스 찾기
    let len = arr.length;

    while (len--){
        if (arr[len].id === id)
        return len;
    }
    return -1;
}
