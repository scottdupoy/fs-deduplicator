var fileFinder = require('./app/FileFinder.js');

var targetDirectory = '/home/ubuntu/workspace/node_modules';

fileFinder.findFiles(targetDirectory, function(err, files) {
    if (err) return handleError(err);
    files.forEach(function(file) {
        console.log('path:         ' + file.path);
        console.log('root:         ' + file.root);
        console.log('relativePath: ' + file.relativePath);
        console.log('size:         ' + file.size);
        console.log('modified:     ' + file.modified.toISOString());
        console.log();
    });
});

function handleError(err) {
    console.log('ERROR: ' + err);
}
