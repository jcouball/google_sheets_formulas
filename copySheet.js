/**
 * Copies all external sheets based on the data in the "external_sheets" sheet
 * of the active spreadsheet.
 * 
 * The "external_sheets" sheet should have the following columns:
 * 
 * | Source Spreadsheet ID | Source Sheet Title | Destination Sheet Title | Auto Update | Update With All |
 * |-----------------------|--------------------|-------------------------|-------------|-----------------|
 * |                       |                    |                         |             |                 |
 * |                       |                    |                         |             |                 |
 * |                       |                    |                         |             |                 |
 * 
 * The "Source Spreadsheet ID" column should contain the ID of the source spreadsheet.
 * The "Source Sheet Title" column should contain the title of the source sheet.
 * The "Destination Sheet Title" column should contain the title of the destination sheet.
 * The "Auto Update" column should contain "Yes" or "No" to indicate whether the destination sheet should be updated automatically.
 * The "Update With All" column should contain "Yes" or "No" to indicate whether the destination sheet should be updated with all data from the source sheet.
 * 
 */
function copyAllExternalSheets() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('external_sheets');
  if (!sheet) {
    Logger.log('Sheet "external_sheets" not found.');
    return;
  }

  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();

  // Iterate over rows, starting from the second row (index 1)
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var sourceSpreadsheetId = row[0];
    var sourceSheetTitle = row[1];
    var destinationSheetTitle = row[2];
    var autoUpdate = row[3];
    var updateWithAll = row[4];

    if (sourceSpreadsheetId && sourceSheetTitle && destinationSheetTitle && updateWithAll === 'Yes') {
      Logger.log('Updating ' + destinationSheetTitle + "...");
      copyExternalSheet(sourceSpreadsheetId, sourceSheetTitle, destinationSheetTitle);
      Logger.log("Done.");
    } else {
      title = destinationSheetTitle ? "'" + destinationSheetTitle + "'" : "row " + (i + 1);
      Logger.log("Skipping " + title);
    }
  }
}

function copyExternalSheet(sourceSpreadsheetId, sourceSheetTitle, destinationSheetTitle) {
  var startTime = Date.now();

  var sourceSpreadsheet = SpreadsheetApp.openById(sourceSpreadsheetId);
  var sourceSheet = sourceSpreadsheet.getSheetByName(sourceSheetTitle);

  if (!sourceSheet) {
    throw new Error('Source sheet with the title "' + sourceSheetTitle + '" not found.');
  }

  var destinationSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var destinationSheet = destinationSpreadsheet.getSheetByName(destinationSheetTitle);

  if (!destinationSheet) {
    destinationSheet = destinationSpreadsheet.insertSheet(destinationSheetTitle);
    if (!destinationSheet) {
      throw new Error(`Failed to create destination sheet "${destinationSheetTitle}".`);
    }
  }

  // destinationSheet.clear(); // Uncomment if you want to clear the sheet before copying

  resizeSheet(destinationSheet, sourceSheet.getMaxRows(), sourceSheet.getMaxColumns());
  copyRowAndColumnSizes(sourceSheet, destinationSheet);
  copyMergedCells(sourceSheet, destinationSheet);
  copyNamedRanges(sourceSpreadsheet, sourceSheetTitle, destinationSpreadsheet, destinationSheetTitle);
  copyValuesAndFormatting(sourceSheet, destinationSheet);

  var endTime = Date.now(); // End time
  var elapsedTime = endTime - startTime; // Calculate elapsed time in milliseconds
  Logger.log("copyExternalSheet took " + elapsedTime + " ms");
}

// Resize the given sheet to the given number of rows and columns.
// Remember that the Sheet class does not have a resize function.
function resizeSheet(sheet, rows, columns) {
  var currentRows = sheet.getMaxRows();
  var currentColumns = sheet.getMaxColumns();

  // Adjust rows
  if (rows > currentRows) {
    sheet.insertRowsAfter(currentRows, rows - currentRows);
  }
  else if (rows < currentRows) {
    sheet.deleteRows(rows + 1, currentRows - rows);
  }

  // Adjust columns
  if (columns > currentColumns) {
    sheet.insertColumnsAfter(currentColumns, columns - currentColumns);
  }
  else if (columns < currentColumns) {
    sheet.deleteColumns(columns + 1, currentColumns - columns);
  }
}

function copyRowAndColumnSizes(sourceSheet, destinationSheet) {
  var sourceMaxColumns = sourceSheet.getMaxColumns();
  for (var col = 1; col <= sourceMaxColumns; col++) {
    destinationSheet.setColumnWidth(col, sourceSheet.getColumnWidth(col));
  }

  var sourceMaxRows = sourceSheet.getMaxRows();
  for (var row = 1; row <= sourceMaxRows; row++) {
    var sourceRowHeight = sourceSheet.getRowHeight(row);
    if (sourceRowHeight == 21) {
      destinationSheet.setRowHeight(row, 21);
    } else {
      destinationSheet.setRowHeightsForced(row, 1, sourceRowHeight);
    }
  }
}

function copyValuesAndFormatting(sourceSheet, destinationSheet) {
  var rowCount = sourceSheet.getMaxRows();
  var columnCount = sourceSheet.getMaxColumns();

  // Logger.log("Row count: " + rowCount + ", Column count: " + columnCount);

  var sourceRange = sourceSheet.getRange(1, 1, rowCount, columnCount);
  var destinationRange = destinationSheet.getRange(1, 1, rowCount, columnCount);

  // Logger.log("sourceRange.numRows: " + sourceRange.getNumRows());
  // Logger.log("sourceRange.numColumns: " + sourceRange.getNumColumns());

  var sourceValues = sourceRange.getValues();
  var sourceNumberFormats = sourceRange.getNumberFormats();

  destinationRange.setValues(sourceValues);
  destinationRange.setFontColors(sourceRange.getFontColors());
  destinationRange.setFontWeights(sourceRange.getFontWeights());
  destinationRange.setFontStyles(sourceRange.getFontStyles());
  destinationRange.setFontFamilies(sourceRange.getFontFamilies());
  destinationRange.setFontSizes(sourceRange.getFontSizes());
  destinationRange.setFontLines(sourceRange.getFontLines());
  destinationRange.setNumberFormats(sourceNumberFormats);

  destinationRange.setBackgroundObjects(sourceRange.getBackgroundObjects());

  // Can not get or set borders in Google Apps Script
  // See: https://stackoverflow.com/questions/75275936/what-is-an-alternative-function-for-getborderlines-in-google-app-scripts
  // See: https://issuetracker.google.com/issues/329473815
  // destinationRange.setBorders(sourceRange.getBorders());

  destinationRange.setHorizontalAlignments(sourceRange.getHorizontalAlignments());
  destinationRange.setTextDirections(sourceRange.getTextDirections());
  destinationRange.setTextRotations(sourceRange.getTextRotations());
  destinationRange.setVerticalAlignments(sourceRange.getVerticalAlignments());
  destinationRange.setWrapStrategies(sourceRange.getWrapStrategies());

  var rowCount = sourceSheet.getMaxRows();
  var columnCount = sourceSheet.getMaxColumns();

  for (let row = 1; row <= rowCount; row++) {
    for (let column = 1; column <= columnCount; column++) {
      // Logger.log("Row: " + row + ", Column: " + column);

      var value = sourceValues[row - 1][column - 1];
      var numberFormat = sourceNumberFormats[row - 1][column - 1];

      fixMissingNumberFormat(row, column, value, numberFormat, destinationRange);

      // For 'Text' type values, copy the Rich Text value to get complete formatting
      setRichTextValue(row, column, value, sourceRange, destinationRange);
    }
  }
}


/**
 * Sets the rich text value of a cell in the destination range based on the
 * value of the corresponding cell in the source range.
 *
 * Only cells containing text values with rich text values containing more
 * than one run or a single run that is a link URL will be copied.
 *
 * @param {number} row - The row index of the cell
 * @param {number} column - The column index of the cell
 * @param {string} value - The value of the cell in the source range
 * @param {Range} sourceRange - The source range containing the cell
 * @param {Range} destinationRange - The destination range where the rich text value will be set
 */
function setRichTextValue(row, column, value, sourceRange, destinationRange) {
  if (variableType(value) === "String" && value !== '') {
    var richTextValue = sourceRange.getCell(row, column).getRichTextValue();
    var runs = richTextValue.getRuns();
    if (richTextValue && (runs.length > 1 || runs[0].getLinkUrl())) {
      // Logger.log(
      //   "Row: " + row +
      //   ", Column: " + column +
      //   ", Value: '" + value +
      //   "', Rich Text Value: '" + richTextValue.getText() +
      //   "', runs: " + runs.length +
      //   ", linkUrl: '" + runs[0].getLinkUrl() + "'"
      // );
      destinationRange.getCell(row, column).setRichTextValue(richTextValue);
    }
  }
}

/**
 * Fixes the missing number format for a numeric cell in the destination sheet
 *
 * If the cell is a number and the number format is an empty string, set the
 * number format to the default number format.
 *
 * Normally, a cell containing a number that does not have an explicit
 * number format set by the user will have the default number format
 * "0.###############".
 *
 * However, if the cell contains a number as a result of an ARRAYFORMULA,
 * MAP or similar function AND the number format was not explicitly set
 * for that cell by the user, the number format will be an empty string.
 *
 * Setting the number format to an empty string in the destination sheet
 * will cause the cell contents to be invisible. The value is there, but
 * is not displayed no matter what the cell's text and background color
 * are set to.
 *
 * @param {number} row - The row index of the cell.
 * @param {number} column - The column index of the cell.
 * @param {number} value - The value of the cell.
 * @param {string} numberFormat - The number format of the cell.
 * @param {Range} destinationRange - The destination range where the cell is located.
 * @returns {void}
 */
function fixMissingNumberFormat(row, column, value, numberFormat, destinationRange) {
  if (variableType(value) === "Number" && numberFormat === "") {
    numberFormat = "0.###############";
    destinationRange.getCell(row, column).setNumberFormat(numberFormat);
  }
}

/**
 * Copies merged cell definitions from the source sheet to the destination sheet
 *
 * @param {Sheet} sourceSheet - The source sheet containing the merged cells.
 * @param {Sheet} destinationSheet - The destination sheet where the merged cells will be copied to.
 */
function copyMergedCells(sourceSheet, destinationSheet) {
  numRows = sourceSheet.getMaxRows();
  numColumns = sourceSheet.getMaxColumns();
  sourceRange = sourceSheet.getRange(1, 1, numRows, numColumns);
  var mergedRanges = sourceRange.getMergedRanges();
  mergedRanges.forEach(function(range) {
    destinationSheet.getRange(range.getA1Notation()).merge();
  });
}

/**
 * Copies named ranges from a source spreadsheet that reference the source sheet
 * to the destination spreadsheet.
 *
 * Does nothing if the source and destination spreadsheets are the same.
 *
 * @param {Spreadsheet} sourceSpreadsheet - The source spreadsheet containing the named ranges.
 * @param {string} sourceSheetTitle - The title of the source sheet containing the named ranges.
 * @param {Spreadsheet} destinationSpreadsheet - The destination spreadsheet where the named ranges will be copied to.
 * @param {string} destinationSheetTitle - The title of the destination sheet where the named ranges will be copied to.
 */
function copyNamedRanges(sourceSpreadsheet, sourceSheetTitle, destinationSpreadsheet, destinationSheetTitle) {
  if (sourceSpreadsheet.getId() === destinationSpreadsheet.getId()) {
    Logger.log("Not copying named ranges to '" + destinationSpreadsheet.getName() + "' because source and destination are the same.");
    return;
  }

  var namedRanges = sourceSpreadsheet.getNamedRanges();

  namedRanges.forEach(function(namedRange) {
    var range = namedRange.getRange();
    if (range.getSheet().getSheetId() == sourceSpreadsheet.getSheetByName(sourceSheetTitle).getSheetId()) {
      var rangeName = namedRange.getName();
      var rangeA1Notation = range.getA1Notation();
      var destinationSheet = destinationSpreadsheet.getSheetByName(destinationSheetTitle);
      var destinationRangeA1Notation = destinationSheet.getRange(rangeA1Notation).getA1Notation();
      destinationSpreadsheet.setNamedRange(rangeName, destinationSheet.getRange(destinationRangeA1Notation));
    }
  });
}

/**
 * Returns the type of a variable
 *
 * @param {*} variable - The variable to determine the type of.
 * @returns {string} The type of the variable.
 */
function variableType(variable) {
  return Object.prototype.toString.call(variable).slice(8, -1);
}
