var _ = require('underscore');
var util = require('util');
var path = require('path');
var shell = require('shelljs/global');
var fileFinder = require('./app/FileFinder.js');

var dryRun = process.argv.length < 3 || process.argv[2] != "force";
console.log((dryRun ? 'DRY' : 'LIVE') + ' RUN');

// work through source dirs
var sourceDirectory = '/Users/scott/Pictures/_to_sort/wedding2';

// files are being put in here with no directory hierarchy
var targetDirectory = '/Users/scott/Pictures/_to_sort_flat';

// somewhere to keep the files
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
    // build a target file lookup table. so long as the target directory
    // remains a flat folder this should work fine.
    var targetLookup = {};
    targetFiles.forEach(function(file) {
        targetLookup[path.basename(file.path)] = file;
    });

    // structure to lookup moved files from. important for dry-run but makes
    // the whole thing faster for a live run.
    var movedFiles = { };
    
    // because we're flattening each file as we go along we can't be sure
    // what will be in the target flat directory at any point in time. this
    // is because some nested folders may have duplicates in them. therefore
    // we have to check each source file as we go along. dry run is
    // considerably harder to get right as a consequence.
    sourceFiles.forEach(function(sourceFile) {

        // filter out a load of junk
        if (sourceFile.path.indexOf("Thumbs.db") != -1
            || sourceFile.path.indexOf(".DS_Store") != -1
            || sourceFile.path.indexOf(".AppleDouble") != -1) {
            return;
        }

        // find out if this file was already in the target directory or if
        // we've already moved a copy of it over (remember the target is flat
        // and the source may not be so there could be nested duplicates).
        var movedDuplicate = false;
        var basename = path.basename(sourceFile.path);
        var targetFile = targetLookup[basename];
        if (targetFile === undefined) {
            // not in the target directory when we started, but have we moved
            // a copy of it over already?
            targetFile = movedFiles[basename];
            if (targetFile !== undefined) {
                movedDuplicate = true;
            }
        }

        // now we have the target file if it exists so work out what to do based
        // on its existence or its size
        if (targetFile === undefined) {
            // source file is new, move over
            console.log('NEW:                 ' + sourceFile.path);
            if (!dryRun) {
                mv(sourceFile.path, targetDirectory + '/' + basename);
            }
            movedFiles[basename] = sourceFile;
        }
        else if (sourceFile.size == targetFile.size) {
            // if name and size is the same then assume it's a duplicate. dates don't matter too much.
            if (movedDuplicate) {
                console.log('DUPLICATE (MOVED):   ' + sourceFile.path);
            }
            else {
                console.log('DUPLICATE:           ' + sourceFile.path);
            }
            if (!dryRun) {
                rm(sourceFile.path);
            }
        }
        else {
            // same file name but different size. manual intervention required.
            console.log('DIFFERENT SIZE:      ' + sourceFile.path);
        }
    });
}

function handleError(err) {
    console.log('ERROR: ' + err);
}
