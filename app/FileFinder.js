var child_process = require('child_process');

module.exports.findFiles = function(directory, callback) {
    // using the find command to (hopesfully) avoid calling stat on every file
    // individually. note if this was a real tool directory would be sanitised.
    var command = 'find ' + directory + ' -type f -printf "%s,%TY-%Tm-%Td %TH:%TM:%TS,%p\n"';
    child_process.exec(command, function(error, stdout, stderr) {
        if (error) return callback(error);
        parseFindResults(directory, stdout, callback);
    });
};

function parseFindResults(directory, listing, callback) {
    var results = [];
    var lines = listing.split('\n');
    lines.forEach(function(line) {
        if (line.length === 0) {
            return;
        }
        results.push(getFileDetails(directory, line));
    });
    callback(null, results);
}

function getFileDetails(directory, line) {
    var parts = line.split(',');
    var path = getFilePath(parts);
    return {
        path: path,
        root: directory,
        relativePath: path.substring(directory.length + 1),
        size: parts[0],
        modified: getDate(parts[1]),
    };
}

function getDate(dateString) {
    var d = dateString.substring(0, 10).split('-');
    var t = dateString.substring(11, 19).split(':');
    var date = new Date(d[0], d[1] - 1, d[2], t[0], t[1], t[2]);
    return date;
}

function getFilePath(parts) {
    if (parts.length == 3) {
        return parts[2];
    }
    else {
        return parts.slice(2, parts.length).join(',');
    }
}
