global.onOpen = () => {
  // create custom menu
  const menu = SpreadsheetApp.getUi().createMenu('IGVF/ENCODE');

  menu.addItem('Search', 'search');
  menu.addSeparator();
  menu.addItem('Show sheet info & header legend', 'showSheetInfoAndHeaderLegend');
  menu.addSeparator();

  const submenuSettingsAuth = SpreadsheetApp.getUi().createMenu('⚙️ Settings & auth.');

  const submenuSettingsAuthGlobal = SpreadsheetApp.getUi().createMenu('Global settings & auth');

  submenuSettingsAuthGlobal.addItem('Authorize for ENCODE', 'authorizeForEncode');
  submenuSettingsAuthGlobal.addItem('Authorize for IGVF', 'authorizeForIgvf');
  submenuSettingsAuthGlobal.addItem('Set default endpoint for READs (GET)', 'setDefaultEndpointRead');
  submenuSettingsAuthGlobal.addItem('Set default endpoint for WRITEs (POST/PATCH/PUT)', 'setDefaultEndpointWrite');
  submenuSettingsAuthGlobal.addItem('Set default profile name', 'setDefaultProfileName');
  submenuSettingsAuth.addSubMenu(submenuSettingsAuthGlobal);

  const submenuSettingsAuthSheet = SpreadsheetApp.getUi().createMenu('Settings for THIS SHEET');

  submenuSettingsAuthSheet.addItem('Set endpoint for READs (GET)', 'setEndpointRead');
  submenuSettingsAuthSheet.addItem('Set endpoint for WRITEs (POST/PATCH/PUT)', 'setEndpointWrite');
  submenuSettingsAuthSheet.addItem('Set profile name', 'setProfileName');
  submenuSettingsAuth.addSubMenu(submenuSettingsAuthSheet);

  menu.addSubMenu(submenuSettingsAuth);
  menu.addSeparator();
  menu.addItem('Validate all rows', 'validateJsonWithSchema');
  menu.addSeparator();
  menu.addItem('Make new template row', 'makeTemplateForUser');
  menu.addItem('GET metadata for all rows', 'getMetadataForAllForUser');
  menu.addSeparator();
  menu.addItem('Make new template row (ADMIN)', 'makeTemplateForAdmin');
  menu.addItem('GET metadata for all rows (ADMIN)', 'getMetadataForAllForAdmin');
  menu.addItem('PUT all rows to the portal (ADMIN)', 'putAll');
  menu.addSeparator();
  menu.addItem('PATCH all rows to the portal', 'patchAll');
  // menu.addItem('PATCH-APPEND all rows to the portal', 'patchAppendAll');
  // menu.addItem('PATCH-REMOVE all rows to the portal', 'patchRemoveAll');
  menu.addItem('POST all rows to the portal', 'postAll');
  menu.addSeparator();
  menu.addItem('Convert selected row to JSON', 'convertSelectedRowToJson');
  menu.addSeparator();

  const submenuTools = SpreadsheetApp.getUi().createMenu('🛠 Tools');

  submenuTools.addItem('Open profile page', 'openProfilePage');
  submenuTools.addItem('Apply profile to sheet manually', 'applyProfileToSheet');
  submenuTools.addItem('Export JSON to Google Drive', 'exportToJson');

  menu.addSubMenu(submenuTools);
  menu.addSeparator();
  menu.addItem("Open tool's github page for README", 'openToolGithubPage');
  menu.addToUi();
};
