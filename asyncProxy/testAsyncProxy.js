var asyncProxy = require('./async');
var test = 2;
var ap = new asyncProxy('a', 'b', 'c', function(a, b, c) {
    console.log(a,b,c);
    console.log(test)
});

setTimeout(function(){
    console.log('a');
    ap.emit('a', 123);
}, 300);


setTimeout(function(){
    console.log('b');
    ap.emit('b', 223);
}, 100);

setTimeout(function(){
    console.log('c');
    ap.emit('c', 323);
}, 100);
