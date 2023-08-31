SCRIPT_VERSION='v0.2.7'
SCRIPT_UPDATE_HELP_URL='https://github.com/IGVF-DACC/igvf-metadata-submitter/blob/main/UPDATE.md'


function getScriptVersion() {
  return SCRIPT_VERSION
}

function getLatestScriptVersionFromGithub() {
  var response = UrlFetchApp.fetch(
    'https://api.github.com/repos/igvf-dacc/igvf-metadata-submitter/releases/latest'
  );
  return JSON.parse(response.getContentText()).tag_name;
}
