var path = require('path');
var fileFinder = require('./app/FileFinder.js');

var directory = '/home/ubuntu/workspace';

fileFinder.findFiles(directory, function(err, files) {
    if (err) return handleError(err);
    findDuplicateFiles(files);
});

function findDuplicateFiles(files) {
    console.log('Finding duplicates in ' + files.length + ' files');
    var hash = { };
    var haveFile = { };
    files.forEach(function(file) {
        var key = path.basename(file.path) + '_' + file.size;// + '_' + file.modified.toISOString();
        if (!haveFile[key]) {
            hash[key] = [ file ];
            haveFile[key] = true;
        }
        else {
            hash[key].push(file);
        }
    });

    var keys = Object.keys(hash);
    console.log('Found distinct file names: ' + keys.length);
    keys.forEach(function(key) {
        console.log('KEY #: ' + hash[key].length + ',  BASE: ' + key);
    });
}

function handleError(err) {
    console.log('ERROR: ' + err);
}
