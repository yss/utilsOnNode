var util = require('../util'),
    path = require('path'),
    currPath = path.dirname(process.cwd());
console.log('util.isDirectory(path.join(currPath, "compressPic")): ', util.isDirectory(currPath, "compressPic"));

console.log('util.findDirectory(currPath, "pic")', util.findDirectory(currPath, "pic"));

console.log('util.findDirectory(currPath, "Desktop")', util.findDirectory(currPath, "Desktop"));
