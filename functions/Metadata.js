const HELP_TEXT_INDENT = 2;
const EXPORTED_JSON_INDENT = 2;
const HEADER_COMMENTED_PROP_SKIP = "#skip";
const HEADER_COMMENTED_PROP_RESPONSE = "#response";
const HEADER_COMMENTED_PROP_RESPONSE_TIME = "#response_time";
const HEADER_COMMENTED_PROP_UPLOAD_ABSPATH = "#upload_abspath";
const HEADER_COMMENTED_PROP_UPLOAD_STATUS = "#upload_status";
const HEADER_COMMENTED_PROP_UPLOAD_CMD = "#upload_cmd";
const DEFAULT_EXPORTED_JSON_FILE_PREFIX = "encode-metadata-submitter.exported";
const TOOLTIP_FOR_PROP_SKIP = "Set as 1 to skip any READ/WRITE actions for a row, which is equivalent to hiding a row."
const TOOLTIP_FOR_PROP_RESPONSE = "Action + HTTP error code + JSON response\n\n" +
"HTTP Error codes:\n";
"-200: Successful.\n-201: Successfully POSTed.\n-409: Found a conflict when POSTing\n";
const TOOLTIP_FOR_PROP_RESPONSE_TIME = "Time of latest response";


function getTooltipForCommentedProp(prop) {
  if (prop === HEADER_COMMENTED_PROP_SKIP) {
    return TOOLTIP_FOR_PROP_SKIP;
  }
  else if(prop === HEADER_COMMENTED_PROP_RESPONSE) {
    return TOOLTIP_FOR_PROP_RESPONSE;
  }
  else if(prop === HEADER_COMMENTED_PROP_RESPONSE_TIME) {
    return TOOLTIP_FOR_PROP_RESPONSE_TIME;
  }
}

function makeMetadataUrl(method, profileName, endpoint, identifyingVal) {
  switch(method) {
    case "GET":
      return `${endpoint}/${profileName}/${identifyingVal}/?format=json&frame=object`;
    case "PUT":
    case "PATCH":
      return `${endpoint}/${profileName}/${identifyingVal}`;
    case "POST":
      return `${endpoint}/${profileName}`;
    default:
      Logger.log("makeMetadataUrl: Not supported method " + method);      
  }
}

function getMetadataFromPortal(identifyingVal, identifyingProp, profileName, endpoint, forAdmin=false) {
  var url = makeMetadataUrl("GET", profileName, endpoint, identifyingVal);
  var response = restGet(url);
  var error = response.getResponseCode();

  var object = {
    [HEADER_COMMENTED_PROP_RESPONSE]: "GET" + "," + error,
    [HEADER_COMMENTED_PROP_RESPONSE_TIME]: getCurrentLocalTimeString(""),
    [identifyingProp]: identifyingVal
  };

  var responseJson = JSON.parse(response.getContentText());
  if (error === 200) {
    // filter out non gettable property
    // see function isGettableProp in Profile.gs for details
    var profile = getProfile(profileName, endpoint);
    var filteredResponseJson = Object.keys(responseJson)
      .filter((prop) => isGettableProp(profile, prop, forAdmin))
      .reduce((cur, prop) => { return Object.assign(cur, { [prop]: responseJson[prop] })}, {});

    // then merge it with commented properties
    object = {...object, ...filteredResponseJson};
  }
  else {
    // if error, write helpText to provide debugging information
    object[HEADER_COMMENTED_PROP_RESPONSE] += "\n" + JSON.stringify(responseJson, null, HELP_TEXT_INDENT);
  }
  return object;
}

function getSortedProps(props, profile, propPriority=DEFAULT_PROP_PRIORITY) {
  // sort metadata's props by given profile and propPriority
  // - props in propPriority come first if exists
  // - and then props under required key in profile come next
  // - all the other commented (#) props come last
  var sortedProps = [];

  // priority props first
  for (var prop of propPriority.concat(profile["required"])) {
    if (props.includes(prop) && !sortedProps.includes(prop)) {
      sortedProps.push(prop);
    }
  }

  // non-commented props
  for (var prop of props) {
    if (!prop.startsWith("#") && !sortedProps.includes(prop)) {
      sortedProps.push(prop);
    }
  }

  // and then commented props
  for (var prop of props) {
    if (prop.startsWith("#") && !sortedProps.includes(prop)) {
      sortedProps.push(prop);
    }
  }
  return sortedProps;
}

function updateSheetWithMetadataFromPortal(sheet, profileName, endpointForGet, endpointForProfile, forAdmin=false) {
  var profile = getProfile(profileName, endpointForProfile);

  // check #skip column exists. if so skip row with #skip===1
  var skipCol = findColumnByHeaderValue(sheet, HEADER_COMMENTED_PROP_SKIP);

  // update each row if has accession value
  var numUpdated = 0;
  for (var row = HEADER_ROW + 1; row <= getLastRow(sheet); row++) {
    if (isRowHidden(sheet, row)) {
      continue;
    }
    if (skipCol && toBoolean(getCellValue(sheet, row, skipCol))) {
      continue;
    }

    var [identifyingProp, identifyingVal, identifyingCol] =
      findIdentifyingPropValColInRow(sheet, row, profile);

    if (!identifyingProp || !identifyingVal) {
      continue;
    }

    var metadataObj = getMetadataFromPortal(
      identifyingVal, identifyingProp, profileName, endpointForGet, forAdmin
    );
    var sortedProps = getSortedProps(Object.keys(metadataObj), profile);
    writeJsonToRow(sheet, metadataObj, row, sortedProps);
    numUpdated++;
  }

  if (numUpdated > 0) {
    setLastUsedSchemaVersion(sheet, getProfileSchemaVersion(profile));
  }

  return numUpdated;
}

function exportSheetToJson(sheet, profileName, endpointForProfile, keepCommentedProps) {
  var profile = getProfile(profileName, endpointForProfile);

  var result = [];
  for (var row = HEADER_ROW + 1; row <= getLastRow(sheet); row++) {
    var jsonBeforeTypeCast = rowToJson(
      sheet, row, keepCommentedProps=false, bypassGoogleAutoParsing=true
    );
    var json = typeCastJsonValuesByProfile(profile, jsonBeforeTypeCast);
    result.push(json);
  }

  return result;
}

function exportSheetToJsonFile(sheet, profileName, endpointForProfile, keepCommentedProps, jsonFilePath) {
  var json = exportSheetToJson(sheet, profileName, endpointForProfile, keepCommentedProps)
  DriveApp.createFile(jsonFilePath, JSON.stringify(json, null, EXPORTED_JSON_INDENT));
}

function convertRowToJson(sheet, row, profileName, endpointForProfile, keepCommentedProps) {
  // do rowToJson and then typecast according to profile
  var profile = getProfile(profileName, endpointForProfile);
  var jsonBeforeTypeCast = rowToJson(
    sheet, row, keepCommentedProps=false, bypassGoogleAutoParsing=true
  );
  return typeCastJsonValuesByProfile(profile, jsonBeforeTypeCast);
}

function findIdentifyingPropValColInRow(sheet, row, profile) {
  // for a given row, find the first valid identifying prop/value/col.
  // if indentifying value is an array type then take the first element.
  //
  // returns prop, value, col

  // sorted based on identifying prop priority
  // e.g. "accession" has highest priority
  var sortedIdProp = [...profile["identifyingProperties"]];
  sortedIdProp.sort(
    (a,b) => getIdentifyingPropPriority(a) - getIdentifyingPropPriority(b),
  );

  for (var identifyingProp of sortedIdProp) {
    var identifyingCol = findColumnByHeaderValue(sheet, identifyingProp);
    var identifyingVal = identifyingCol ? getCellValue(sheet, row, identifyingCol) : undefined;

    if (identifyingVal) {
      // if indentifying value is an array type then take the first element
      identifyingVal = isArrayProp(profile, identifyingProp) ? JSON.parse(identifyingVal)[0] : identifyingVal;
      return [
        identifyingProp,
        identifyingVal,
        identifyingCol
      ];
    }
  }
  return [undefined, undefined, undefined];
}


function setAttachment(attachmentJson) {
  // attachmentJson has "path" property only
  var path = attachmentJson["path"];
  if (!path) {
    alertBox(
      'attachment is not a valid JSON string. A valid example format is {"path": "/GOOGLE/DRIVE/PATH/file.pdf"}.'
    );
    return;
  }

  var file = getDriveFileFromPath(path);
  if (!file) {
    alertBox(`${path} not found on Google Drive.`);
    return;
  }

  var mimeType = file.getMimeType();
  if (mimeType === "application/x-gzip") {
    mimeType = "application/gzip";
  }

  var base64EncodedStr = Utilities.base64Encode(file.getBlob().getBytes());

  var attachment = {
    download: path,
    type: mimeType,
    href: `data:${mimeType};base64,${base64EncodedStr}`
  }
  return attachment;
}

function submitSheetToPortal(
  sheet, profileName, endpointForPut, endpointForProfile, method, selectedColsForPatch=[]
) {
  // returns actual number of submitted rows
  var profile = getProfile(profileName, endpointForProfile);

  const numData = getNumMetadataInSheet(sheet);
  var numSubmitted = 0;

  for (var row = HEADER_ROW + 1; row <= numData + HEADER_ROW; row++) {
    var jsonBeforeTypeCast = rowToJson(
      sheet, row, keepCommentedProps=true, bypassGoogleAutoParsing=true,
    );

    if (isRowHidden(sheet, row)) {
      continue;
    }
    // if has #skip and it is 1 then skip
    if (jsonBeforeTypeCast.hasOwnProperty(HEADER_COMMENTED_PROP_SKIP)) {
      if (toBoolean(jsonBeforeTypeCast[HEADER_COMMENTED_PROP_SKIP])) {
        continue;
      }
    }

    var json = typeCastJsonValuesByProfile(
      profile, jsonBeforeTypeCast, keepCommentedProps=false
    );

    // if there is an attachment (e.g. document profile)
    // then read from Google Drive, base64encode its content
    if (
      hasAttachment(profile) &&
      json.hasOwnProperty(HEADER_PROP_ATTACHMENT) &&
      json[HEADER_PROP_ATTACHMENT]
    ) {
      // overwrite on payload's attachment
      var attachment = setAttachment(json[HEADER_PROP_ATTACHMENT]);
      if (!attachment) {
        continue;
      }
      json[HEADER_PROP_ATTACHMENT] = attachment;
    }

    var payloadJson = {};

    // filter JSON with selectedColsForPatch
    if (method === "PATCH" && selectedColsForPatch.length > 0) {
      const selectedHeaderProps = selectedColsForPatch.map((x) => x.headerProp);
      for (var prop of Object.keys(json)) {
        if (selectedHeaderProps.includes(prop)) {
          payloadJson[prop] = json[prop];
        }
      }

    } else {
      payloadJson = JSON.parse(JSON.stringify(json));
    }

    switch(method) {
      case "PUT":
      case "PATCH":
        var [identifyingProp, identifyingVal, identifyingCol] =
          findIdentifyingPropValColInRow(sheet, row, profile);

        if (!identifyingProp || !identifyingVal) {
          continue;
        }

        var url = makeMetadataUrl(method, profileName, endpointForPut, identifyingVal);
        var response = restSubmit(url, payloadJson=payloadJson, method=method);
        break;

      case "POST":
        var url = makeMetadataUrl(method, profileName, endpointForPut);
        var response = restSubmit(url, payloadJson=payloadJson, method=method);
        break;

      default:
        Logger.log("submitSheetToPortal: Wrong REST method " + method);
        continue;
    }

    var error = response.getResponseCode();
    var responseJson = JSON.parse(response.getContentText());

    jsonBeforeTypeCast[HEADER_COMMENTED_PROP_RESPONSE] = method + "," + error;
    if (method === "PATCH") {
      jsonBeforeTypeCast[HEADER_COMMENTED_PROP_RESPONSE] += "\nSelected props: ";
      if (selectedColsForPatch.length === 0) {
        jsonBeforeTypeCast[HEADER_COMMENTED_PROP_RESPONSE] += "ALL";
      } else {
        jsonBeforeTypeCast[HEADER_COMMENTED_PROP_RESPONSE] += selectedColsForPatch.map(x => x.headerProp).join(",");
      }
    }

    jsonBeforeTypeCast[HEADER_COMMENTED_PROP_RESPONSE_TIME] = getCurrentLocalTimeString("");

    switch(error) {
      case 200:
        break;

      case 201:
        // POST assigns new values to identifying properties (e.g. uuid, accession)
        // so update row with those new identifying values
        profile["identifyingProperties"].forEach(prop => {
          if (!isCommentedProp(profile, prop)) {
            jsonBeforeTypeCast[prop] = responseJson["@graph"][0][prop];
          }
        });
        jsonBeforeTypeCast[HEADER_COMMENTED_PROP_RESPONSE] += "\n" + JSON.stringify(responseJson, null, HELP_TEXT_INDENT);
        break;

      case 422:
        // validation failure
        jsonBeforeTypeCast[HEADER_COMMENTED_PROP_RESPONSE] += "\nIf error message is not helpful, try Validate on the menu.\n"

      default:
        jsonBeforeTypeCast[HEADER_COMMENTED_PROP_RESPONSE] += "\n" + JSON.stringify(responseJson, null, HELP_TEXT_INDENT);
    }

    // rewrite data, with commented headers such as error and text, on the sheet
    writeJsonToRow(sheet, jsonBeforeTypeCast, row);
    numSubmitted++;
  }

  if (numSubmitted > 0) {
    setLastUsedSchemaVersion(sheet, getProfileSchemaVersion(profile));
  }

  return numSubmitted;
}

function validateSheet(sheet, profileName, endpointForProfile) {
  // returns actual number of submitted rows
  var profile = getProfile(profileName, endpointForProfile);

  const numData = getNumMetadataInSheet(sheet);
  var numSubmitted = 0;

  for (var row = HEADER_ROW + 1; row <= numData + HEADER_ROW; row++) {
    var jsonBeforeTypeCast = rowToJson(
      sheet, row, keepCommentedProps=true, bypassGoogleAutoParsing=true
    );

    if (isRowHidden(sheet, row)) {
      continue;
    }
    // if has #skip and it is 1 then skip
    if (jsonBeforeTypeCast.hasOwnProperty(HEADER_COMMENTED_PROP_SKIP)) {
      if (toBoolean(jsonBeforeTypeCast[HEADER_COMMENTED_PROP_SKIP])) {
        continue;
      }
    }

    var json = typeCastJsonValuesByProfile(
      profile, jsonBeforeTypeCast, keepCommentedProps=false
    );

    var validationResult = validateJson(profile, filterOutCommentedProps(json));
    if (validationResult.valid) {
      json[HEADER_COMMENTED_PROP_RESPONSE] = "ValidationSuccess";
    } else {
      json[HEADER_COMMENTED_PROP_RESPONSE] = JSON.stringify(validationResult.errors, null, 2);
    }
    json[HEADER_COMMENTED_PROP_RESPONSE_TIME] = getCurrentLocalTimeString("");
    // rewrite data, with commented headers such as error and text, on the sheet
    writeJsonToRow(sheet, json, row);
    numSubmitted++;
  }
  return numSubmitted;
}

function createNewSheetAndGetMetadata(sheet, profileName, endpoint) {
  // Copy current sheet's identifying columns to a new sheet
  // and then do GET to get latest metadata from the portal

  var spreadsheet = SpreadsheetApp.getActive();
  var currentSheetName = sheet.getName();
  var profile = getProfile(profileName, endpoint);

  var identifyingCols = [];
  
  for (var prop of profile["identifyingProperties"]) {
    var col = findColumnByHeaderValue(sheet, prop);
    if (col) {
      identifyingCols.push(col);
    }
  }

  if (!identifyingCols) {
    Logger.log("Couldn't find an identifying column.")
    return;
  }

  var schemaVersion = getProfileSchemaVersion(profile);
  var newSheetName = `${currentSheetName}_v${schemaVersion}`;
  if (spreadsheet.getSheetByName(newSheetName)) {
    alertBox(`Faild to create a new sheet since it already exists: ${newSheetName}.`);
    return;
  }

  // create a new sheet and SET FOCUS ON IT
  var newSheet = createNewSheet(newSheetName, true);

  // write id cols to a new sheet
  var currentNewSheetCol = 1;
  for (var col of identifyingCols) {
    var valuesToCopy = sheet.getRange(HEADER_ROW, col, sheet.getLastRow(), 1).getValues();
    newSheet.getRange(HEADER_ROW, currentNewSheetCol, valuesToCopy.length, 1).setValues(valuesToCopy);
    currentNewSheetCol++;
  }

  // copy DeveloperMetadata (profile name) to new sheet
  setProfileName(newSheet, getProfileName(sheet));

  // run GET on new sheet to get metadata from the portal
  getMetadataForAll(forAdmin=false, showWarning=false)
}
