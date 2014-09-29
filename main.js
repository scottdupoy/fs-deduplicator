var _ = require('underscore');
var fs = require('fs');
var path = require('path');

var targetDir = '/Users/scott/code/_tmp';

var recursiveReadFiles = function(directory, results, callback) {
    fs.readdir(directory, function(err, files) {
        if (err) return callback(err);

        // completion callbacks
        var finishedLevel = _.after(files.length, callback);

        // iterate asynchronously over each file, _.after will co-ordinate
        // callback call at the end
        files.forEach(function(file) {
            var fullFilePath = path.join(directory, file);
            fs.stat(fullFilePath, function(err, stat) {
                if (err) return callback(err);
                if (stat.isDirectory()) {
                    recursiveReadFiles(fullFilePath, results, finishedLevel);
                }
                else {
                    results.push(fullFilePath);
                    finishedLevel();
                }
            });
        });
    });
};

var results = [ ];
recursiveReadFiles(targetDir, results, function(err, files) {
    if (err) {
        console.log('ERROR: ' + err);
        return;
    }
    results.forEach(function(file) {
        console.log(file);
    });
});
