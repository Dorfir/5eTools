
// Source - https://stackoverflow.com/a
// Posted by Vince Yuan
// Retrieved 2025-12-19, License - CC BY-SA 3.0
import https from 'node:https'
import fs from 'fs'

export function download(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = https.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};







