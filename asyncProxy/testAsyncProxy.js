var asyncProxy = require('./asyncProxy');
function testProxy() {
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
}

// testProxy();

function testWait() {
    var ap = new asyncProxy();
    var ready = true;
    function testWait(callback) {
        ap.wait('test', callback);
        if (ready) {
            ready = false;
            setTimeout(function(){
                // ap.emit('test', arguments);
                function a() {
                    ap.emit('test', arguments);
                    console.log(arguments);
                }
                a(10,20);
                ready = true;
            }, 100);
        }
    }

    function runWaitTest() {
        var arr = [1,2,3,4,5];
        arr.forEach(function(item) {
            testWait(function(data1, data2) {
                console.log(item, data1, data2);
            })
        });
    }

    runWaitTest();

}

testWait();
