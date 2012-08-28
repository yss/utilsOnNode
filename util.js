/**
 * 通用组件
 * 基于Nodejs V0.8+
 */

var fs = require('fs'),
    path = require('path');

var RED_COLOR = "\033[31m",
    GREEN_COLOR = "\033[32m",
    BLUE_COLOR = "\033[34m",
    MAGENTA_COLOR = "\033[35m",
    RESET_COLOR = "\033[0m";


/**
 * @description: 判断一个给定路径是否是一个目录（注明：软链的路径对应为一个目录时也返回true）
 * @param: {String} pathname 文件完整目录 如：/home/yansong/workspace/git/rest
 * @return {Boolean}
 */
var isDirectory = exports.isDirectory = function(pathname) {
    if (pathname && fs.existsSync(pathname)) {
        return fs.statSync(pathname).isDirectory();
    }
    return false;
};

/**
 * @description:根据给定的路径，查找是否存在给定文件夹
 * @param: {String} pathname 文件完整目录 如：/home/yansong/workspace/git/rest
 * @param: {String} dirname 文件夹名
 * @param: {String} <option> direction 查找方向 up | down，默认是全部
 * @return {String | Boolean}
 */
var findDiretory = exports.findDirectory = function(pathname, dirname, direction) {
    if (pathname && isDirectory(pathname)) {
        if (direction === undefined) {
            return findUp(pathname, dirname) || findDown(pathname, dirname);
        } else if (direction === 'up') {
            return findUp(pathname, dirname);
        } else if (direction === 'down') {
            return findDown(pathname, dirname);
        }
    }
    function findUp (pname, dname) {
        while(pname && pname !== '/') {
            if (isDirectory(path.join(pname, dname))) {
                return path.join(pname, dname);
            }
            pname = path.dirname(pname);
        }
        return false;
    }

    function findDown (pname, dname) {
        if (isDirectory(path.join(pname, dname))) {
            return path.join(pname, dname);
        } else {
            var files = fs.readdirSync(pname),
                len = files.length;
            while(len--) {
                if (fs.statSync(path.join(pname, files[len])).isDirectory()) {
                    var status = findDown(path.join(pname, files[len]), dname);
                    if (status) return status;
                }
            }
        }
    }
    return false;
};

/**
 * @description: 展现给出特殊类型，或者说带颜色的信息
 * @param {Number|String} type 类型，当为Number时，有错误，正确以及提示信息。当为String时，默认为自己指定颜色
 * @param {Array} msg 信息
 * @param {String} <option> method 输出方式: log, info, error
 * @return
 */
var showMsg = exports.showMsg = function(type, msg, method) {
    var color;
    method = method || 'log';
    switch(type) {
        case 0:
            color = GREEN_COLOR;
            break;
        case 1:
            color = RED_COLOR;
            method = 'error';
            break;
        case 2:
            color = BLUE_COLOR;
            method = 'info';
            break;
        default:
            color = typeof type === 'string' ? type : '';
    }
    console[method](color, Array.prototype.slice.call(msg, 0).join(' '), RESET_COLOR);
}

/**
 * @description:输出正确信息，可以传任意个字符串参数
 * @param [{String}, {String}, ... ]
 * @return
 */
exports.log = function() {
    showMsg(0, arguments);
}

/**
 * @description:输出错误信息，可以传任意个字符串参数
 * @param [{String}, {String}, ... ]
 * @return
 */
exports.error = function() {
    showMsg(1, arguments);
};

/**
 * @description:输出提示信息，可以传任意个字符串参数
 * @param [{String}, {String}, ... ]
 * @return
 */
exports.info = function() {
    showMsg(2, arguments);
}
