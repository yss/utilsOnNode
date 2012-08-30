/**
 * 通用组件
 * 基于Nodejs V0.8+
 * @update
 */

var fs = require('fs'),
    path = require('path');

var RED_COLOR = "\033[31m",
    GREEN_COLOR = "\033[32m",
    YELLOW_COLOR = "\033[33m"
    BLUE_COLOR = "\033[34m",
    MAGENTA_COLOR = "\033[35m",
    DEEP_GREEN_COLOR = "\033[36m",
    RESET_COLOR = "\033[0m";


/**
 * @description 判断一个给定路径是否是一个目录（注明：软链的路径对应为一个目录时也返回true）
 * @param {String} pathname 文件完整目录 如：/home/yansong/workspace/git/rest
 * @return {Boolean}
 */
var isDirectory = exports.isDirectory = function(pathname) {
    if (pathname && fs.existsSync(pathname)) {
        return fs.statSync(pathname).isDirectory();
    }
    return false;
};

/**
 * @description 根据给定的路径，查找是否存在给定文件夹
 * @param {String} pathname 文件完整目录 如：/home/yansong/workspace/git/rest
 * @param {String} dirname 文件夹名
 * @param {String} <option> direction 查找方向 up | down，默认是全部
 * @return {String | Boolean}
 */
var findDirectory = exports.findDirectory = function(pathname, dirname, direction) {
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
 * @description 展现给出特殊类型，或者说带颜色的信息
 * @param {Number|String} type 类型，当为Number时，为错误，正确以及提示三种信息。当为String时，默认为自己指定颜色
 * @param {Array | String} msg 信息
 * @param {String} <option> method 输出方式: log, info, error
 * @return
 */
var showMsg = exports.showMsg = function(type, msg, method) {
    var color;
    msg = typeof msg === 'string' ? msg : Array.prototype.slice.call(msg).join(' ');
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
            color = YELLOW_COLOR;
            method = 'info';
            break;
        default:
            color = typeof type === 'string' ? type : '';
    }
    console[method](color, msg, RESET_COLOR);
}

/**
 * @description 输出正确信息，可以传任意个字符串参数
 * @param [{String}, {String}, ... ]
 * @return
 */
var log = exports.log = function() {
    showMsg(0, arguments);
}

/**
 * @description 输出错误信息，可以传任意个字符串参数
 * @param [{String}, {String}, ... ]
 * @return
 */
var error = exports.error = function() {
    showMsg(1, arguments);
};

/**
 * @description 输出提示信息，可以传任意个字符串参数
 * @param [{String}, {String}, ... ]
 * @return
 */
var info = exports.info = function() {
    showMsg(2, arguments);
}

/**
 * @description 用于格式化或者说解析命令行参数。支持json值参数，参考了optimist的展示方式
 *  -a 2, -a=2, --a=2 => {a:2} | -a, -a=, --a => {a:true}
 *  -a [1,2,3], --a=[1,2,3] => {a: [1,2,3]} | -a {"c":1} => {a:{"c":1}}
 *  [注明] 如果是这样的写法：-a，默认后面跟的必须boolean值或者number值才会赋予a值
 * @param {Array} 数组参数
 * @return {Object} {_: [...], 'a':1, 'c':true } “_”里的内容是一组不属于-- | - | -x 2中的其他可能参数
 */
var parseArgv = exports.parseArgv = function(args) {
    var o = {'_': []},
        i = 0,
        len = args.length,
        sp, item, tmp;

    while(i < len) {
        // 让item变成一个string
        item = '' + args[i];

        if (0 === item.indexOf('--')) {// --a --a= --a=2
            sp = item.substr(2).split('=');
            if (sp[0]) {
                o[sp[0]] = getRealValue(sp[1]);
            }
        } else if (0 === item.indexOf('-')) { // -a -a=2 -a 2
            sp = item.substr(1).split('=');
            if (sp[0]) {
                // -a 2 -> {"a": 2}
                // 首先是不存在sp[1], 然后是判断当前处理的参数不是最后一个参数
                // 最后是紧跟在－a后的不是前缀-的参数
                if (!sp[1] && (i+1 < len) && 0 !== (('' + args[i+1]).indexOf('-'))) {
                    tmp = getRealValue(args[i+1]);
                    o[sp[0]] = typeof tmp === 'string' ? true : (++i&&tmp);
                } else { // -a -a= -a=2
                    o[sp[0]] = getRealValue(sp[1]);
                }
            }
        } else { // 正常的数值
            o._.push(args[i]);
        }
        i++;
    }
    return o;
};

/**
 * 把对应的String类型的value值，转化成真实的值
 * "true" => true, "false" => false, "1" => 1, "0" => 0
 * 如果value为空，默认返回true
 * @param {String} value
 * @param {Multiple} defaultValue
 * @return {Multiple}
 */
function getRealValue(value, defaultValue) {
    value = '' + value;
    if (value === '') { // isEmpty
        return arguments.length > 1 ? defaultValue : true;
    }
    if (isNaN(value)) {
        if (value === 'true') { // isBoolean
            return true;
        } else if (value === 'false') { // isBoolean
            return false;
        } else {
            // isJSON: isArray, isObject
            if (0 === value.indexOf('{') || 0 === value.indexOf('[')) {
                try { // 支持JSON格式数据
                    value = JSON.parse(value);
                    return value;
                } catch(e) {
                    return value;
                }
            } else { // how difficult to proved your are just a string!
                return value;
            }
        }
    } else { // isNumber
        if (~value.indexOf('.')) {
            return parseFloat(value);
        } else {
            return parseInt(value);
        }
    }
}

/**
 * @description 格式化输出帮助信息
 * @param {String} moduleName 模块名
 * @param {Object} o 帮助信息 {description: '...', params: [{name: '', desc: ''}, {...}]}
 * @return
 */
exports.outputHelpInfo = function(moduleName, o) {
    showMsg(DEEP_GREEN_COLOR, moduleName);
    console.log('    ', o.description, '\n');
    showMsg(DEEP_GREEN_COLOR, 'Options:');
    o.params.forEach(function(item, i) {
        console.log(MAGENTA_COLOR, '  ', item.name, item.type ? (GREEN_COLOR + '[' + item.type + ']') : '', RESET_COLOR);
        console.log('      ', item.desc);
    });
    console.log('');
};
