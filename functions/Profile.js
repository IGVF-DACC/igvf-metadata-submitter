const HEADER_PROP_ACCESSION = "accession";
const HEADER_PROP_UUID = "uuid";
const HEADER_PROP_NAME = "name";
const HEADER_PROP_ALIASES = "aliases";
const HEADER_PROP_AWARD = "award";
const HEADER_PROP_LAB = "lab";

// determines the column order of properties in the header
const DEFAULT_PROP_PRIORITY = [
  HEADER_COMMENTED_PROP_SKIP,
  HEADER_COMMENTED_PROP_RESPONSE,
  HEADER_PROP_ACCESSION,
  HEADER_PROP_UUID,
  HEADER_PROP_NAME,
  HEADER_PROP_ALIASES,
  HEADER_PROP_AWARD,
  HEADER_PROP_LAB,
];

// https://github.com/ENCODE-DCC/encoded/blob/dev/docs/auth.rst#permissions
// This is for "permission" property
const ADMIN_OR_SYSTEM_PERMISSIONS = [
  "add_unvalidated",
  "edit_unvalidated",
  "expand",
  "impersonate",
  "import_items",
  "index",
  "submit_for_any",
  "view_raw"
]

const COLOR_PROP_DEFAULT = "black";
const COLOR_PROP_REQUIRED = "red";
const COLOR_PROP_INDENTIFYING = "blue";
const COLOR_PROP_READONLY = "lightgray";
const COLOR_PROP_HAS_DO_NOT_SUBMIT_IN_COMMENT = "lightgray";
const COLOR_PROP_NOT_SUBMITTABLE = "lightgray";
const COLOR_PROP_COMMENTED = "black";
const FORMAT_SEARCHABLE_PROP = "bold,underline";

const SELECTED_PROP_KEYS_FOR_TOOLTIP = [
  "title",
  "description",
  "comment",
  "type",
  "readonly",
  "notSubmittable"
];

function isValidProfileName(profileName, endpoint) {
  for(var name of getAllProfiles(endpoint)) {
    // make capitalized sentence from snakecase 
    var capitalizedName = capitalizeWord(snakeToCamel(name));
    if ([name, capitalizedName].includes(profileName)) {
      Logger.log(profileName + " " + name + " " + capitalizedName);
      return true;
    }
  }
}

function makeProfileUrl(profileName, endpoint, format="json") {
  switch(format) {
    case "json":
      return `${endpoint}/profiles/${profileName}?format=json`;
    default:
      return `${endpoint}/profiles/${profileName}`;
  }
}

function isSearchableProp(profile, prop) {
  if (!profile || prop.startsWith("#")) {
    return false;
  }
  var propInProfile = profile["properties"][prop];
  // if linkTo (single object) or items.linkTo (array) exists
  // then it's searchable
  return propInProfile.hasOwnProperty("linkTo") ||
    propInProfile.hasOwnProperty("items") && propInProfile["items"].hasOwnProperty("linkTo");
}

function makeSearchUrlForProp(profile, prop, endpoint) {
  if (!isSearchableProp(profile, prop)) {
    return;
  }

  var propInProfile = profile["properties"][prop];
  var linkTo = propInProfile.hasOwnProperty("linkTo") ?
    propInProfile["linkTo"] : propInProfile["items"]["linkTo"];

  if (isEncodeEndpoint(endpoint)) {
    return `${endpoint}/search/?type=${linkTo}`;

  } else if (endpoint === ENDPOINT_IGVF_SEARCH_UI) {
    // linkTo is a profile name in capitalized CamelCase
    // convert it to IGVF's format: snakecase with - + "s"(plural)    
    return `${endpoint}/${camelToSnake(uncapitalizeWord(linkTo)).replace(/_/g,"-") + "s"}`;
  }
}

function getPropType(profile, prop) {
  if (!profile || !profile["properties"].hasOwnProperty(prop)) {
    return;
  }
  return profile["properties"][prop]["type"];
}

function isRequiredProp(profile, prop) {
  return profile["required"].includes(prop);
}

function isIdentifyingProp(profile, prop) {
  return profile["identifyingProperties"].includes(prop);
}

function isReadonlyProp(profile, prop) {
  var propInProfile = profile["properties"][prop];
  return propInProfile.hasOwnProperty("readonly") && propInProfile["readonly"];
}

function isNotSubmittableProp(profile, prop) {
  var propInProfile = profile["properties"][prop];
  return propInProfile.hasOwnProperty("notSubmittable") && propInProfile["notSubmittable"];
}

function isNonEditableProp(profile, prop) {
  return isReadonlyProp(profile, prop) || isNotSubmittableProp(profile, prop);
}

function isCommentedProp(profile, prop) {
  return prop.startsWith("#");
}

function hasDoNotSubmitInPropComment(profile, prop) {
  var propInProfile = profile["properties"][prop];
  return propInProfile.hasOwnProperty("comment") &&
    propInProfile["comment"].toLowerCase().startsWith("do not submit");
}

function isAdminOrSystemProp(profile, prop) {
  var propInProfile = profile["properties"][prop];
  return propInProfile.hasOwnProperty("permission")
    && ADMIN_OR_SYSTEM_PERMISSIONS.includes(propInProfile["permission"]);
}

function isGettableProp(profile, prop, forAdmin=false) {
  if (!profile["properties"].hasOwnProperty(prop)) {
    return false;
  }
  if (forAdmin) {
    return !isNotSubmittableProp(profile, prop);
  } else {
    return !isNonEditableProp(profile, prop)
      && !hasDoNotSubmitInPropComment(profile, prop)
      && !isAdminOrSystemProp(profile, prop)
  }
}

function isPostableProp(profile, prop, forAdmin=false) {
  return isGettableProp(profile, prop, forAdmin);
}

function getColorForProp(profile, prop) {
  if (isCommentedProp(profile, prop)) {
    return COLOR_PROP_COMMENTED;
  }
  if (isRequiredProp(profile, prop)) {
    return COLOR_PROP_REQUIRED;
  }
  if (isIdentifyingProp(profile, prop)) {
    return COLOR_PROP_INDENTIFYING;
  }
  if (isReadonlyProp(profile, prop)) {
    return COLOR_PROP_READONLY;
  }
  if (hasDoNotSubmitInPropComment(profile, prop)) {
    return COLOR_PROP_HAS_DO_NOT_SUBMIT_IN_COMMENT;
  }
  if (isNotSubmittableProp(profile, prop)) {
    return COLOR_PROP_NOT_SUBMITTABLE;
  }
  return COLOR_PROP_DEFAULT;
}

function getDefaultForProp(profile, prop) {
  var propInProfile = profile["properties"][prop];
  if (propInProfile && propInProfile.hasOwnProperty("default")) {
    return propInProfile["default"];
  }
  // returns null if default does not exist
  return null;
}

function getProfile(profileName, endpoint) {
  var url = makeProfileUrl(profileName, endpoint);
  var response = restGet(url);
  if (response.getResponseCode() === 200) {
    return JSON.parse(response.getContentText());
  }
}

function typeCastValueByProfile(profile, prop, val) {
  // correct types for metadata submission according to types defined in profile
  var propInProfile = profile["properties"][prop];
  if (propInProfile && propInProfile["type"] == "string" && getType(val) == "number") {
    return val.toString();
  }
  return val;
}

function typeCastJsonValuesByProfile(profile, json, keepCommentedProps) {
  var result = {};
  for (var prop of Object.keys(json)) {
    if (prop.startsWith("#") && !keepCommentedProps) {
      Logger.log("typeCastJsonValuesByProfile: startsWith #: " + prop + " " + keepCommentedProps);
      continue;
    }
    result[prop] = typeCastValueByProfile(profile, prop, json[prop]);
  }
  return result;
}

function filterOutCommentedProps(json) {
  var result = {};
  for (var prop of Object.keys(json)) {
    if (prop.startsWith("#")) {
      continue;
    }
    result[prop] = json[prop];
  }
  return result;
}

function makeTooltipForProp(profile, prop) {
  var propInProfile = profile["properties"][prop];

  var tooltip = isSearchableProp(profile, prop) ?
    "SEARCH AVAILABLE\n\n" : "";

  tooltip += SELECTED_PROP_KEYS_FOR_TOOLTIP
    .filter(key => propInProfile.hasOwnProperty(key))
    .map(key => {return `* ${key}\n${propInProfile[key]}`})
    .join('\n\n');

  return tooltip;
}

function setColorAndTooltipForHeaderProp(sheet, profile, prop, col) {
  if (prop === "") {
    return;
  }

  var tooltip = prop.startsWith("#") ? 
    getTooltipForCommentedProp(prop) : makeTooltipForProp(profile, prop);

  setCellTooltip(sheet, HEADER_ROW, col, tooltip);
  setCellColor(sheet, HEADER_ROW, col, getColorForProp(profile, prop));

  if (!prop.startsWith("#")) {
    if (isSearchableProp(profile, prop)) {
      setCellFormat(sheet, HEADER_ROW, col, FORMAT_SEARCHABLE_PROP);
    }
  }
}

function addDropdownMenuToDataCell(sheet, profile, prop, col) {
  if (prop === "" || prop.startsWith("#")) {
    return;
  }

  var propInProfile = profile["properties"][prop];
  if (propInProfile === undefined) {
    Logger.log(`Property ${prop} does not exist in profile ${profile["title"]}. Wrong profile?`);
    return;
  }
  
  if (!propInProfile.hasOwnProperty("enum")) {
    return;
  }

  var enums = propInProfile["enum"];
  var lastRow = getLastRow(sheet);
  // if lastRow is just the header then set lastRow as next line
  if (lastRow === HEADER_ROW) {
    lastRow = HEADER_ROW + 1;
  }
  var range = getRange(sheet, HEADER_ROW + 1, col, lastRow - HEADER_ROW, 1);
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(enums).build();  
  range.setDataValidation(rule);
}

function highlightHeaderAndDataCell(sheet, profile) {
  var currentHeaderProps = getCellValuesInRow(sheet, HEADER_ROW);

  var missingProps = [];
  for (var [i, prop] of currentHeaderProps.entries()) {
    var col = i + 1;

    if (!isCommentedProp(profile, prop) && !profile["properties"].hasOwnProperty(prop)) {
      Logger.info(
        `Property ${prop} does not exist in current profile\n\nPossible mismatch between profile and accession?`
      );
      missingProps.push(prop);
      continue;
    }

    setColorAndTooltipForHeaderProp(sheet, profile, prop, col);
    addDropdownMenuToDataCell(sheet, profile, prop, col);
  }
  return missingProps;
}

