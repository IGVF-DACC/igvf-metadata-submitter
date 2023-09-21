const DEFAULT_BASE_TEMPLATE = {
  [HEADER_COMMENTED_PROP_RESPONSE]: null,
  [HEADER_COMMENTED_PROP_RESPONSE_TIME]: null,
};

function makeMetadataTemplateFromProfile(profile, forAdmin=false, template=DEFAULT_BASE_TEMPLATE) {
  // add all properties except for non-editable ones
  // if default exists for a prop then use it
  // otherwise use null for prop
  var result = JSON.parse(JSON.stringify(template));
  for (var prop of Object.keys(profile["properties"])) {
    if (!isPostableProp(profile, prop, forAdmin)) {
      continue;
    }
    // null if default does not exist
    result[prop] = getDefaultForProp(profile, prop);
  }

  return result;
}

function addMetadataTemplateToSheet(sheet, profile, forAdmin=false) {
  var metadataObj = makeMetadataTemplateFromProfile(profile, forAdmin);
  var sortedProps = getSortedProps(Object.keys(metadataObj), profile);
  addJsonToSheet(sheet, metadataObj, sortedProps);
  // for schema version checking
  setLastUsedSchemaVersion(sheet, getProfileSchemaVersion(profile));
}

function createNewSheetAndMakeTemplate(profileName, endpoint) {
  var spreadsheet = SpreadsheetApp.getActive();
  var profile = getProfile(profileName, endpoint);

  if (spreadsheet.getSheetByName(profileName)) {
    alertBox(`Faild to create a new sheet since it already exists: ${profileName}.`);
    return;
  }

  // create a new sheet (no need to set focus on it)
  var newSheet = createNewSheet(profileName, false);
  setProfileName(newSheet, profileName);
  // makeTemplate(newSheet, forAdmin=false);
}
