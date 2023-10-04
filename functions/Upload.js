const UPLOAD_CREDENTIALS = "upload_credentials";
const IDENTIFYING_VAL = "identifying_val";
const IDENTIFYING_PROP = "identifying_prop";

const TOOLTIP_HEADER_COMMENTED_PROP_UPLOAD_ABSPATH = "Define absolute paths of files for each row to be uploaded.";
const TOOLTIP_HEADER_COMMENTED_PROP_UPLOAD_STATUS = "Shows status of uploading.";
const TOOLTIP_HEADER_COMMENTED_PROP_UPLOAD_CMD = 'Shows "aws s3api" command line to manually upload local files.';

function openUploadSidebar() {
  var sheet = getCurrentSheet();

  if ( !findColumnByHeaderValue(sheet, HEADER_COMMENTED_PROP_UPLOAD_ABSPATH)
    || !findColumnByHeaderValue(sheet, HEADER_COMMENTED_PROP_UPLOAD_STATUS) ) {
    if (alertBoxOkCancel(
      "To use file uploading, please add the following commented columns to the header and try again:\n\n"
      + `${HEADER_COMMENTED_PROP_UPLOAD_ABSPATH} : ${TOOLTIP_HEADER_COMMENTED_PROP_UPLOAD_ABSPATH}\n`
      + `${HEADER_COMMENTED_PROP_UPLOAD_STATUS} : ${TOOLTIP_HEADER_COMMENTED_PROP_UPLOAD_CMD}\n\n`
      + "Would you like to add them automatically to the sheet?"
    )) {
      insertColumnLeftmostWithHeadersAndTooltips(
        sheet,
        [HEADER_COMMENTED_PROP_UPLOAD_ABSPATH, HEADER_COMMENTED_PROP_UPLOAD_STATUS],
        [TOOLTIP_HEADER_COMMENTED_PROP_UPLOAD_ABSPATH, TOOLTIP_HEADER_COMMENTED_PROP_UPLOAD_STATUS],
      );
    }
    return;
  }

  var html = HtmlService.createTemplateFromFile("UploaderSideBar.html");
  var htmlOutput = html
    .evaluate();

  SpreadsheetApp.getUi().showSidebar(htmlOutput);
}

function getUploadCredentialsFromFileId(fileId) {
  var endPoint = getEndpoint();

  var url = `${endPoint}/${fileId}@@upload?format=json&frame=object`;
  var response = restGet(url);
  var error = response.getResponseCode();

  if (error === 200) {
    var responseJson = JSON.parse(response.getContentText());
    return responseJson["@graph"][0]["upload_credentials"];

  } else {
    Logger.log(`HTTP error ${error}: Failed to get upload credentials from endpoint ${endPoint} for file ID ${fileId}`);
  }
}

function getUploadCredentialsFromIdentifyingVal(identifyingVal) {
  var fileId = `files/${identifyingVal}/`;
  return getUploadCredentialsFromFileId(fileId);
}

function getFileStatusAndErrorFromFileId(fileId) {
  var endPoint = getEndpoint();

  var url = `${endPoint}/${fileId}?format=json&frame=object`;
  var response = restGet(url);
  var error = response.getResponseCode();

  if (error === 200) {
    var responseJson = JSON.parse(response.getContentText());
    var status = responseJson["status"];
    var contentError = status === "content error" ? responseJson["content_error_detail"]: null;

    return {status: status, contentError: contentError};

  } else {
    Logger.log(`HTTP error ${error}: Failed to get status and content_error from endpoint ${endPoint} for file ID ${fileId}`);
  }
}

function getFileStatusAndErrorFromIdentifyingVal(identifyingVal) {
  var fileId = `files/${identifyingVal}/`;
  return getFileStatusAndErrorFromFileId(fileId);
}

function initUpload() {
  if (!checkProfile()) {
    return;
  }

  var sheet = getCurrentSheet();
  var profile = getProfile(getProfileName(), getEndpoint());

  // check if identifying property exists
  if (profile["identifyingProperties"]
    .filter(prop => findColumnByHeaderValue(sheet, prop))
    .length === 0) {
    alertBox(
      `Couldn't find an identifying property (${profile["identifyingProperties"].join(",")}) in header row ${HEADER_ROW}\n\n` +
      `Add a proper identifying property to the header row and define it for each data row to retrieve from the portal.`
    );
    return;
  }

  const numData = getNumMetadataInSheet(sheet);
  var results = [];

  for (var row = HEADER_ROW + 1; row <= numData + HEADER_ROW; row++) {
    var json = rowToJson(
      sheet, row, keepCommentedProps=true, bypassGoogleAutoParsing=true,
    );

    // if row is hidden, then skip
    if (isRowHidden(sheet, row)) {
      continue;
    }
    // if has #skip and it is 1 then skip
    if (json.hasOwnProperty(HEADER_COMMENTED_PROP_SKIP)) {
      if (toBoolean(json[HEADER_COMMENTED_PROP_SKIP])) {
        continue;
      }
    }
    var [identifyingProp, identifyingVal, identifyingCol] =
      findIdentifyingPropValColInRow(sheet, row, profile);

    if (!identifyingProp || !identifyingVal) {
      json[HEADER_COMMENTED_PROP_UPLOAD_STATUS] = "Missing identifying value (e.g. accession, uuid).";
      writeJsonToRow(sheet, json, row);
      continue;
    }

    // check status of file
    var {status, contentError} = getFileStatusAndErrorFromIdentifyingVal(identifyingVal);

    // prevent re-uploading to a released object
    if (status == "released") {
      json[HEADER_COMMENTED_PROP_UPLOAD_STATUS] = "error: uploading to a released accession is not allowed.";
      writeJsonToRow(sheet, json, row);
      continue;
    }

    var uploadAbsPathCol = findColumnByHeaderValue(sheet, HEADER_COMMENTED_PROP_UPLOAD_ABSPATH);
    var uploadAbsPath = uploadAbsPathCol ? getCellValue(sheet, row, uploadAbsPathCol) : undefined;

    if (!uploadAbsPath) {
      json[HEADER_COMMENTED_PROP_UPLOAD_STATUS] = `Missing ${HEADER_COMMENTED_PROP_UPLOAD_ABSPATH}.`;
      writeJsonToRow(sheet, json, row);
      continue;
    }

    // get upload credentials from portal
    var uploadCredentials = getUploadCredentialsFromIdentifyingVal(identifyingVal);
    if (!uploadCredentials) {
      json[HEADER_COMMENTED_PROP_UPLOAD_STATUS] = "Failed to get upload credentials.";
      writeJsonToRow(sheet, json, row);
      continue;
    }
    const accessKeyId = uploadCredentials["access_key"];
    const secretAccessKey = uploadCredentials["secret_key"];
    const sessionToken = uploadCredentials["session_token"];
    const [,,bucket,] = uploadCredentials["upload_url"].split("/");
    const key = uploadCredentials["upload_url"].split("/").splice(3).join("/");

    // to report status on both sheet and upload sidebar
    // this json object will be passed to the upload sidebar
    if (contentError) {
      json[HEADER_COMMENTED_PROP_UPLOAD_STATUS] = `status: ${status}: ${contentError}.`;
    } else {
      json[HEADER_COMMENTED_PROP_UPLOAD_STATUS] = `status: ${status}.`;
    }
    writeJsonToRow(sheet, json, row);

    // additional info to be passed to sidebar
    json[UPLOAD_CREDENTIALS] = uploadCredentials;
    json[IDENTIFYING_VAL] = identifyingVal;
    json[IDENTIFYING_PROP] = identifyingProp;
    results.push(json);
  }

  return [sheet.getName(), JSON.stringify(results)];
}

function updateStatusOnSheet(sheetName, identifyingProp, identifyingVal, status) {
  var sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  var identifyingCol = findColumnByHeaderValue(sheet, identifyingProp);
  var uploadStatusCol = findColumnByHeaderValue(sheet, HEADER_COMMENTED_PROP_UPLOAD_STATUS);
  var skipCol = findColumnByHeaderValue(sheet, HEADER_COMMENTED_PROP_SKIP);

  const numData = getNumMetadataInSheet(sheet);

  for (var row = HEADER_ROW + 1; row <= numData + HEADER_ROW; row++) {
    if (isRowHidden(sheet, row) || skipCol && toBoolean(getCellValue(sheet, row, skipCol))) {
      continue;
    }
    if (getCellValue(sheet, row, identifyingCol) == identifyingVal) {
      writeToCell(sheet, row, uploadStatusCol, status);
    }
  }
}

function generateS3UploadCmd() {
  if (!checkProfile()) {
    return;
  }

  var sheet = getCurrentSheet();

  if ( !findColumnByHeaderValue(sheet, HEADER_COMMENTED_PROP_UPLOAD_ABSPATH)
    || !findColumnByHeaderValue(sheet, HEADER_COMMENTED_PROP_UPLOAD_CMD) ) {
    if (alertBoxOkCancel(
      "To use file uploading, please add the following commented columns to the header and try again:\n\n"
      + `${HEADER_COMMENTED_PROP_UPLOAD_ABSPATH} : ${TOOLTIP_HEADER_COMMENTED_PROP_UPLOAD_ABSPATH}\n`
      + `${HEADER_COMMENTED_PROP_UPLOAD_CMD} : ${TOOLTIP_HEADER_COMMENTED_PROP_UPLOAD_CMD}\n\n`
      + "Would you like to add them automatically to the sheet?"
    )) {
      insertColumnLeftmostWithHeadersAndTooltips(
        sheet,
        [HEADER_COMMENTED_PROP_UPLOAD_ABSPATH, HEADER_COMMENTED_PROP_UPLOAD_CMD],
        [TOOLTIP_HEADER_COMMENTED_PROP_UPLOAD_ABSPATH, TOOLTIP_HEADER_COMMENTED_PROP_UPLOAD_CMD],
      );
    }
    return;
  }

  var profile = getProfile(getProfileName(), getEndpoint());

  // check if identifying property exists
  if (profile["identifyingProperties"]
    .filter(prop => findColumnByHeaderValue(sheet, prop))
    .length === 0) {
    alertBox(
      `Couldn't find an identifying property (${profile["identifyingProperties"].join(",")}) in header row ${HEADER_ROW}\n\n` +
      `Add a proper identifying property to the header row and define it for each data row to retrieve from the portal.`
    );
    return;
  }

  const numData = getNumMetadataInSheet(sheet);
  var results = [];

  for (var row = HEADER_ROW + 1; row <= numData + HEADER_ROW; row++) {
    var json = rowToJson(
      sheet, row, keepCommentedProps=true, bypassGoogleAutoParsing=true,
    );

    // if row is hidden, then skip
    if (isRowHidden(sheet, row)) {
      continue;
    }
    // if has #skip and it is 1 then skip
    if (json.hasOwnProperty(HEADER_COMMENTED_PROP_SKIP)) {
      if (toBoolean(json[HEADER_COMMENTED_PROP_SKIP])) {
        continue;
      }
    }
    var [identifyingProp, identifyingVal, identifyingCol] =
      findIdentifyingPropValColInRow(sheet, row, profile);

    // check status of file
    var {status, contentError} = getFileStatusAndErrorFromIdentifyingVal(identifyingVal);

    // prevent re-uploading to a released object
    if (status == "released") {
      json[HEADER_COMMENTED_PROP_UPLOAD_STATUS] = "error: uploading to a released accession is not allowed.";
      writeJsonToRow(sheet, json, row);
      continue;
    }

    var uploadAbsPathCol = findColumnByHeaderValue(sheet, HEADER_COMMENTED_PROP_UPLOAD_ABSPATH);
    var uploadAbsPath = uploadAbsPathCol ? getCellValue(sheet, row, uploadAbsPathCol) : undefined;

    if (!uploadAbsPath) {
      json[HEADER_COMMENTED_PROP_UPLOAD_STATUS] = `Missing ${HEADER_COMMENTED_PROP_UPLOAD_ABSPATH}.`;
      writeJsonToRow(sheet, json, row);
      continue;
    }

    // get upload credentials from portal
    var uploadCredentials = getUploadCredentialsFromIdentifyingVal(identifyingVal);
    if (!uploadCredentials) {
      json[HEADER_COMMENTED_PROP_UPLOAD_STATUS] = "Failed to get upload credentials.";
      writeJsonToRow(sheet, json, row);
      continue;
    }
    const accessKeyId = uploadCredentials["access_key"];
    const secretAccessKey = uploadCredentials["secret_key"];
    const sessionToken = uploadCredentials["session_token"];
    const [,,bucket,] = uploadCredentials["upload_url"].split("/");
    const key = uploadCredentials["upload_url"].split("/").splice(3).join("/");

    const cmd =
      `AWS_ACCESS_KEY_ID="${accessKeyId}" AWS_SECRET_ACCESS_KEY="${secretAccessKey}" AWS_SESSION_TOKEN="${sessionToken}" ` +
      `aws s3api put-object --bucket "${bucket}" --key "${key}" --body "${uploadAbsPath}"`;
    json[HEADER_COMMENTED_PROP_UPLOAD_CMD] = cmd;

    writeJsonToRow(sheet, json, row);
  }

}
