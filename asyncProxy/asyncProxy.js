var events =  require("events"),
    util = require('util');

/**
 * 异步代理函数，至少需要三个参数，分别是evt1, evt2, callback
 * @param {String} evt1
 * @param {String} evt2
 * @param ...
 * @param {String} evtn
 * @param {Function} callback
 */
var AsyncProxy = module.exports = function(){
    var len = arguments.length;

    // 三个以上参数才符合我们的预期，也就是异步执行代码前提。
    if (len < 3) {
        console.log('至少需要三个参数，分别是：evt1, evt2, callback');
        return;
    }
    events.EventEmitter.call(this);

    this.init([].slice.call(arguments, 0));
};

//AsyncProxy.prototype = events.EventEmitter.prototype;
// 采用nodejs里的官方例子写法
util.inherits(AsyncProxy, events.EventEmitter);

// 初始化函数
AsyncProxy.prototype.init = function(args) {
    var _this = this;
    this.callback = args.pop();
    var len = args.length;
    this.args = new Array(len);
    this.len = len;

    // max size limit
    if (len > 10) {
        this.setMaxListeners(len);
    }

    args.forEach(function(item, i) {
        _this.on(item, function(data) {
            _this.args[i] = data;
            if (!--_this.len) {
                this.callback.apply(_this, _this.args);
            }
        });
    });
};

