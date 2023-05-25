/*
Getters and setters for data stored in Google's Developer Metadata.
Such data include values for "Settings" of this tool.

Key names are shared between Spreadsheet and Sheet (current sheet by default).
But they are stored separately in different scopes.

e.g. getSpreadsheetDevMetadata vs. getSheetDevMetadata(sheet)

*/

const KEY_ENDPOINT_READ = "endpointRead";
const KEY_ENDPOINT_WRITE = "endpointWrite";
const KEY_PROFILE_NAME = "profileName";
const KEY_LAST_USED_SCHEMA_VERSION = "lastUsedSchemaVersion";


function getDefaultEndpointRead() {
  var defaultEndpointRead = getSpreadsheetDevMetadata(KEY_ENDPOINT_READ);
  return defaultEndpointRead ? defaultEndpointRead : DEFAULT_ENDPOINT_READ
}

function getDefaultEndpointWrite() {
  var defaultEndpointWrite = getSpreadsheetDevMetadata(KEY_ENDPOINT_WRITE);
  return defaultEndpointWrite ? defaultEndpointWrite : DEFAULT_ENDPOINT_WRITE
}

function getDefaultProfileName() {
  return getSpreadsheetDevMetadata(KEY_PROFILE_NAME);
}

function getEndpointRead(sheet) {
  var endpoint = getSheetDevMetadata(
    sheet !== undefined ? sheet : getCurrentSheet(),
    KEY_ENDPOINT_READ
  );
  return endpoint ? endpoint : getDefaultEndpointRead();
}

function getEndpointWrite(sheet) {
  var endpoint = getSheetDevMetadata(
    sheet !== undefined ? sheet : getCurrentSheet(),
    KEY_ENDPOINT_WRITE
  );
  return endpoint ? endpoint : getDefaultEndpointWrite();
}

function getProfileName(sheet) {
  var profileName = getSheetDevMetadata(
    sheet !== undefined ? sheet : getCurrentSheet(),
    KEY_PROFILE_NAME
  );
  return profileName ? profileName : getDefaultProfileName();
}

function getLastUsedSchemaVersion(sheet) {
  return getSheetDevMetadata(
    sheet !== undefined ? sheet : getCurrentSheet(),
    KEY_LAST_USED_SCHEMA_VERSION
  );
}

function setDefaultEndpointRead(input) {
  var endpoint = input !== undefined ? input : Browser.inputBox(
    `* Current default endpoint for READs (GET):\\n${getDefaultEndpointRead()}\\n\\n` +
    "* Supported ENCODE endpoints:\\n" +
    `${ENCODE_ENDPOINTS.join("\\n")}\\n\\n` +
    "* Supported IGVF endpoints:\\n" +
    `${getIgvfEndpointsAvailableForUsers().join("\\n")}\\n\\n` +
    "Enter a new endpoint:"
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
  setSpreadsheetDevMetadata(KEY_ENDPOINT_READ, endpoint);
}

function setDefaultEndpointWrite(input) {
  var endpoint = input !== undefined ? input : Browser.inputBox(
    `* Current default endpoint for Write actions (PUT/POST):\\n${getDefaultEndpointWrite()}\\n\\n` +
    "* Supported ENCODE endpoints:\\n" +
    `${ENCODE_ENDPOINTS.join("\\n")}\\n\\n` +
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


function setEndpointRead(sheet, input) {
  var endpoint = input !== undefined ? input : Browser.inputBox(
    `* Current endpoint for READs (GET):\\n${getEndpointRead(sheet)}\\n\\n` +
    "* Supported ENCODE endpoints:\\n" +
    `${ENCODE_ENDPOINTS.join("\\n")}\\n\\n` +
    "* Supported IGVF endpoints:\\n" +
    `${getIgvfEndpointsAvailableForUsers().join("\\n")}\\n\\n` +
    "Enter a new endpoint:"
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
  setSheetDevMetadata(
    sheet !== undefined ? sheet : getCurrentSheet(),
    KEY_ENDPOINT_READ,
    endpoint
  );
}

function setEndpointWrite(sheet, input) {
  var endpoint = input !== undefined ? input : Browser.inputBox(
    `* Current endpoint for Write actions (PUT/POST):\\n${getEndpointWrite(sheet)}\\n\\n` +
    "* Supported ENCODE endpoints:\\n" +
    `${ENCODE_ENDPOINTS.join("\\n")}\\n\\n` +
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
  setSheetDevMetadata(
    sheet !== undefined ? sheet : getCurrentSheet(),
    KEY_ENDPOINT_WRITE,
    endpoint
  );
}

function setProfileName(sheet, input) {    
  var profileName = input !== undefined ? input : Browser.inputBox(
    `* Current profile name:\\n${getProfileName(sheet)}\\n\\n` +
    "Snakecase (with _) or capitalized CamelCase are allowed for a profile name.\\n" +
    "No plural (s) is allowed in profile name.\\n" +
    "(e.g. Experiment, BiosampleType, biosample_type, lab):\\n\\n" +
    "Enter a new profile name:"
  );
  if (!isValidProfileName(profileName, getEndpointRead())) {
    if (profileName !== "cancel") {
      alertBox("Wrong profile name: " + profileName);
    }
    return;
  }
  setSheetDevMetadata(
    sheet !== undefined ? sheet : getCurrentSheet(),
    KEY_PROFILE_NAME,
    profileName
  );
}

function setDefaultProfileName(input) {
  var profileName = input !== undefined ? input : Browser.inputBox(
    `* Current default profile name:\\n${getDefaultProfileName()}\\n\\n` +
    "Snakecase (with _) or capitalized CamelCase are allowed for a profile name.\\n" +
    "No plural (s) is allowed in profile name.\\n" +
    "(e.g. Experiment, BiosampleType, biosample_type, lab):\\n\\n" +
    "Enter a new profile name:"
  );
  if (!isValidProfileName(profileName, getEndpointRead())) {
    if (profileName !== "cancel") {
      alertBox("Wrong profile name: " + profileName);
    }
    return;
  }
  setSpreadsheetDevMetadata(KEY_PROFILE_NAME, profileName);
}

function setLastUsedSchemaVersion(sheet, input) {
  var schemaVersion = input !== undefined ? input : Browser.inputBox(
    `* Current sheet's last used schema version:\\n${getLastUsedSchemaVersion(sheet)}\\n\\n` +
    "Enter a new schema version:"
  );
  setSheetDevMetadata(
    sheet !== undefined ? sheet : getCurrentSheet(),
    KEY_LAST_USED_SCHEMA_VERSION,
    schemaVersion
  );
}

function showSheetAllDevMetadata(sheet) {
  var allMetadata = getSheetAllDevMetadata(
    sheet !== undefined ? sheet : getCurrentSheet()
  );
  alertBox(JSON.stringify(allMetadata, null, 4));
}

function showSpreadsheetAllDevMetadata() {
  var allMetadata = getSpreadsheetAllDevMetadata();
  alertBox(JSON.stringify(allMetadata, null, 4));
}
