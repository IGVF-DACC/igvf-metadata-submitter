global.onOpen = () => {
  // create custom menu
  const menu = SpreadsheetApp.getUi().createMenu('IGVF/ENCODE');

  menu.addItem('Search', 'search');
  menu.addSeparator();
  menu.addItem('Show sheet info & header legend', 'showSheetInfoAndHeaderLegend');
  menu.addSeparator();

  menu.addItem('Validate', 'validateJsonWithSchema');
  menu.addSeparator();
  menu.addItem('Make new template row', 'makeTemplateForUser');
  menu.addItem('GET metadata from portal', 'getMetadataForAllForUser');
  menu.addItem('POST new metadata to portal', 'postAll');
  // menu.addItem('PATCH selected columns', 'patchSelected');
  // menu.addItem('PATCH-APPEND selected columns', 'patchAppendAll');
  // menu.addItem('PATCH-REMOVE selected columns', 'patchRemoveAll');
  menu.addSeparator();
  menu.addItem('Make new template row (ADMIN)', 'makeTemplateForAdmin');
  menu.addItem('GET metadata from portal (ADMIN)', 'getMetadataForAllForAdmin');
  menu.addItem("REPLACE metadata with portal's (ADMIN)", 'putAll');
  menu.addSeparator();
  menu.addItem('Convert selected row to JSON', 'convertSelectedRowToJson');
  menu.addSeparator();

  const submenuTools = SpreadsheetApp.getUi().createMenu('🛠 Tools');

  submenuTools.addItem('Open profile page', 'openProfilePage');
  submenuTools.addItem('Apply profile to sheet manually', 'applyProfileToSheet');
  submenuTools.addItem('Export JSON to Google Drive', 'exportToJson');

  menu.addSubMenu(submenuTools);
  menu.addSeparator();

  const submenuAuth = SpreadsheetApp.getUi().createMenu('⚙️ Authorization');
  submenuAuth.addItem('Authorize for ENCODE', 'authorizeForEncode');
  submenuAuth.addItem('Authorize for IGVF', 'authorizeForIgvf');
  menu.addSubMenu(submenuAuth);

  const submenuSettingsGlobal = SpreadsheetApp.getUi().createMenu('⚙️ Settings (Global)');
  submenuSettingsGlobal.addItem('Set default endpoint for READs (GET)', 'setDefaultEndpointRead');
  submenuSettingsGlobal.addItem('Set default endpoint for WRITEs (POST/PATCH/PUT)', 'setDefaultEndpointWrite');
  submenuSettingsGlobal.addItem('Set default profile name', 'setDefaultProfileName');
  menu.addSubMenu(submenuSettingsGlobal);

  const submenuSettingsSheet = SpreadsheetApp.getUi().createMenu('⚙️ Settings (This sheet)');
  submenuSettingsSheet.addItem('Set endpoint for READs (GET)', 'setEndpointRead');
  submenuSettingsSheet.addItem('Set endpoint for WRITEs (POST/PATCH/PUT)', 'setEndpointWrite');
  submenuSettingsSheet.addItem('Set profile name', 'setProfileName');
  menu.addSubMenu(submenuSettingsSheet);

  menu.addSeparator();

  menu.addItem("Open tool's github page for README", 'openToolGithubPage');
  menu.addToUi();
};
