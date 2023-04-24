const HELP_TEXT_INDENT = 2;
const EXPORTED_JSON_INDENT = 2;
const HEADER_COMMENTED_PROP_SKIP = "#skip";
const HEADER_COMMENTED_PROP_RESPONSE = "#response";
const HEADER_COMMENTED_PROP_RESPONSE_TIME = "#response_time";
const HEADER_COMMENTED_PROP_UPLOAD_RELPATH = "#upload_relpath";
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
  return numUpdated;
}

function exportSheetToJsonFile(sheet, profileName, endpointForProfile, keepCommentedProps, jsonFilePath) {
  var profile = getProfile(profileName, endpointForProfile);

  var result = [];
  for (var row = HEADER_ROW + 1; row <= getLastRow(sheet); row++) {
    var jsonBeforeTypeCast = rowToJson(
      sheet, row, keepCommentedProps=false, bypassGoogleAutoParsing=true
    );
    var json = typeCastJsonValuesByProfile(profile, jsonBeforeTypeCast);
    result.push(json);
  }
  DriveApp.createFile(jsonFilePath, JSON.stringify(result, null, EXPORTED_JSON_INDENT));
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

    json[HEADER_COMMENTED_PROP_RESPONSE] = method + "," + error;
    if (method === "PATCH") {
      json[HEADER_COMMENTED_PROP_RESPONSE] += "\nSelected props: ";
      if (selectedColsForPatch.length === 0) {
        json[HEADER_COMMENTED_PROP_RESPONSE] += "ALL";
      } else {
        json[HEADER_COMMENTED_PROP_RESPONSE] += selectedColsForPatch.map(x => x.headerProp).join(",");
      }
    }

    json[HEADER_COMMENTED_PROP_RESPONSE_TIME] = getCurrentLocalTimeString("");

    switch(error) {
      case 200:
        break;

      case 201:
        // POST assigns new values to identifying properties (e.g. uuid, accession)
        // so update row with those new identifying values
        profile["identifyingProperties"].forEach(prop => {
          if (!isCommentedProp(profile, prop)) {
            json[prop] = responseJson["@graph"][0][prop];
          }
        });
        json[HEADER_COMMENTED_PROP_RESPONSE] += "\n" + JSON.stringify(responseJson, null, HELP_TEXT_INDENT);
        break;

      case 422:
        // validation failure
        json[HEADER_COMMENTED_PROP_RESPONSE] += "\nIf error message is not helpful, try Validate on the menu.\n"

      default:
        json[HEADER_COMMENTED_PROP_RESPONSE] += "\n" + JSON.stringify(responseJson, null, HELP_TEXT_INDENT);
    }

    // rewrite data, with commented headers such as error and text, on the sheet
    writeJsonToRow(sheet, json, row);
    numSubmitted++;
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

function addMetadataTemplateToSheet(sheet, profile, forAdmin=false) {
  var metadataObj = makeMetadataTemplateFromProfile(profile, forAdmin);
  var sortedProps = getSortedProps(Object.keys(metadataObj), profile);
  addJsonToSheet(sheet, metadataObj, sortedProps);
}
