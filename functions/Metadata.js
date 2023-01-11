const HELP_TEXT_INDENT = 2;
const EXPORTED_JSON_INDENT = 2;
const HEADER_COMMENTED_PROP_SKIP = "#skip";
const HEADER_COMMENTED_PROP_RESPONSE = "#response";
const DEFAULT_EXPORTED_JSON_FILE_PREFIX = "encode-metadata-submitter.exported";
const TOOLTIP_FOR_PROP_SKIP = "COMMENTED PROPERY IS NOT SENT TO PORTAL\n\nDry-run any REST actions (GET/PUT/PATCH/POST)\n\n" +
"If recent REST action is successful (200 or 201) then it is automatically " +
"set as 1 to prevent duplicate submission/retrieval.";
const TOOLTIP_FOR_PROP_ERROR = "COMMENTED PROPERY IS NOT SENT TO PORTAL\n\nRecent REST action + HTTP error code + JSON response\n\n" +
"-200: Successful.\n-201: Successfully POSTed.\n-409: Found a conflict when POSTing\n";


function getTooltipForCommentedProp(prop) {
  if (prop === HEADER_COMMENTED_PROP_SKIP) {
    return TOOLTIP_FOR_PROP_SKIP;
  }
  else if(prop === HEADER_COMMENTED_PROP_RESPONSE) {
    return TOOLTIP_FOR_PROP_ERROR;
  }
}

function getNumMetadataInSheet(sheet) {
  return getLastRow(sheet) - HEADER_ROW;
}

function makeMetadataUrl(method, profileName, endpoint, identifyingVal) {
  if (identifyingVal) {
    // if indentifying value is given and it's an array then take the first element
    identifyingVal = isArrayString(identifyingVal) ? JSON.parse(identifyingVal)[0] : identifyingVal;
  }

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
    [HEADER_COMMENTED_PROP_SKIP]: 0,
    [identifyingProp]: identifyingVal
  };

  var responseJson = JSON.parse(response.getContentText());
  if (error === 200) {
    // automatically set #skip as 1 to prevent duplicate GET
    object[HEADER_COMMENTED_PROP_SKIP] = 1;

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
  // for a given row, find the first valid identifying prop/value/col
  for (var identifyingProp of profile["identifyingProperties"]) {
    var identifyingCol = findColumnByHeaderValue(sheet, identifyingProp);
    var identifyingVal = identifyingCol ? getCellValue(sheet, row, identifyingCol) : undefined;

    if (identifyingVal) {
      return [
        identifyingProp,
        identifyingVal,
        identifyingCol
      ];
    }
  }
  return [undefined, undefined, undefined];
}

function submitSheetToPortal(sheet, profileName, endpointForPut, endpointForProfile, method) {
  // returns actual number of submitted rows
  var profile = getProfile(profileName, endpointForProfile);

  const numData = getNumMetadataInSheet(sheet);
  var numSubmitted = 0;

  for (var row = HEADER_ROW + 1; row <= numData + HEADER_ROW; row++) {
    var jsonBeforeTypeCast = rowToJson(
      sheet, row, keepCommentedProps=true, bypassGoogleAutoParsing=true
    );

    // if has #skip and it is 1 then skip
    if (jsonBeforeTypeCast.hasOwnProperty(HEADER_COMMENTED_PROP_SKIP)) {
      if (toBoolean(jsonBeforeTypeCast[HEADER_COMMENTED_PROP_SKIP])) {
        continue;
      }
    }

    var [identifyingProp, identifyingVal, identifyingCol] =
      findIdentifyingPropValColInRow(sheet, row, profile);

    if (!identifyingProp || !identifyingVal) {
      continue;
    }

    var json = typeCastJsonValuesByProfile(
      profile, jsonBeforeTypeCast, keepCommentedProps=false
    );

    switch(method) {
      case "PUT":
      case "PATCH":
        var url = makeMetadataUrl(method, profileName, endpointForPut, json[identifyingProp]);
        var response = restSubmit(url, payloadJson=json, method=method);
        break;

      case "POST":
        var url = makeMetadataUrl(method, profileName, endpointForPut);
        var response = restSubmit(url, payloadJson=json, method=method);
        break;

      default:
        Logger.log("submitSheetToPortal: Wrong REST method " + method);
        continue;
    }

    var error = response.getResponseCode();
    var responseJson = JSON.parse(response.getContentText());

    json[HEADER_COMMENTED_PROP_RESPONSE] = method + "," + error;

    switch(error) {
      case 200:
        json[HEADER_COMMENTED_PROP_SKIP] = 1;
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
        json[HEADER_COMMENTED_PROP_SKIP] = 1;
        break;

      case 422:
        // validation failure
        json[HEADER_COMMENTED_PROP_RESPONSE] += "\nIf error message is not helpful, use external JSON schema validator\n"

      default:
        json[HEADER_COMMENTED_PROP_RESPONSE] += "\n" + JSON.stringify(responseJson, null, HELP_TEXT_INDENT);
        json[HEADER_COMMENTED_PROP_SKIP] = 0;
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

function patchRemove(sheet, profileName, endpointForPut, endpointForProfile) {  
  // PATCH-REMOVE is simply GET -> remove properties -> PUT
}

function patchAppend(sheet, profileName, endpointForPut, endpointForProfile) {
  // PATCH-APPEND
  // check if header has only one list-type property, commented properties are allowed

  // returns actual number of submitted rows
  var profile = getProfile(profileName, endpointForProfile);

  const numData = getNumMetadataInSheet(sheet);
  var numSubmitted = 0;

  for (var row = HEADER_ROW + 1; row <= numData + HEADER_ROW; row++) {
    var jsonBeforeTypeCast = rowToJson(
      sheet, row, keepCommentedProps=true, bypassGoogleAutoParsing=true
    );

    // if has #skip and it is 1 then skip
    if (jsonBeforeTypeCast.hasOwnProperty(HEADER_COMMENTED_PROP_SKIP)) {
      if (toBoolean(jsonBeforeTypeCast[HEADER_COMMENTED_PROP_SKIP])) {
        continue;
      }
    }

    var [identifyingProp, identifyingVal, identifyingCol] =
      findIdentifyingPropValColInRow(sheet, row, profile);

    if (!identifyingProp || !identifyingVal) {
      continue;
    }

    var json = typeCastJsonValuesByProfile(
      profile, jsonBeforeTypeCast, keepCommentedProps=false
    );

    switch(method) {
      case "PUT":
      case "PATCH":
        var url = makeMetadataUrl(method, profileName, endpointForPut, json[identifyingProp]);
        var response = restSubmit(url, payloadJson=json, method=method);
        break;

      case "POST":
        var url = makeMetadataUrl(method, profileName, endpointForPut);
        var response = restSubmit(url, payloadJson=json, method=method);
        break;

      default:
        Logger.log("submitSheetToPortal: Wrong REST method " + method);
        continue;
    }

    var error = response.getResponseCode();
    var responseJson = JSON.parse(response.getContentText());

    json[HEADER_COMMENTED_PROP_RESPONSE] = method + "," + error;

    switch(error) {
      case 200:
        json[HEADER_COMMENTED_PROP_SKIP] = 1;
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
        json[HEADER_COMMENTED_PROP_SKIP] = 1;
        break;

      case 422:
        // validation failure
        json[HEADER_COMMENTED_PROP_RESPONSE] += "\nIf error message is not helpful, use external JSON schema validator\n"

      default:
        json[HEADER_COMMENTED_PROP_RESPONSE] += "\n" + JSON.stringify(responseJson, null, HELP_TEXT_INDENT);
        json[HEADER_COMMENTED_PROP_SKIP] = 0;
    }

    // rewrite data, with commented headers such as error and text, on the sheet
    writeJsonToRow(sheet, json, row);
    numSubmitted++;
  }
  return numSubmitted;  
}
