
function testGoogleDrive() {
    var path = "/test_submitter_attachment/aaaa/ok.tsv";
    var file = getDriveFileFromPath(path);
    Logger.log(readDriveFile(file));
}

function readDriveFile(file) {
  return file.getBlob().getDataAsString();
}

function guessContentType(path) {
}

function getDriveFileFromPath(path) {
  var basename = getBasename(path);
  var dirname = getDirname(path);

  var folder = getDriveFolderFromPath(dirname);
  console.log(folder.getName());
  var files = folder.getFilesByName(basename);
  if (files.hasNext()) {
    return files.next();
  }
}

// code from: https://ramblings.mcpher.com/gassnippets2/finding-a-drive-app-folder-by-path/
function getDriveFolderFromPath(path) {
  return (path || "/").split(/[\\/]/).reduce( function(prev,current) {
    if (prev && current) {
      var fldrs = prev.getFoldersByName(current);
      return fldrs.hasNext() ? fldrs.next() : null;
    }
    else {
      return current ? null : prev;
    }
  },DriveApp.getRootFolder());
}
