/*
 * 将所有文件中包含css: 'xxx.css'替换成：css: 'xxx.less.css'
 */
var fs = require('fs'),
    path = require('path'),
    dirname = process.argv[2] || path.dirname(process.argv[1]);

fs.readdir(dirname, function(err, files){
    if (!err) {
        var l = files.length,
            filename,
            data;
        console.log(files);
        while(l--) {
            /*
            fs.readFile(dirname+files[l], 'utf-8', function(err, data){
                if (!err) {
                    var data = data.replace(/css\: \'(\w+)\.css\'/g, function($0, $1){
                        console.log('css: \''+ $1 + '.less.css\'')
                        return 'css: \''+ $1 + '.less.css\'';
                    });
                    console.log(data);
                    fs.writeFile(dirname+files)
                } else {
                    console.log(err);
                }
            });
            */
            filename = dirname + files[l];
            data = fs.readFileSync(filename, 'utf-8');
            if (data) {
                data = data.replace(/css\: \'(\w+)\.css\'/g, function($0, $1){
                    console.log('css: \''+ $1 + '.less.css\'')
                    return 'css: \''+ $1 + '.less.css\'';
                });
                console.log(data);
                fs.writeFile(filename, data, 'utf-8');
            }
        }
    } else {
        console.log(err);
    }
});
