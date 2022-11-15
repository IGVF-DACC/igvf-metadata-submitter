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
  menu.addItem('Make new template row (ADMIN)', 'makeTemplateForAdmin');
  menu.addItem('GET metadata for all rows (ADMIN)', 'getMetadataForAllForAdmin');
  menu.addItem('PUT all rows to the portal (ADMIN)', 'putAll');
  menu.addSeparator();
  menu.addItem('Make new template row (USER)', 'makeTemplateForUser');
  menu.addItem('GET metadata for all rows (USER)', 'getMetadataForAllForUser');
  menu.addSeparator();
  menu.addItem('PATCH all rows to the portal (USER/ADMIN)', 'patchAll');
  menu.addItem('POST all rows to the portal (USER/ADMIN)', 'postAll');
  menu.addSeparator();
  menu.addItem('Convert selected row to JSON', 'convertSelectedRowToJson');
  menu.addSeparator();

  const submenuTools = SpreadsheetApp.getUi().createMenu('🛠 Tools');

  submenuTools.addItem('Open profile page', 'openProfilePage');
  submenuTools.addItem('Apply profile to sheet manually', 'applyProfileToSheet');
  submenuTools.addItem('Use external JSON validator for all rows (DANGER)', 'useExternalJsonValidator');
  submenuTools.addItem('Export JSON to Google Drive', 'exportToJson');

  menu.addSubMenu(submenuTools);
  menu.addSeparator();
  menu.addItem("Open tool's github page for README", 'openToolGithubPage');
  menu.addToUi();
};
