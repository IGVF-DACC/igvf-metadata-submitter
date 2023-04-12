const HEADER_COMMENTED_PROP_UPLOAD_RELPATH = "#upload_relpath";
const HEADER_COMMENTED_PROP_UPLOAD_ERROR = "#upload_error";

const UPLOAD_CREDENTIALS = "upload_credentials";
const IDENTIFYING_VAL = "identifying_val";

function openUploadSidebar() {
  var html = HtmlService.createTemplateFromFile("UploaderSideBar.html");
  var htmlOutput = html
    .evaluate();
 
  SpreadsheetApp.getUi().showSidebar(htmlOutput);
}

function getUploadCredentialsFromFileId(fileId) {
  // ENCODE fileId "@id" example: files/ENCFF924JFB/
  // Get AWS temporary credentials from the portal  //
  // Example query: https://test.encodedcc.org/files/ENCFF924JFB/@@upload?format=json
  // {
  //   "session_token": "FwoGZXIvYXdzXXXXXXXX",
  //   "access_key": "ASIATGZNGCNX7FX362W5",
  //   "expiration": "2022-05-12T14:31:33+00:00",
  //   "secret_key": "Az8YWtmAnDKOR4/CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx",
  //   "upload_url": "s3://encode-files/2022/05/11/5f602344-9e92-4541-99ea-a397bb0ca093/ENCFF924JFB.fastq.gz",
  //   "federated_user_arn": "arn:aws:sts::220748714863:federated-user/up1652236293.410004-ENCFF924JFB",
  //   "federated_user_id": "220748714863:up1652236293.410004-ENCFF924JFB",
  //   "request_id": "730f928d-3c69-491f-9037-62bb4aa50127"
  // }
  // for file uploading, send GET request to WRITE (not READ) endpoint
  var endPoint = getEndpointWrite();

  var url = `${endpoint}/${fileId}@@upload?format=json&frame=object`;
  var response = restGet(url);
  var error = response.getResponseCode();

  if (error === 200) {
    var responseJson = JSON.parse(response.getContentText());
    return responseJson["@graph"]["upload_credentials"];

  } else {
    Logger.log(`HTTP error ${error}: Failed to get upload credentials from endpoint ${endPoint} for file ID ${fileId}`);
  }
}

function getUploadCredentialsFromIdentifyingVal(identifyingVal) {
  var fileId = `files/${identifyingVal}/`;
  return getUploadCredentialsFromFileId(fileId);
}

function initUpload(fileEntries) {
  if (!fileEntries) {
    alertBox("No file/directory dropped.");
    return;
  }
  var sheet = getCurrentSheet();
  var profile = getProfile(getProfileName(), getEndpointRead());

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
  var profileName = getProfileName();
  var endpointForProfile = getEndpointRead();
  var endpointForUpload = getEndpointWrite();

  var profile = getProfile(profileName, endpointForProfile);

  const numData = getNumMetadataInSheet(sheet);
  var numSubmitted = 0;

  for (var row = HEADER_ROW + 1; row <= numData + HEADER_ROW; row++) {
    var jsonBeforeTypeCast = rowToJson(
      sheet, row, keepCommentedProps=true, bypassGoogleAutoParsing=true,
    );

    // if row is hidden, then skip
    if (isRowHidden(sheet, row)) {
      continue;
    }
    // if has #skip and it is 1 then skip
    if (jsonBeforeTypeCast.hasOwnProperty(HEADER_COMMENTED_PROP_SKIP)) {
      if (toBoolean(jsonBeforeTypeCast[HEADER_COMMENTED_PROP_SKIP])) {
        continue;
      }
    }
    var [identifyingProp, identifyingVal, identifyingCol] =
      findIdentifyingPropValColInRow(sheet, row, profile);

    if (!identifyingProp || !identifyingVal) {
      json[HEADER_COMMENTED_PROP_UPLOAD_ERROR] = "Missing identifying val.";
      writeJsonToRow(sheet, jsonBeforeTypeCast, row);
      continue;
    }

    var uploadRelpathCol = findColumnByHeaderValue(sheet, HEADER_COMMENTED_PROP_UPLOAD_RELPATH);
    var uploadRelpath = uploadRelpathCol ? getCellValue(sheet, row, uploadRelpathCol) : undefined;

    if (!uploadRelpath) {
      json[HEADER_COMMENTED_PROP_UPLOAD_ERROR] = "Missing #upload_relpath.";
      writeJsonToRow(sheet, jsonBeforeTypeCast, row);
      continue;
    }

    console.log(row);
    // check if there is a matched local file
    // compare relpath and files in user dropped directory
    for (let j = 0; j < fileEntries.length; ++j) {
      const fileEntry = fileEntrys[j];
      console.log(fileEntry);
    }

    // get upload credentials from portal
    var uploadCredentials = getUploadCredentialsFromIdentifyingVal(identifyingVal);

    if (!uploadCredentials) {
      json[HEADER_COMMENTED_PROP_UPLOAD_ERROR] = "Failed to get upload crentials.";
      writeJsonToRow(sheet, jsonBeforeTypeCast, row);
      continue;
    }

    // rewrite data, with commented headers such as error and text, on the sheet
    json[HEADER_COMMENTED_PROP_UPLOAD_ERROR] = "Upload ready.";
    writeJsonToRow(sheet, json, row);
    numSubmitted++;
  }
  // {identifyingProp, identifyingVal, credentials, File input object}
  // return numSubmitted;
  return a + ":init";
}

function startUpload(a) {
  // start uploading for all files
  return a + ":start";
}

function abortUpload(a) {
  // abort all upload
  return a + ":abort";
}
