var _ = require('underscore');
var util = require('util');
var path = require('path');
var shell = require('shelljs/global');
var fileFinder = require('./app/FileFinder.js');

var targetDirectory = '/Volumes/Public/hard-disks/_sorted_and_keep/Pictures';
var sourceDirectory = '/Volumes/Public/hard-disks/_to_merge_01';
//var targetDirectory = '/home/ubuntu/workspace/node_modules';
//var sourceDirectory = '/home/ubuntu/workspace/node_modules-copy-1';

var targetFiles;
var sourceFiles;

// wait for 2 foundFiles() calls (one for target, one for source)
var foundFiles = _.after(2, checkFiles);

fileFinder.findFiles(targetDirectory, function(err, files) {
    if (err) return handleError(err);
    targetFiles = files;
    foundFiles();
});
fileFinder.findFiles(sourceDirectory, function(err, files) {
    if (err) return handleError(err);
    sourceFiles = files;
    foundFiles();
});

function checkFiles() {
    // build some lookups hashes
    var targetLookup = {};
    targetFiles.forEach(function(file) {
        targetLookup[file.relativePath] = file;
    });
    var sourceLookup = {};
    sourceFiles.forEach(function(file) {
        sourceLookup[file.relativePath] = file;
    });

    // check each source file (we'll deal with duplicates in the target
    // directory later)
    var newSourceFiles = [];
    var newerSourceFiles = [];
    var differentNotNewerSourceFiles = [];
    var duplicates = [];
    for (var sourceKey in sourceLookup) {
        var source = sourceLookup[sourceKey];
        var target = targetLookup[sourceKey];
        if (target === undefined) {
            newSourceFiles.push(source);
        }
        else if (source.modified > target.modified) { // could add some tolerance
            newerSourceFiles.push(source);
        }
        else if (source.size != target.size) {
            differentNotNewerSourceFiles.push(source);
        }
        else {
            duplicates.push(source);
        }
    }

    duplicates.forEach(function(file) {
        console.log('DUPLICATE OR OLDER:       ' + file.path);
        // no-op, could check sizes are the same
    });
    
    var targetDirectoryHash = {};
    var i = 1;
    newSourceFiles.forEach(function(file) {
        console.log('NEW: ' + i++ + ' / ' + newSourceFiles.length + ' - ' + file.path);
        // new so copy

        // if haven't checked this directory already then ensure it exists
        var sourceFile = sourceDirectory + '/' + file.relativePath;
        var targetFile = targetDirectory + '/' + file.relativePath;
        var targetFileDirectory = path.dirname(targetFile);
        if (!targetDirectoryHash[targetFileDirectory]) {
            mkdir('-p', targetFileDirectory);
            targetDirectoryHash[targetFileDirectory] = true;
        }

        // now copy the file knowing the directory exists
        cp(sourceFile, targetFile);
    });

    i = 1;
    newerSourceFiles.forEach(function(file) {
        console.log('NEWER: ' + i++ + ' / ' + newerSourceFiles.length + ' - ' + file.path);
        // newer so copy

        // directory will exist, so just copy the file over
        var sourceFile = sourceDirectory + '/' + file.relativePath;
        var targetFile = targetDirectory + '/' + file.relativePath;
        cp(sourceFile, targetFile);
    });

    differentNotNewerSourceFiles.forEach(function(file) {
        console.log('DIFFERENT (MANUAL CHECK): ' + file.path);
        // manually check
    });
}

function handleError(err) {
    console.log('ERROR: ' + err);
}
