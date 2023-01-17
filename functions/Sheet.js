const HEADER_ROW = 1;

function getCurrentSheet() {
  return SpreadsheetApp.getActive().getActiveSheet();
}

function setSheetMetadata(sheet, key, val) {
  var currentVal = getSheetMetadata(sheet, key);
  if (currentVal) {
    // delete existing metadata
    var finder = sheet.createDeveloperMetadataFinder().withKey(key).find();
    Logger.log(finder);
    finder[0].remove();
  }
  sheet.addDeveloperMetadata(key, val);
}

function getSheetMetadata(sheet, key) {
  // assume uniqueness
  const metadataFinder = sheet.createDeveloperMetadataFinder();
  var metadata = metadataFinder.withKey(key).find();
  if (metadata.length) {
    var val = metadata[0].getValue();
    return val;
  }
}

function getSheetAllMetadata(sheet) {
  return sheet.createDeveloperMetadataFinder().find().map(
    item => {
      return {[item.getKey()]: item.getValue()};
    }
  );
}

function setCurrentSheetMetadata(key, val) {
  setSheetMetadata(getCurrentSheet(), key, val);
}

function getCurrentSheetMetadata(key) {
  return getSheetMetadata(getCurrentSheet(), key);
}

function isSheetEmpty(sheet) {
  return sheet.getDataRange().isBlank();
}

function isRowHidden(sheet, row) {
  return sheet.isRowHiddenByUser(row);
}

function isColumnHidden(sheet, col) {
  return sheet.isColumnHiddenByUser(col);
}

function getCellValue(sheet, row, col) {
  return sheet.getRange(row, col).getValue();
}

function getLastNonEmptyColumnInRow(sheet, row) {
  // returns 0 if there isn't non-empty cell in row
  var lastCol = sheet.getLastColumn();
  if (lastCol === 0) {
    return 0;
  };
  var rowDataVals = sheet.getRange(row, 1, 1, lastCol).getValues()[0];
  for (var i = rowDataVals.length - 1; i >= 0; i--) {
    if (rowDataVals[i] !== "") {
      return i + 1;
    }
  }
  return 0;
}

function getLastNonEmptyRowInColumn(sheet, col) {
  // returns 0 if there isn't non-empty cell in row
  var lastRow = sheet.getLastRow();
  if (lastRow === 0) {
    return 0;
  };
  var colDataVals = sheet.getRange(1, col, lastRow, 1).getValues()[0];
  for (var i = colDataVals.length - 1; i >= 0; i--) {
    if (colDataVals[i] !== "") {
      return i + 1;
    }
  }
  return 0;
}

function getCellValuesInRow(sheet, row) {
  var lastNonEmptyColumnInRow = getLastNonEmptyColumnInRow(sheet, row);
  if (lastNonEmptyColumnInRow === 0) {
    return [];
  } else {
    var range = sheet.getRange(row, 1, 1, lastNonEmptyColumnInRow);
    return range.getValues()[0];
  }
}

function getCellValuesInColumn(sheet, col) {
  var lastNonEmptyRowInColumn = getLastNonEmptyRowInColumn(sheet, col);
  if (lastNonEmptyRowInColumn === 0) {
    return [];
  } else {
    var range = sheet.getRange(1, col, lastNonEmptyRowInCol, 1);
    return range.getValues()[0];
  }
}

function getLastRow(sheet) {
  return sheet.getLastRow();
}

function getLastColumn(sheet) {
  return sheet.getLastColumn();
}

function findColumnByHeaderValue(sheet, val) {
  for (var [i, headerVal] of getCellValuesInRow(sheet, HEADER_ROW).entries()) {
    var row = i + 1;
    if (headerVal === val) {
      return row;
    }
  }
}

function getRange(sheet, rowStart, colStart, rowLength, colLength) {
  return sheet.getRange(rowStart, colStart, rowLength, colLength);
}

function setCellColor(sheet, row, col, color) {
  if (color) {
    sheet.getRange(row, col).setFontColor(color);
  }
}

function setCellFormat(sheet, row, col, formats) {
  // formats: comma-separated formats
  // supported format: italic, bold, underline
  var range = sheet.getRange(row, col);
  for (var format of formats.split(",")) {
    switch(format) {
      case "italic":
        range.setFontStyle("italic");
        break;
      case "bold":
        range.setFontWeight("bold");
        break;
      case "underline":
        range.setFontLine("underline");
        break;
      default:
        Logger.log("setCellFormat: not a supported format " + format);
    }
  }
}

function setCellTooltip(sheet, row, col, tooltip) {
  if (tooltip) {
    sheet.getRange(row, col).setNote(tooltip);
  }
}

function setRangeAlignTop(sheet) {
  sheet.getDataRange().setVerticalAlignment("top");
}

function clearDataValidationsInSheet(sheet) {
  sheet.getDataRange().clearDataValidations();
}

function clearFormatInSheet(sheet) {
  sheet.getDataRange().clearFormat();
}

function clearNoteInSheet(sheet) {
  sheet.getDataRange().clearNote();
}

function clearContentInSheet(sheet) {
  sheet.getDataRange().clearContent();
}

function clearFontColorInSheet(sheet) {
  sheet.getDataRange().setFontColor(null);
}

function writeRangeToCells(sheet, startRow, startCol, vals) {
  if (vals.length === 0 || vals[0].length === 0) {
    return;
  }
  // vals: 2d array with dimensions (row, col)
  var rowLen = vals.length;
  var colLen = vals[0].length;
  sheet.getRange(startRow, startCol, rowLen, colLen).setValues(vals);
}

function updateHeaderWithArray(sheet, arr) {
  // returns re-ordered array:
  // props in current header + new props in arr
  var currentProps = getCellValuesInRow(sheet, HEADER_ROW);
  var newProps = arr.filter(prop => !currentProps.includes(prop));

  writeRangeToCells(sheet, HEADER_ROW, currentProps.length + 1, [newProps]);
  return currentProps.concat(newProps);
}

function writeJsonToRow(sheet, json, row, props) {
  // `props` is an optional input array to have an ordered list of props in `json`
  // the order of `props` is kept (so it's important) when new props are added to header

  var jsonProps = props ? props : Object.keys(json);
  var extendedHeaderProps = updateHeaderWithArray(sheet, jsonProps);

  var arr = extendedHeaderProps.map(prop => {
    if (json.hasOwnProperty(prop)) {
      var val = json[prop];
      if (["array", "object"].includes(getType(val))) {
        return JSON.stringify(val);
      } else if (val === null) {
        return "";
      }
      return val;
    }
    return "";
  });
  writeRangeToCells(sheet, row, 1, [arr]);
}

function addJsonToSheet(sheet, json, props) {
  var lastRow = Math.max(getLastRow(sheet), HEADER_ROW) + 1;
  writeJsonToRow(sheet, json, lastRow, props);
}

function getSelectedColumns(sheet) {
  // return a list of selected column's ID (col) and property {col, headerProp}
  // ignore columns without valid header
  var cols = [];
  var ranges = sheet.getSelection().getActiveRangeList().getRanges();
  for (var i = 0; i < ranges.length; i++) {
    for (var j = 0; j < ranges[i].getNumColumns(); j++) {
      var col = ranges[i].getColumn() + i;
      var headerProp = getCellValue(sheet, HEADER_ROW, col);
      if (headerProp) {
        cols.push({col, headerProp});
      }
    }
  }
  return cols;
}

function rowToJson(sheet, row, keepCommentedProps, bypassGoogleAutoParsing) {  
  // if bypassGoogleAutoParsing is set then use displayValue (string)
  // instead of auto-parsed value
  var currentProps = getCellValuesInRow(sheet, HEADER_ROW);
  var range = sheet.getRange(row, 1, 1, currentProps.length);
  var rowDataVals = range.getValues()[0];
  var rowDataDisplayVals = range.getDisplayValues()[0];
  var result = {};

  for (var [i, data] of rowDataVals.entries()) {
    var prop = currentProps[i];

    if (prop.startsWith("#") && !keepCommentedProps) {
      continue;
    }

    var val = data;
    if (val === "") {
      Logger.log("rowToJson (skipping prop with empty val): " + prop);
      continue;
    }

    if (bypassGoogleAutoParsing && getType(val) == "object") {
      val = rowDataDisplayVals[i];
      Logger.log("rowToJson (use displayValue for object): " + prop + " " + val);
    }

    if (getType(val) === "string") {
      // if array/object then JSON.parse it
      if (isJsonString(val) || isArrayString(val)) {
        val = JSON.parse(val);
      }
    }

    result[prop] = val;
  }
  return result;
}
