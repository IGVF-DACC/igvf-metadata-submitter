const SEARCH_BOX_WIDTH = 700;
const SEARCH_BOX_HEIGHT = 500;


function openSearch(url, prop, propType, endpoint, selectedCellValue) {
  var html = HtmlService.createTemplateFromFile("SearchTemplate");
  html.url = url;
  html.propType = propType;
  html.endpoint = endpoint;
  if (propType == "array") {
    if (selectedCellValue === "") {
      selectedCellValue = '[]';
    }
    html.text = JSON.parse(selectedCellValue).join("\n");
  } else {
    html.text = selectedCellValue;
  }

  var htmlOutput = html
    .evaluate()
    .setWidth(SEARCH_BOX_WIDTH)
    .setHeight(SEARCH_BOX_HEIGHT);
 
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, `Search for ${prop}`);
}

function clickAccept(newCellValue) {
  getCurrentSheet().getActiveCell().setValue(newCellValue);
}

function clickCancel() {
}
