function testGoogleDrive() {
    var paths = [
      // "/test_submitter_attachment/aaaa/ENCFF356LFX.bed.gz",
      // "/test_submitter_attachment/aaaa/ok.tsv",
      // "/test_submitter_attachment/aaaa/file_example_TIFF_1MB.tiff",
      // "/test_submitter_attachment/aaaa/image.png",
      "/test_submitter_attachment/aaaa/mmce_1_2_1_userguide.pdf",
      // "/test_submitter_attachment/aaaa/outputs.json",
      "/test_submitter_attachment/aaaa/x.jpg",
    ];
    for (path of paths) {
      var file = getDriveFileFromPath(path);

      var mimeType = file.getMimeType();
      Logger.log(`${path}: ${mimeType}`);

      var base64EncodedStr = Utilities.base64Encode(file.getBlob().getBytes());
      Logger.log(base64EncodedStr);
    }
}
