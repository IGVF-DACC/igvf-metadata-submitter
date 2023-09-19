global.onOpen = () => {
  const version = global.getScriptVersion();
  const menu = SpreadsheetApp.getUi().createMenu(`IGVF ${version}`);

  menu.addItem('Search', 'search');
  menu.addSeparator();
  menu.addItem('Set profile name', 'setProfileName');
  menu.addItem('Show sheet info', 'showSheetInfoAndHeaderLegend');
  menu.addSeparator();
  menu.addItem('Validate', 'validateJsonWithSchema');
  menu.addSeparator();
  menu.addItem('GET metadata from portal', 'getMetadataForAllForUser');
  menu.addItem('POST new metadata to portal', 'postAll');
  menu.addItem('PATCH selected columns', 'patchSelected');
  menu.addItem('PATCH all columns', 'patchAll');
  menu.addSeparator();
  menu.addItem('File upload sidebar', 'uploadSidebar');
  menu.addSeparator();

  const submenuTools = SpreadsheetApp.getUi().createMenu('🛠 Tools');
  submenuTools.addItem('Make a new template row', 'makeTemplateForUser');
  submenuTools.addItem('Highlight sheet with profile schema', 'applyProfileToSheet');
  submenuTools.addSeparator();
  submenuTools.addItem('Create a new sheet with updated profile schema', 'updateCurrentSheet');
  submenuTools.addSeparator();
  submenuTools.addItem('Export selected row to JSON', 'convertSelectedRowToJson');
  submenuTools.addItem('Export sheet to JSON', 'exportToJsonText');
  submenuTools.addItem('Export sheet to JSON file (Google Drive)', 'exportToJson');
  submenuTools.addSeparator();
  submenuTools.addItem('Open profile page', 'openProfilePage');
  submenuTools.addSeparator();
  submenuTools.addItem('Make a new template row (ADMIN ONLY)', 'makeTemplateForAdmin');
  submenuTools.addItem('GET metadata from portal (ADMIN ONLY)', 'getMetadataForAllForAdmin');
  submenuTools.addItem('PUT metadata to portal (ADMIN ONLY)', 'putAll');

  const submenuDeveloper = SpreadsheetApp.getUi().createMenu('🛠 Developers only (for debugging)');
  submenuDeveloper.addItem('Show current sheet developer metadata', 'showSheetAllDevMetadata');
  submenuDeveloper.addItem('Show spreadsheet developer metadata', 'showSpreadsheetAllDevMetadata');
  submenuDeveloper.addItem("Set current sheet's last used schema version", 'setLastUsedSchemaVersion');
  submenuDeveloper.addSeparator();
  submenuDeveloper.addItem('Authorize for ENCODE', 'authorizeForEncode');
  submenuTools.addSubMenu(submenuDeveloper);

  menu.addSubMenu(submenuTools);
  menu.addSeparator();

  menu.addItem('Authorize for IGVF', 'authorizeForIgvf');
  menu.addItem('Set endpoint', 'setDefaultEndpoint');
  menu.addSeparator();
  menu.addItem('Check for script update', 'checkForUpdate');
  menu.addItem("Open tool's github page for README", 'openToolGithubPage');

  menu.addToUi();
};
