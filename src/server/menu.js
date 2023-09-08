global.onOpen = () => {
  const version = global.getScriptVersion();
  const menu = SpreadsheetApp.getUi().createMenu(`IGVF ${version}`);

  menu.addItem('Search', 'search');
  menu.addItem('File upload sidebar', 'uploadSidebar');
  menu.addSeparator();
  menu.addItem('Show sheet info', 'showSheetInfoAndHeaderLegend');
  menu.addSeparator();
  menu.addItem('Check for script update', 'checkForUpdate');
  menu.addSeparator();
  menu.addItem('Update current sheet schema version', 'updateCurrentSheet');
  // menu.addItem('Update all sheets', 'updateAllSheets');
  menu.addSeparator();
  menu.addItem('Validate', 'validateJsonWithSchema');
  menu.addSeparator();
  menu.addItem('Export selected row to JSON', 'convertSelectedRowToJson');
  menu.addSeparator();
  menu.addItem('Make new template row', 'makeTemplateForUser');
  menu.addItem('GET metadata from portal', 'getMetadataForAllForUser');
  menu.addItem('POST new metadata to portal', 'postAll');
  menu.addItem('PATCH selected columns', 'patchSelected');
  menu.addItem('PATCH all columns', 'patchAll');
  // menu.addItem('PATCH-APPEND selected columns', 'patchAppendAll');
  // menu.addItem('PATCH-REMOVE selected columns', 'patchRemoveAll');
  menu.addSeparator();

  const submenuTools = SpreadsheetApp.getUi().createMenu('🛠 Tools');
  submenuTools.addItem('Make new template row (ADMIN ONLY)', 'makeTemplateForAdmin');
  submenuTools.addItem('GET metadata from portal (ADMIN ONLY)', 'getMetadataForAllForAdmin');
  submenuTools.addItem('PUT metadata to portal (ADMIN ONLY)', 'putAll');
  submenuTools.addSeparator();
  submenuTools.addItem('Open profile page', 'openProfilePage');
  submenuTools.addItem('Apply profile to sheet manually', 'applyProfileToSheet');
  submenuTools.addSeparator();
  submenuTools.addItem('Export sheet to JSON', 'exportToJsonText');
  submenuTools.addItem('Export sheet to JSON file (Google Drive)', 'exportToJson');
  submenuTools.addItem("Open tool's github page for README", 'openToolGithubPage');
  const submenuDeveloper = SpreadsheetApp.getUi().createMenu('🛠 Developers only (for debugging)');
  submenuDeveloper.addItem('Show current sheet developer metadata', 'showSheetAllDevMetadata');
  submenuDeveloper.addItem('Show spreadsheet developer metadata', 'showSpreadsheetAllDevMetadata');
  submenuDeveloper.addItem("Set current sheet's last used schema version", 'setLastUsedSchemaVersion');
  submenuDeveloper.addItem('Authorize for ENCODE', 'authorizeForEncode');
  submenuTools.addSubMenu(submenuDeveloper);
  menu.addSubMenu(submenuTools);
  menu.addSeparator();

  const submenuAuth = SpreadsheetApp.getUi().createMenu('⚙️ Authorization');
  submenuAuth.addItem('Authorize for IGVF', 'authorizeForIgvf');
  menu.addSubMenu(submenuAuth);

  const submenuSettingsGlobal = SpreadsheetApp.getUi().createMenu('⚙️ Settings (Global)');
  submenuSettingsGlobal.addItem('Set default endpoint for READs (GET)', 'setDefaultEndpointRead');
  submenuSettingsGlobal.addItem('Set default endpoint for WRITEs (POST/PATCH/PUT)', 'setDefaultEndpointWrite');
  submenuSettingsGlobal.addSeparator();
  submenuSettingsGlobal.addItem('Set default profile name', 'setDefaultProfileName');
  menu.addSubMenu(submenuSettingsGlobal);

  const submenuSettingsSheet = SpreadsheetApp.getUi().createMenu('⚙️ Settings (Current sheet)');
  submenuSettingsSheet.addItem('Set endpoint for READs (GET)', 'setEndpointRead');
  submenuSettingsSheet.addItem('Set endpoint for WRITEs (POST/PATCH/PUT)', 'setEndpointWrite');
  submenuSettingsSheet.addSeparator();
  submenuSettingsSheet.addItem('Set profile name', 'setProfileName');
  menu.addSubMenu(submenuSettingsSheet);

  menu.addToUi();
};
