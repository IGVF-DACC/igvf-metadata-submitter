SCRIPT_VERSION='v0.3.0';
URL_LATEST_SCRIPT_VERSION='https://api.github.com/repos/igvf-dacc/igvf-metadata-submitter/releases/latest';
URL_PREFIX_UPDATE_HELP='https://github.com/IGVF-DACC/igvf-metadata-submitter/blob/';
URL_SUFFIX_UPDATE_HELP='/UPDATE.md';


https://github.com/IGVF-DACC/igvf-metadata-submitter/blob/v0.2.6/README.md


function getScriptVersion() {
  return SCRIPT_VERSION;
}

function getLatestScriptVersionFromGithub() {
  var response = UrlFetchApp.fetch(URL_LATEST_SCRIPT_VERSION);
  return JSON.parse(response.getContentText()).tag_name;
}

function getUpdateHelpUrl(version) {
  return URL_PREFIX_UPDATE_HELP + version + URL_SUFFIX_UPDATE_HELP;
}