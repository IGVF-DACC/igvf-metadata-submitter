const PROPERTY_DEFAULT_PROFILE_NAME = "defaultProfileName";

const KEY_ENDPOINT_READ = "endpointRead";
const KEY_ENDPOINT_WRITE = "endpointWrite";
const KEY_PROFILE_NAME = "profileName";

const URL_GITHUB = "https://github.com/encode-DCC/google-sheet-metadata-submitter";


function setDefaultEndpointRead() {
  var endpoint = Browser.inputBox(
    `* Current default endpoint for READs (GET):\\n${getDefaultEndpointRead()}\\n\\n` +
    "* Supported ENCODE endpoints:\\n" +
    `${ENCODE_ENDPOINTS.join("\\n")}\\n\\n` +
    "* Supported IGVF endpoints:\\n" +
    `${IGVF_ENDPOINTS.join("\\n")}\\n\\n` +
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

  var userProperties = PropertiesService.getUserProperties();
  return userProperties.setProperty(PROPERTY_DEFAULT_ENDPOINT_READ, endpoint);
}

function setDefaultEndpointWrite() {
  var endpoint = Browser.inputBox(
    `* Current default endpoint for Write actions (PUT/POST):\\n${getDefaultEndpointWrite()}\\n\\n` +
    "* Supported ENCODE endpoints:\\n" +
    `${ENCODE_ENDPOINTS.join("\\n")}\\n\\n` +
    "* Supported IGVF endpoints:\\n" +
    `${IGVF_ENDPOINTS.join("\\n")}\\n\\n` +
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

  var userProperties = PropertiesService.getUserProperties();
  return userProperties.setProperty(PROPERTY_DEFAULT_ENDPOINT_WRITE, endpoint);
}

function checkProfile() {
  if (getProfileName() && getProfile(getProfileName(), getEndpointRead())) {
    return true;
  }
  alertBox(
    "No profile name found.\n" + 
    "Go to the menu 'IGVF/ENCODE' -> 'Settings & auth' to define it."
  );
}

function search() {
  if (!checkProfile()) {
    return;
  }

  var sheet = getCurrentSheet();

  var currentRow = sheet.getActiveCell().getRow();
  if (currentRow <= HEADER_ROW) {
    alertBox("Select a non-header data cell and run Search.");
    return;
  }
  var currentCol = sheet.getActiveCell().getColumn();
  if (!currentCol) {
    alertBox("Cannot find a column for the selected cell.");
    return;
  }
  var currentProp = getCellValue(sheet, HEADER_ROW, currentCol);
  var profile = getProfile(getProfileName(), getEndpointRead());

  var endpointForSearch = getEndpointRead();

  // adhoc fix for having different endpoints for REST and search.
  if (isIgvfEndpoint(endpointForSearch)) {
    endpointForSearch = ENDPOINT_IGVF_SEARCH_UI;
  }

  var url = makeSearchUrlForProp(profile, currentProp, endpointForSearch);

  if (url) {
    var propType = profile["properties"][currentProp]["type"];
    var selectedCellValue = SpreadsheetApp.getActiveSheet().getActiveCell().getValue();
    openSearch(
      url, currentProp, propType, endpointForSearch, selectedCellValue,
    );
  } else {
    alertBox("Couldn't find Search URL for selected column's property.");
  }
}

function openProfilePage() {
  if (!checkProfile()) {
    return;
  }

  openUrl(
    makeProfileUrl(getProfileName(), getEndpointRead(), format="page")
  );
}

function openToolGithubPage() {
  openUrl(URL_GITHUB);
}

function showSheetInfoAndHeaderLegend() {
  alertBox(
    "* Settings for THIS SHEET\n" +
    `- Endpoint READ (GET): ${getEndpointRead()}\n` +
    `- Endpoint WRITE (POST/PATCH/PUT): ${getEndpointWrite()}\n` +
    `- Profile name: ${getProfileName()}\n\n` +

    "* Global settings (used if settings for this sheet are not defined)\n" +
    `- Endpoint READ (GET): ${getDefaultEndpointRead()}\n` +
    `- Endpoint WRITE (POST/PATCH/PUT): ${getDefaultEndpointWrite()}\n` +
    `- Profile name: ${getDefaultProfileName()}\n\n` +

    "* Color legends for header properties\n" +
    "- red: required property\n" +
    "- blue: indentifying property\n" +
    "- black: other editable property\n" +
    "- gray: ADMIN only property (readonly,nonSubmittable,'Do not sumit')\n\n" +

    "* Commented properties (filtered out for REST actions)\n" +
    "- #skip: Set it to 1 to skip any REST actions to the portal.\n" +
    "- #error: For debugging info. REST action + HTTP error code + help text.\n\n" +
    "* Searchable properties\n" +
    "- Bold + Underline: Select a data cell and go to the menu 'IGVF/ENCODE' -> 'Search'."
  );
}

function applyProfileToSheet() {
  if (!checkProfile()) {
    return;
  }

  var sheet = getCurrentSheet();
  var profile = getProfile(getProfileName(), getEndpointRead());

  // clear tooltip and dropdown menus
  clearFontColorInSheet(sheet);
  clearNoteInSheet(sheet);
  clearFormatInSheet(sheet);
  clearDataValidationsInSheet(sheet);

  // align all text to TOP to make more readable
  setRangeAlignTop(sheet);

  var missingProps = highlightHeaderAndDataCell(sheet, profile);
  if (missingProps.length > 0) {
    alertBox(
      "Some properties are missing in the given profile.\n" +
      "- Possible mismatch between profile and accession?\n\n" +
      "* Current profile: " + getProfileName() + "\n\n" +
      "* Missing properties:\n" + missingProps.join(", ")
    );
  }
}

function makeTemplate(forAdmin=false) {
  if (!checkProfile()) {
    return;
  }

  var sheet = getCurrentSheet();
  var profile = getProfile(getProfileName(), getEndpointRead());

  addMetadataTemplateToSheet(sheet, profile, forAdmin);

  applyProfileToSheet();
}

function makeTemplateForAdmin() {
  makeTemplate(forAdmin=true);
}

function makeTemplateForUser() {
  makeTemplate(forAdmin=false);
}

function getMetadataForAll(forAdmin) {
  if (!checkProfile()) {
    return;
  }

  var sheet = getCurrentSheet();
  var profile = getProfile(getProfileName(), getEndpointRead());

  if (profile["identifyingProperties"]
    .filter(prop => findColumnByHeaderValue(sheet, prop))
    .length === 0) {
    alertBox(
      `Couldn't find an identifying property (${profile["identifyingProperties"].join(",")}) in header row ${HEADER_ROW}\n\n` +
      `Add a proper identifying property to the header row and define it for each data row to retrieve from the portal.\n` +
      `You can also add "${HEADER_COMMENTED_PROP_SKIP}" column and set it to 1 for any row to skip all REST actions for that specific row.`
    );
    return;
  }

  var numData = getNumMetadataInSheet(sheet);
  if (numData && !alertBoxOkCancel(
    `Found ${numData} data row(s).\n\n` + 
    "THIS CAN OVERWRITE ON EXISTING DATA ROWS IF #skip IS NOT SET AS 1.\n\n" +
    "Are you sure to proceed?")) {
    return;
  }

  var numUpdated = updateSheetWithMetadataFromPortal(
    sheet, getProfileName(), getEndpointRead(), getEndpointRead(), forAdmin,
  );
  alertBox(`Updated ${numUpdated} rows.`);

  applyProfileToSheet();
}

function getMetadataForAllForAdmin() {
  return getMetadataForAll(forAdmin=true);
}

function getMetadataForAllForUser() {
  return getMetadataForAll(forAdmin=false);
}

function useExternalJsonValidator() {
  if (!checkProfile()) {
    return;
  }

  var sheet = getCurrentSheet();

  var numData = getNumMetadataInSheet(sheet);
  if (numData && !alertBoxOkCancel(
    `Found ${numData} data row(s).\n\n` + 
    "DO NOT USE THIS IF YOU ARE WORKING ON SENSATIVE DATA. USE IT AT YOUR OWN RISK.\n" +
    "IT IS RECOMMENDED TO CONVERT EACH ROW INTO JSON AND THEN COPY-PASTE IT TO YOUR INTERNAL JSON VALIDATOR.\n\n" +
    "This will validate your data on sheet against the profile schema by using an EXTERNAL JSON schema validator.\n" +
    "Use this function only when you get an error from the portal and the help message is not very helpful for debugging.\n\n" +
    `You can add ${HEADER_COMMENTED_PROP_SKIP} column and set it to 1 for a row that you want to skip validation.\n\n` +
    "Are you sure to proceed?")) {
    return;
  }

  var numSubmitted = validateSheet(
    sheet, getProfileName(), getEndpointRead()
  );
  alertBox(`Validated ${numSubmitted} rows.`);
}

function convertSelectedRowToJson() {
  if (!checkProfile()) {
    return;
  }

  var sheet = getCurrentSheet();
  var currentRow = sheet.getActiveCell().getRow();
  if (currentRow <= HEADER_ROW) {
    alertBox("Select a non-header data cell.");
    return;
  }

  var json = convertRowToJson(
    sheet, currentRow, getProfileName(), getEndpointRead(), keepCommentedProps=false
  );
  var jsonText = JSON.stringify(json, null, EXPORTED_JSON_INDENT);

  var htmlOutput = HtmlService
      .createHtmlOutput(`<pre>${jsonText}</pre>`)
      .setWidth(500)
      .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, `Row: ${currentRow}`);
}

function putAll() {
  if (!checkProfile()) {
    return;
  }

  var sheet = getCurrentSheet();

  var numData = getNumMetadataInSheet(sheet);
  if (numData && !alertBoxOkCancel(
    `Found ${numData} data row(s).\n\n` + 
    "PUT action will REPLACE metadata on the portal with those on the sheet. " +
    "Therefore, any properties missing on the sheet will also be REMOVED from portal's metadata.\n\n" +
    `You can add ${HEADER_COMMENTED_PROP_SKIP} column and set it to 1 for a row that you want to skip REST actions.\n\n` +
    `Are you sure to PUT to ${getEndpointWrite()}?`)) {
    return;
  }

  var numSubmitted = submitSheetToPortal(
    sheet, getProfileName(), getEndpointWrite(), getEndpointRead(), method="PUT"
  );
  alertBox(`Submitted (PUT) ${numSubmitted} rows to ${getEndpointWrite()}.`);
}

function patchAll() {
  if (!checkProfile()) {
    return;
  }

  var sheet = getCurrentSheet();

  var numData = getNumMetadataInSheet(sheet);
  if (numData && !alertBoxOkCancel(
    `Found ${numData} data row(s).\n\n` + 
    "PATCH action will REPLACE properties on the portal with those non-empty values on the sheet.\n\n" +
    `You can add ${HEADER_COMMENTED_PROP_SKIP} column and set it to 1 for a row that you want to skip REST actions.\n\n` +
    `Are you sure to PATCH to ${getEndpointWrite()}?`)) {
    return;
  }

  var numSubmitted = submitSheetToPortal(
    sheet, getProfileName(), getEndpointWrite(), getEndpointRead(), method="PATCH"
  );
  alertBox(`Submitted (PATCH) ${numSubmitted} rows to ${getEndpointWrite()}.`);
}

function postAll() {
  if (!checkProfile()) {
    return;
  }

  var sheet = getCurrentSheet();

  var numData = getNumMetadataInSheet(sheet);
  if (numData && !alertBoxOkCancel(
    `Found ${numData} data row(s).\n\n` +
    "POST action will submit new objects (rows on the sheet) to the portal.\n\n" +
    "And then it will UPDATE rows with new identifying properties (e.g. accession, uuid) assigned from the portal. " +
    "No other properties/values will be updated on the sheet even though some new properties with " +
    "default values are assigned to them on the portal.\n\n" +
    `You can add ${HEADER_COMMENTED_PROP_SKIP} column and set it to 1 for a row that you want to skip REST actions.\n\n` +
    `Are you sure to POST to ${getEndpointWrite()}?`)) {
    return;
  }

  var numSubmitted = submitSheetToPortal(
    sheet, getProfileName(), getEndpointWrite(), getEndpointRead(), method="POST"
  );
  alertBox(`Submitted (POST) ${numSubmitted} rows to ${getEndpointWrite()}.`);

  applyProfileToSheet();
}

function exportToJson() {
  if (!checkProfile()) {
    return;
  }

  var sheet = getCurrentSheet();
  var jsonFilePath = Browser.inputBox(
    "Enter JSON file path (e.g. metadata-submitter-09-09-1999.json):"
  );

  exportSheetToJsonFile(
    sheet, getProfileName(), getEndpointRead(),
    keepCommentedProps=false,
    jsonFilePath=jsonFilePath,
  );
}

function authorize(server) {
  if (getUsername(server) && getPassword(server)) {
    if (!alertBoxOkCancel(
      `Username and password already exist for ${server}, are you sure to proceed?`)) {
      return;
    }
  }

  var username = Browser.inputBox(`Enter your username for ${server}:`);
  if (!username || username === "cancel") {
    alertBox("Failed to update username.");
    return;
  }
  setUsername(username, server);

  var password = Browser.inputBox(`Enter your password for ${server}:`);
  if (!password || password === "cancel") {
    alertBox("Failed to update password.");
    return;
  }
  setPassword(password, server);
}

function authorizeForEncode() {
  return authorize(ENCODE);
}

function authorizeForIgvf() {
  return authorize(IGVF);
}

function setEndpointRead() {
  var endpoint = Browser.inputBox(
    `* Current endpoint for READs (GET):\\n${getEndpointRead()}\\n\\n` +
    "* Supported ENCODE endpoints:\\n" +
    `${ENCODE_ENDPOINTS.join("\\n")}\\n\\n` +
    "* Supported IGVF endpoints:\\n" +
    `${IGVF_ENDPOINTS.join("\\n")}\\n\\n` +
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
  setCurrentSheetMetadata(KEY_ENDPOINT_READ, endpoint);
}

function setEndpointWrite() {
  var endpoint = Browser.inputBox(
    `* Current endpoint for Write actions (PUT/POST):\\n${getEndpointWrite()}\\n\\n` +
    "* Supported ENCODE endpoints:\\n" +
    `${ENCODE_ENDPOINTS.join("\\n")}\\n\\n` +
    "* Supported IGVF endpoints:\\n" +
    `${IGVF_ENDPOINTS.join("\\n")}\\n\\n` +
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
  setCurrentSheetMetadata(KEY_ENDPOINT_WRITE, endpoint);
}

function setProfileName() {    
  var profileName = Browser.inputBox(
    `* Current profile name:\\n${getProfileName()}\\n\\n` +
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
  setCurrentSheetMetadata(KEY_PROFILE_NAME, profileName);
}

function getDefaultProfileName() {
  var userProperties = PropertiesService.getUserProperties();
  return userProperties.getProperty(PROPERTY_DEFAULT_PROFILE_NAME);
}

function setDefaultProfileName() {    
  var profileName = Browser.inputBox(
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
  var userProperties = PropertiesService.getUserProperties();
  return userProperties.setProperty(PROPERTY_DEFAULT_PROFILE_NAME, profileName);
}

function getDefaultEndpointRead() {
  var userProperties = PropertiesService.getUserProperties();
  var defaultEndpointRead = userProperties.getProperty(PROPERTY_DEFAULT_ENDPOINT_READ);
  return defaultEndpointRead ? defaultEndpointRead : DEFAULT_ENDPOINT_READ
}

function getDefaultEndpointWrite() {
  var userProperties = PropertiesService.getUserProperties();
  var defaultEndpointWrite = userProperties.getProperty(PROPERTY_DEFAULT_ENDPOINT_WRITE);
  return defaultEndpointWrite ? defaultEndpointWrite : DEFAULT_ENDPOINT_WRITE
}

function getEndpointRead() {
  var endpoint = getCurrentSheetMetadata(KEY_ENDPOINT_READ);
  return endpoint ? endpoint : getDefaultEndpointRead();
}

function getEndpointWrite() {
  var endpoint = getCurrentSheetMetadata(KEY_ENDPOINT_WRITE);
  return endpoint ? endpoint : getDefaultEndpointWrite();
}

function getProfileName() {
  var profileName = getCurrentSheetMetadata(KEY_PROFILE_NAME);
  return profileName ? profileName : getDefaultProfileName();
}
