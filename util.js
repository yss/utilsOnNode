/**
 * 通用组建
 * 基于Nodejs V0.8+
 */

var fs = require('fs'),
    path = require('path');


/**
 * @description: 判断一个给定路径是否是一个目录
 * @attr: pathname <String> 文件完整目录 如：/home/yansong/workspace/git/rest
 * @return <Object>
 */
var isDirectory = exports.isDirectory = function(pathname) {
    if (pathname && fs.existsSync(pathname)) {
        return fs.statSync(pathname).isDirectory();
    }
    return false;
};

/**
 * @description:根据给定的路径，查找是否存在给定文件夹
 * @attr: pathname <String> 文件完整目录 如：/home/yansong/workspace/git/rest
 * @attr: dirname <String> 文件夹名
 * @attr: direction <String> 查找方向 up | down，默认是全部
 * @return <String | Object>
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
