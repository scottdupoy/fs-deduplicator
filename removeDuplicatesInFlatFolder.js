var _ = require('underscore');
var util = require('util');
var path = require('path');
var shell = require('shelljs/global');
var fileFinder = require('./app/FileFinder.js');

var dryRun = process.argv.length < 3 || process.argv[2] != "force";
console.log((dryRun ? 'DRY' : 'LIVE') + ' RUN');

// work through all files in final dirs
var finalDirectory = "/Users/scott/Pictures/13_2010";

// files are being put in here with no directory hierarchy
var flatDirectory = '/Users/scott/Pictures_to_sort_flat/london';

// somewhere to keep the files
var finalFiles;
var flatFiles;


// wait for 2 foundFiles() calls (one for target, one for source)
var foundFiles = _.after(2, checkFiles);

fileFinder.findFiles(finalDirectory, function(err, files) {
    if (err) return handleError(err);
    finalFiles = files;
    foundFiles();
});
fileFinder.findFiles(flatDirectory, function(err, files) {
    if (err) return handleError(err);
    flatFiles = files;
    foundFiles();
});


function checkFiles() {
    var totalFlatFileCount = 0;
    var removedFlatFileCount = 0;
    var checkedCount = 0;

    console.log('Check file lists');
    console.log();

    // build a flat file lookup table.
    var flatFilesLookup = {};
    flatFiles.forEach(function(file) {
        flatFilesLookup[path.basename(file.path)] = file;
        totalFlatFileCount++;
    });

    // iterate over final files and see if any in the flat file directory match it
    finalFiles.forEach(function(finalFile) {

        // filter out a load of junk
        if (finalFile.path.indexOf("Thumbs.db") != -1
            || finalFile.path.indexOf(".DS_Store") != -1
            || finalFile.path.indexOf(".AppleDouble") != -1) {
            return;
        }

        checkedCount++;

        // is there a flat file basename that matches?
        var flatFile = flatFilesLookup[path.basename(finalFile.path)];
        if (flatFile !== undefined) {
            if (flatFile.size == finalFile.size) {
                console.log('REMOVE: ' + flatFile.path + '   =>  ' + finalFile.path);
                if (!dryRun) {
                    rm(flatFile.path);
                }
                removedFlatFileCount++;
            }
            else {
                //console.log('NAME CLASH: ' + finalFile.path);
            }
        }
    });

    // log summary results
    console.log();
    console.log('removed flat file count:  ' + removedFlatFileCount);
    console.log('total flat file count:    ' + totalFlatFileCount);
    console.log();
    console.log('checked final file count: ' + checkedCount);
}

function handleError(err) {
    console.log('ERROR: ' + err);
}
