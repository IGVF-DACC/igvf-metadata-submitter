const HEADER_PROP_ACCESSION = "accession";
const HEADER_PROP_UUID = "uuid";
const HEADER_PROP_NAME = "name";
const HEADER_PROP_ALIASES = "aliases";
const HEADER_PROP_AWARD = "award";
const HEADER_PROP_LAB = "lab";
const HEADER_PROP_S3_URI = "s3_uri";
const HEADER_PROP_ATTACHMENT = "attachment";
const BIG_NUMBER_FOR_PRIORITY_SORTING = 1000;

// determines the column order of properties in the header
const DEFAULT_PROP_PRIORITY = [
  HEADER_COMMENTED_PROP_SKIP,
  HEADER_COMMENTED_PROP_RESPONSE,
  HEADER_COMMENTED_PROP_RESPONSE_TIME,
  HEADER_COMMENTED_PROP_UPLOAD_ABSPATH,
  HEADER_COMMENTED_PROP_UPLOAD_STATUS,
  HEADER_COMMENTED_PROP_UPLOAD_CMD,
  HEADER_PROP_ACCESSION,
  HEADER_PROP_UUID,
  HEADER_PROP_NAME,
  HEADER_PROP_ALIASES,
  HEADER_PROP_AWARD,
  HEADER_PROP_LAB,
];

const IDENTIFYING_PROP_PRIORITY = [
  HEADER_PROP_ACCESSION,
  HEADER_PROP_UUID,
  HEADER_PROP_NAME
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
const FORMAT_SEARCHABLE_PROP = "underline";
const FORMAT_ARRAY_PROP = "italic,bold";

const SELECTED_PROP_KEYS_FOR_TOOLTIP = [
  "title",
  "description",
  "comment",
  "type",
  "readonly",
  "notSubmittable",
  "linkTo",
];

function isValidProfileName(profileName, endpoint) {
  for(var name of getAllProfiles(endpoint)) {
    // make capitalized sentence from snakecase 
    var capitalizedName = capitalizeWord(snakeToCamel(name));
    if ([name, capitalizedName].includes(profileName)) {
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

function isArrayProp(profile, prop) {
  if (!profile || prop.startsWith("#")) {
    return false;
  }
  var propType = getPropType(profile, prop);
  return propType && propType === "array";
}

function makeSearchUrlForProp(profile, prop, endpoint) {
  if (!isSearchableProp(profile, prop)) {
    return;
  }

  var propInProfile = profile["properties"][prop];
  var linkTo = propInProfile.hasOwnProperty("linkTo") ?
    propInProfile["linkTo"] : propInProfile["items"]["linkTo"];

  // Search uses UI endpoint so convert to UI endpoint if available
  const uiEndpoint = getUIEndpoint(endpoint);

  if (isEncodeEndpoint(endpoint)) {
    return `${uiEndpoint}/search/?type=${linkTo}`;
  } else {
    return `${uiEndpoint}/search?type=${linkTo}`;
  }
}

function getPropType(profile, prop) {
  if (!profile || !profile["properties"].hasOwnProperty(prop)) {
    return;
  }
  return profile["properties"][prop]["type"];
}

function isRequiredProp(profile, prop) {
  // try find required property in a recursive fashion ("anyOf")
  // 1. "required" is "anyOf", then try to find "required" in subProfile
  // 2. "required" in this

  if (profile.hasOwnProperty("required")) {
    return profile["required"].includes(prop);

  } else if (profile.hasOwnProperty("anyOf")) {
    for (subProfile of profile["anyOf"]) {
      if (isRequiredProp(subProfile, prop)) {
        return true;
      }
    }
  }
  return false;
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

function hasAttachment(profile) {
  return profile["properties"].hasOwnProperty(HEADER_PROP_ATTACHMENT) &&
    profile["properties"][HEADER_PROP_ATTACHMENT]["attachment"];
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
    return isRequiredProp(profile, prop)
      || isIdentifyingProp(profile, prop)
      || !isNonEditableProp(profile, prop)
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
    // adhoc way to fix buggy schema (invalid escapes: \\:, \\-)
    // examples of wrong pattern:
    //  "^(PMID:[0-9]+|doi:10\\.[0-9]{4}[\\d\\s\\S\\:\\.\\/]+|PMCID:PMC[0-9]+|[0-9]{4}\\.[0-9]{4})$";
    //  "^(\\d+(\\.[1-9])?(\\-\\d+(\\.[1-9])?)?)$"
    raw_text = response.getContentText();
    fixed_text = raw_text
      .replace(/\\\\S\\\\:/g, "\\\\S:")
      .replace(/\\\\-/g, "-");
    return JSON.parse(fixed_text);
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


function getPropInDependentSchemas(profile, prop) {
  if (!profile.hasOwnProperty("dependentSchemas")) {
    return;
  }
  var dependentSchemas = profile["dependentSchemas"];
  if (!dependentSchemas.hasOwnProperty(prop)) {
    return;
  }
  return dependentSchemas[prop];
}

function makeTooltipForProp(profile, prop) {
  var propInProfile = profile["properties"][prop];

  var tooltip = isSearchableProp(profile, prop) ?
    "SEARCH AVAILABLE\n\n" : "";

  tooltip += SELECTED_PROP_KEYS_FOR_TOOLTIP
    .filter(key => propInProfile.hasOwnProperty(key))
    .map(key => {return `* ${key}\n${propInProfile[key]}`})
    .join('\n\n');

  // find linkTo for Array type and add it to tooltip
  if (propInProfile.hasOwnProperty("items") && propInProfile.items.hasOwnProperty("linkTo")) {
    tooltip += `\n\n* linkTo\n${propInProfile.items.linkTo}`;
  }

  // find submissionExample for Array type and add it to tooltip
  if (propInProfile.hasOwnProperty("submissionExample")) {
    if (propInProfile.submissionExample.hasOwnProperty("appscript")) {
      tooltip += `\n\n* submissionExample (appscript)\n${propInProfile.submissionExample.appscript}`;
    }
    if (propInProfile.submissionExample.hasOwnProperty("igvf_utils")) {
      tooltip += `\n\n* submissionExample (igvf_utils)\n${propInProfile.submissionExample.igvf_utils}`;
    }
  }

  // additionally find comment in dependency and add to tooltip
  var dependencyProp = getPropInDependentSchemas(profile, prop)
  if (dependencyProp && dependencyProp.hasOwnProperty("comment")) {
    tooltip += `\n\n* dependency\n${dependencyProp["comment"]}`;
  }

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
    var styles = [];
    if (isSearchableProp(profile, prop)) {
      styles.push(FORMAT_SEARCHABLE_PROP)
    }
    if (isArrayProp(profile, prop)) {
      styles.push(FORMAT_ARRAY_PROP)
    }
    if (styles) {
      setCellFormat(sheet, HEADER_ROW, col, styles.join(","));
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
        `Property ${prop} does not exist in current profile(${profile.title})\n\n` +
        "Possible mismatch between profile and accession?"
      );
      missingProps.push(prop);
      continue;
    }

    setColorAndTooltipForHeaderProp(sheet, profile, prop, col);
    addDropdownMenuToDataCell(sheet, profile, prop, col);
  }
  return missingProps;
}

function getIdentifyingPropPriority(prop) {
  // return value
  // - 0: highest priority
  // - BIG_NUMBER_FOR_PRIORITY_SORTING: lowest priority
  //   (if prop doesn't exist in IDENTIFYING_PROP_PRIORITY
  //    then return BIG_NUMBER_FOR_PRIORITY_SORTING)

  var index = IDENTIFYING_PROP_PRIORITY.indexOf(prop);
  if (index === -1) {
    return BIG_NUMBER_FOR_PRIORITY_SORTING;
  }
  return index;
}

function getProfileSchemaVersion(profile) {
  return profile["properties"]["schema_version"]["default"];
}

function checkProfile() {
  // check profile for current sheet

  var profileName = getProfileName();

  if (getProfileName()) {
    var profile = getProfile(getProfileName(), getEndpoint())

    if (!profile) {
      alertBox(
        "Found profile name but couldn't get profile from portal. Wrong credentials?\n" +
        "Go to the menu 'IGVF' -> 'Authorize for IGVF' and input access key and secret pair."
      );
      return;
    }

    // check schema versions of profile and sheet
    // if they don't match then halt and show warning
    const sheetSchemaVersion = getLastUsedSchemaVersion();
    const profileSchemaVersion = getProfileSchemaVersion(profile);

    if (sheetSchemaVersion && sheetSchemaVersion !== profileSchemaVersion) {
      if (alertBoxOkCancel(
          "Found schema version mismatch (current sheet vs. portal).\n\n" +
          `- Current sheet's last used schema version: ${sheetSchemaVersion}\n` +
          `- Portal's latest schema version: ${profileSchemaVersion}\n\n` +
          "Would you like to automatically create a new sheet with updated schema?"
      )) {
        updateCurrentSheet();
      }
      return;
    }
    return true;
  }

  alertBox(
    "No profile name found.\n" +
    'Go to the menu "IGVF" -> "Set profile name".'
  );
}

function checkProfileForPost() {
  // check profile for current sheet

  var profileName = getProfileName();

  if (getProfileName()) {
    var profile = getProfile(getProfileName(), getEndpoint())

    if (!profile) {
      alertBox(
        "Found profile name but couldn't get profile from portal. Wrong credentials?\n" +
        "Go to the menu 'IGVF' -> 'Authorize for IGVF' and input access key and secret pair."
      );
      return;
    }

    // check schema versions of profile and sheet
    // if they don't match then halt and show warning
    const sheetSchemaVersion = getLastUsedSchemaVersion();
    const profileSchemaVersion = getProfileSchemaVersion(profile);

    if (sheetSchemaVersion && sheetSchemaVersion !== profileSchemaVersion) {
      alertBox(
          "Found schema version mismatch (current sheet vs. portal).\n\n" +
          `- Current sheet's last used schema version: ${sheetSchemaVersion}\n` +
          `- Portal's latest schema version: ${profileSchemaVersion}\n\n` +
          "Please create a new tab and pull the latest profile."
      );
      return;
    }
    return true;
  }

  alertBox(
    "No profile name found.\n" +
    'Go to the menu "IGVF" -> "Set profile name".'
  );
}