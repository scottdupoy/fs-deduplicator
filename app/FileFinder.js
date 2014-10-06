var child_process = require('child_process');
var _ = require('underscore');

module.exports.findFiles = function(root, callback) {
    findFilesRecursively(root, root, [], callback);
};

function findFilesRecursively(root, directory, results, callback) {
    // using the ls command to (hopesfully) avoid calling stat on every file
    // individually. note if this was a real tool directory would be sanitised.
    // can't use shelljs because we need to capture the output, including the
    // file size and modified timestamp.
    console.log('Searching directory: ' + directory);
    var command = 'ls -lAT ' + directory;
    child_process.exec(command, function(error, stdout, stderr) {
        if (error) return callback(error);
        parseListingResults(root, directory, results, stdout, callback);
    });
}

function parseListingResults(root, directory, results, listing, callback) {
    var lines = listing.split('\n');
    var subDirectories = [];
    lines.forEach(function(line) {
        var parts = line.split(/\s+/);
        if (parts.length < 9) {
            return;
        }

        var entry = getEntry(root, directory, line);
        if (entry.isDirectory) {
            subDirectories.push(entry.relativeDirectory);
        }
        else {
            results.push(entry);
        }
    });

    if (subDirectories.length > 0) {
        // after subDirectoryCallback has been called <subDirectories.length>
        // times underscore will call the callback
        var subDirectoryCallback = _.after(subDirectories.length, function() {
            callback(null, results);
        });
        subDirectories.forEach(function(subDirectory) {
            findFilesRecursively(root, subDirectory, results, subDirectoryCallback);
        });
    }
    else {
        callback(null, results);
    }
}

function getEntry(root, directory, line) {
    var groups = /^(.)\S+\s+\S+\s+\S+\s+\S+\s+(\d+)\s+(\d+)\s+(\S+)\s+\d{2}:\d{2}:\d{2}\s(\d{4})\s+(.*)$/.exec(line);
    if (groups[1] == 'd') {
        return {
            isDirectory: true,
            relativeDirectory: directory + '/' + groups[6],
        };
    }
    var path = directory + '/' + groups[6];
    return {
        isDirectory: false,
        path: path,
        root: root,
        relativePath: path.substring(root.length + 1, path.length),
        size: parseInt(groups[2]),
        modified: new Date(groups[5], getMonth(groups[4]) - 1, groups[3]),
    };
}

function getMonth(month) {
    switch(month) {
        case 'Jan': return 1;
        case 'Feb': return 2;
        case 'Mar': return 3;
        case 'Apr': return 4;
        case 'May': return 5;
        case 'Jun': return 6;
        case 'Jul': return 7;
        case 'Aug': return 8;
        case 'Sep': return 9;
        case 'Oct': return 10;
        case 'Nov': return 11;
        case 'Dev': return 12;
        default: return 1;        
    }
}
