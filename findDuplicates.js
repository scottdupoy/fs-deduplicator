var _ = require('underscore');
var path = require('path');
var fileFinder = require('./app/FileFinder.js');

var directories = [
    '/home/ubuntu/workspace'
];

var results = [ ];
var foundFiles = _.after(directories.length, function() {
    findDuplicateFiles(results);
});

directories.forEach(function(directory) {
    fileFinder.findFiles(directory, function(err, files) {
        if (err) return handleError(err);
        // performance drops with very large arrays, but should be okay for this
        console.log('Have results for: ' + directory);
        results = results.concat(files);
        foundFiles();
    });
});

function findDuplicateFiles(files) {
    // todo:
    //  - cyclical directories
    //  - handle links somewhere (probably in FileFinder)
    console.log('Finding duplicates in ' + files.length + ' files');
    var hash = { };
    var haveFile = { };
    files.forEach(function(file) {
        if (isFileFiltered(file)) {
            return;
        }

        var key = path.basename(file.path) + '_' + file.size;// + '_' + file.modified.toISOString();
        if (!haveFile[key]) {
            hash[key] = [ file ];
            haveFile[key] = true;
        }
        else {
            // double check that we don't have this exact file already.
            // this could happen if there were multiple, nested, directories
            // in the top-level directory list
            var fileList = hash[key];
            var fileInList = false;
            fileList.forEach(function(listFile) {
                if (file.path == listFile.path) {
                    fileInList = true;
                }
            });
            if (!fileInList) {
                hash[key].push(file);
            }
        }
    });

    var keys = Object.keys(hash);
    console.log('Found distinct, unfiltered file names: ' + keys.length);
    keys.forEach(function(key) {
        var results = hash[key];
        if (results.length > 1) {
            console.log('DUPLICATES:');
            results.forEach(function(file) {
                console.log('  ' + file.path);
            });
        }
    });
}

var filters = [
    '/.git/',
    '/.c9/'
];

function isFileFiltered(file) {
    var result = false;
    filters.forEach(function(filter) {
        if (file.path.indexOf(filter) > -1) {
            // break with an exception? return would just go to the next forEach
            result = true;
        }
    });
    return result;
}

function handleError(err) {
    console.log('ERROR: ' + err);
}
