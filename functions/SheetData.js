/*
Getters and setters for data stored in Google's Developer Metadata.
Such data include values for "Settings" of this tool.

Key names are shared between Spreadsheet and Sheet (current sheet by default).
But they are stored separately in different scopes.

e.g. getSpreadsheetDevMetadata vs. getSheetDevMetadata(sheet)

Dev Notes:

As of 0.3.0, script uses the same endpoint for both read/write actions
but script still uses KEY_ENDPOINT_WRITE for backward compatibility
*/

// still using "endpointWrite" for backward compatibility
const KEY_ENDPOINT_WRITE = "endpointWrite";
const KEY_PROFILE_NAME = "profileName";
const KEY_LAST_USED_SCHEMA_VERSION = "lastUsedSchemaVersion";


function getDefaultEndpoint() {
  var defaultEndpoint = getSpreadsheetDevMetadata(KEY_ENDPOINT_WRITE);
  return defaultEndpoint ? defaultEndpoint : DEFAULT_ENDPOINT_WRITE
}

function getEndpoint() {
  // As of 0.3.0, it's just a wrapper for default endpoint
  return getDefaultEndpoint();
}

function getProfileName(sheet) {
  var profileName = getSheetDevMetadata(
    sheet ? sheet : getCurrentSheet(),
    KEY_PROFILE_NAME
  );
  return profileName ? profileName : null;
}

function getLastUsedSchemaVersion(sheet) {
  return getSheetDevMetadata(
    sheet ? sheet : getCurrentSheet(),
    KEY_LAST_USED_SCHEMA_VERSION
  );
}

function setDefaultEndpoint(input) {
  var endpoint = input ? input : Browser.inputBox(
    `* Current endpoint:\\n${getDefaultEndpoint()}\\n\\n` +
    "* Supported IGVF endpoints:\\n" +
    `${getIgvfEndpointsAvailableForUsers().join("\\n")}\\n\\n` +
    'Enter a new endpoint:'
  );
  if (endpoint) {
    endpoint = trimTrailingSlash(endpoint);
  }
  if (!isValidEndpoint(endpoint)) {
    if (endpoint !== "cancel") {
      alertBox("Wrong endpoint: " + endpoint);
    }
    return;
  }

  setSpreadsheetDevMetadata(KEY_ENDPOINT_WRITE, endpoint);
}

function setEndpoint(sheet, input) {
  // As of 0.3.0, it's just a wrapper for default endpoint
  setDefaultEndpoint(input);
}

function setProfileName(sheet, input) {    
  var profileName = input ? input : Browser.inputBox(
    `* Current profile name:\\n${getProfileName(sheet)}\\n\\n` +
    "Snakecase (with _) or capitalized CamelCase are allowed for a profile name.\\n" +
    "No plural (s) is allowed in profile name.\\n" +
    "(e.g. MeasurementSet, measurement_set, sequence_file, lab):\\n\\n" +
    "Enter a new profile name:"
  );
  if (getProfileName(sheet) && getProfileName(sheet) !== profileName) {
    // if profile name has changed then reset last used schema version
    resetLastUsedSchemaVersion(sheet);
  }
  if (!isValidProfileName(profileName, getEndpoint())) {
    if (profileName !== "cancel") {
      alertBox("Wrong profile name: " + profileName);
    }
    return;
  }
  setSheetDevMetadata(
    sheet ? sheet : getCurrentSheet(),
    KEY_PROFILE_NAME,
    profileName
  );
  // if sheet is empty then make a template row automatically
  var currentSheet = sheet ? sheet : getCurrentSheet();
  if (isSheetEmpty(currentSheet)) {
    makeTemplate(currentSheet, forAdmin=false, newSheet=true);
  }
}

function setLastUsedSchemaVersion(sheet, input) {
  var schemaVersion = input ? input : Browser.inputBox(
    `* Current sheet's last used schema version:\\n${getLastUsedSchemaVersion(sheet)}\\n\\n` +
    "Enter a new schema version:"
  );
  setSheetDevMetadata(
    sheet ? sheet : getCurrentSheet(),
    KEY_LAST_USED_SCHEMA_VERSION,
    schemaVersion
  );
}

function resetLastUsedSchemaVersion(sheet) {
  setSheetDevMetadata(
    sheet ? sheet : getCurrentSheet(),
    KEY_LAST_USED_SCHEMA_VERSION,
    undefined
  );
}

function showSheetAllDevMetadata(sheet) {
  var allMetadata = getSheetAllDevMetadata(
    sheet ? sheet : getCurrentSheet()
  );
  alertBox(JSON.stringify(allMetadata, null, 4));
}

function showSpreadsheetAllDevMetadata() {
  var allMetadata = getSpreadsheetAllDevMetadata();
  alertBox(JSON.stringify(allMetadata, null, 4));
}
