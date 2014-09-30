var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var util = require('util');

module.exports.findFiles = function(directory, callback) {
    recursiveFindFiles(directory, [], callback);
};

function recursiveFindFiles(directory, results, callback) {
    fs.readdir(directory, function(err, files) {
        if (err) return callback(err);

        // completion callbacks
        var finishedLevel = _.after(files.length, function() {
            callback(err, results);
        });

        // iterate asynchronously over each file, _.after will co-ordinate
        // callback call at the end
        files.forEach(function(file) {
            var fullFilePath = path.join(directory, file);
            fs.stat(fullFilePath, function(err, stat) {
                if (err) return callback(err);
                if (stat.isDirectory()) {
                    recursiveFindFiles(fullFilePath, results, finishedLevel);
                }
                else {
                    var key = '';
                    results.push({ path: fullFilePath, directory: directory, name: file, stat: stat });
                    finishedLevel();
                }
            });
        });
    });
}
