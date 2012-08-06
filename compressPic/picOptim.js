/**
 *  jpg图片优化
 *  使用：node jpg.js sourceFloder receiveFloder
 *  采用了jpepoptim工具
 *
 */
var path = require('path'),
    fs = require('fs'),
    child_process = require('child_process'),
    exec = child_process.exec,
    tplCommand = 'jpegoptim --dest={r} -f -m85 --strip-com --strip-exif --strip-iptc {s}',
    sourceDir = process.argv[2] && path.resolve(process.argv[2]),
    receiveDir = process.argv[3] && path.resolve(process.argv[3]),
    jpgReg = /\.(jpg|jpeg)$/;

console.log(sourceDir, receiveDir);
if (!isDirectory(sourceDir)) {
    console.log('source dirname is require.');
    process.exit(1);
}
// 判断是否有receive文件目录，没有在sourceDir的路径创建一个**_optimize目录
if (!receiveDir) {
    receiveDir = sourceDir + '_optimize';
    console.log('Need add receiveDir:', receiveDir);
    if (!isDirectory(receiveDir)) {
        fs.mkdirSync(receiveDir);
    }
}
// 判断是否存在给定文件地址，没有则创建它
if (!isDirectory(receiveDir)) {
    console.log('mkdir:', receiveDir);
    fs.mkdirSync(receiveDir);
}

console.log('sourceDir:', sourceDir, ' receiveDir: ', receiveDir);

/**
 * @description: 优化处理函数
 * @param: dirname 文件目录的绝对路径，如：/home/ys/project/
 * @param: pathname 文件相对于要压缩的目录的路径，如：pic/
 */
function optimize(dirname, pathname) {
    fs.readdir(dirname, function(err, files) {
        if (err) {
            console.log('Readdir:', dirname, err);
            process.exit(1);
        } else {
            console.log(files);
            var l = files.length,
                filepath;
            // 空文件情况
            if (l > 0) {
                compressJpeg(dirname, pathname);
                while(l--) {
                    if (!jpgReg.test(files[l])) {
                        filepath = path.resolve(dirname, files[l]);
                        if (isDirectory(filepath)) {
                            optimize(filepath, files[l]);
                        } else {
                            console.log('No such dirname:', filepath);
                        }
                    }
                }
            }
        }
    });
}

/**
 * @description:压缩目录下所有的jpg，jpeg文件
 * @param: dirname 文件目录的绝对路径，如：/home/ys/project/
 * @param: pathname 文件相对于要压缩的目录的路径，如：pic/
 */
function compressJpeg(dirname, pathname) {
    var receive = path.resolve(receiveDir, pathname);
    if (path !== '') {
        if (!isDirectory(receive)) {
            fs.mkdirSync(receive);
        }
    }
    var data = {
        s : path.resolve(dirname, '*'),
        r : receive
    },
    command = tplCommand.replace(/{(\w+)}/g, function($0, $1) {
        return data[$1];
    });
    console.log(command)
    exec(command, function(err, stdout) {
        if (err) {
            console.log("Exec err: ", err);
            // process.exit(1);
        }
        console.log('optimize folder:', stdout);
    });
}

/**
 * @description: 是否是一个文件目录
 * @param: path 文件目录
 */
function isDirectory(path) {
    if (fs.existsSync(path)) {
        return fs.statSync(path).isDirectory();
    }
    return false;
}
optimize(sourceDir, '');
