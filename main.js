var _ = require('underscore');
var util = require('util');
var fileFinder = require('./app/FileFinder.js');

var targetDirectory = '/Volumes/Public/hard-disks/_sorted_and_keep/Pictures/13_2010';
var sourceDirectory = '/Volumes/Public/hard-disks/_to_merge_01/13_2010';

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
    // compile some lookups hashes
    console.log('-----------------------------------------------------');
    var targetLookup = {};
    targetFiles.forEach(function(file) {
        file.key = file.path.replace(targetDirectory, '');
        targetLookup[file.key] = file;
    });
    var sourceLookup = {};
    sourceFiles.forEach(function(file) {
        file.key = file.path.replace(sourceDirectory, '');
        sourceLookup[file.key] = file;
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
        else if (source.stat.mtime > target.stat.mtime) {
            newerSourceFiles.push(source);
        }
        else if (source.stat.size != target.stat.size) {
            differentNotNewerSourceFiles.push(source);
        }
        else {
            duplicates.push(source);
        }
    }
    
    newSourceFiles.forEach(function(file) {
        console.log('NEW: ' + file.path);
        // new so copy
    });
    console.log();
    newerSourceFiles.forEach(function(file) {
        console.log('NEWER: ' + file.path);
        // newer so copy
    });
    console.log();
    differentNotNewerSourceFiles.forEach(function(file) {
        console.log('DIFFERENT (MANUAL CHECK): ' + file.path);
        // manually check
    });
    console.log();
    duplicates.forEach(function(file) {
        console.log('DUPLICATE: ' + file.path);
        // no-op
    });
}

function handleError(err) {
    console.log('ERROR: ' + err);
}
