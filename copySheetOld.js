function copySheet(source_id, source_sheet_title, dest_sheet_title) {
  var sourceSpreadsheet = SpreadsheetApp.openById(source_id);
  var sourceSheet = sourceSpreadsheet.getSheetByName(source_sheet_title);

  if (!sourceSheet) {
    throw new Error('Source sheet with the title "' + source_sheet_title + '" not found.');
  }

  var destSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var destSheet = destSpreadsheet.getSheetByName(dest_sheet_title);

  if (!destSheet) {
    throw new Error('Destination sheet with the title "' + dest_sheet_title + '" not found.');
  }

  // Clear destination sheet
  // destSheet.clear();

  // Resize destination sheet to match source sheet
  var sourceMaxRows = sourceSheet.getMaxRows();
  var sourceMaxColumns = sourceSheet.getMaxColumns();
  resizeSheet(destSheet, sourceMaxRows, sourceMaxColumns);

  // Copy column widths
  for (var col = 1; col <= sourceMaxColumns; col++) {
    destSheet.setColumnWidth(col, sourceSheet.getColumnWidth(col));
  }

  // Copy row heights
  for (var row = 1; row <= sourceMaxRows; row++) {
    var sourceRowHeight = sourceSheet.getRowHeight(row);
    if (sourceRowHeight == 21) {
      destSheet.setRowHeight(row, 21);
    }
    else {
      destSheet.setRowHeightsForced(row, 1, sourceRowHeight);
    }
  }

  // Get data range from the source sheet and apply to destination sheet
  var sourceDataRange = sourceSheet.getDataRange();
  var destDataRange = destSheet.getRange(sourceDataRange.getA1Notation());
  destDataRange.setValues(sourceDataRange.getValues());  // Copy only values
  
  destDataRange.setBackgrounds(sourceDataRange.getBackgrounds());
  destDataRange.setFontColors(sourceDataRange.getFontColors());
  destDataRange.setFontWeights(sourceDataRange.getFontWeights());
  destDataRange.setFontStyles(sourceDataRange.getFontStyles());
  destDataRange.setFontFamilies(sourceDataRange.getFontFamilies());
  destDataRange.setFontSizes(sourceDataRange.getFontSizes());
  destDataRange.setFontLines(sourceDataRange.getFontLines());
  destDataRange.setHorizontalAlignments(sourceDataRange.getHorizontalAlignments());
  destDataRange.setVerticalAlignments(sourceDataRange.getVerticalAlignments());
  destDataRange.setWraps(sourceDataRange.getWraps());

  // Copy and style hyperlinks
  copyAndStyleHyperlinks(sourceDataRange, destDataRange);
}

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

function copyAndStyleHyperlinks(sourceDataRange, destDataRange) {
  var sourceRichTextValues = sourceDataRange.getRichTextValues();
  var sourceValues = sourceDataRange.getValues();
  var destRichTextValues = destDataRange.getRichTextValues();

  for (var i = 0; i < sourceRichTextValues.length; i++) {
    for (var j = 0; j < sourceRichTextValues[i].length; j++) {
      var richText = sourceRichTextValues[i][j];
      var linkUrl = richText.getLinkUrl();

      if (linkUrl) {
        var text = richText.getText();
        var newRichText = SpreadsheetApp.newRichTextValue()
          .setText(text)
          .setLinkUrl(linkUrl)
          .setTextStyle(SpreadsheetApp.newTextStyle()
            .setForegroundColor('#0000FF')
            .setUnderline(true)
            .build())
          .build();
        destRichTextValues[i][j] = newRichText;
      } else {
        // Preserve the original value if it's not a hyperlink
        destRichTextValues[i][j] = SpreadsheetApp.newRichTextValue().setText(sourceValues[i][j].toString()).build();
      }
    }
  }

  destDataRange.setRichTextValues(destRichTextValues);
}

function styleHyperlinks(range) {
  var richTextValues = range.getRichTextValues();
  var richTextValuesStyled = [];

  for (var i = 0; i < richTextValues.length; i++) {
    var row = richTextValues[i];
    var newRow = [];

    for (var j = 0; j < row.length; j++) {
      var richText = row[j];
      var text = richText.getText();
      var linkUrl = richText.getLinkUrl();

      if (linkUrl) {
        var newRichText = SpreadsheetApp.newRichTextValue()
          .setText(text)
          .setLinkUrl(linkUrl)
          .setTextStyle(SpreadsheetApp.newTextStyle()
            .setForegroundColor('#0000FF')
            .setUnderline(true)
            .build())
          .build();
        newRow.push(newRichText);
      } else {
        newRow.push(richText);
      }
    }
    richTextValuesStyled.push(newRow);
  }

  range.setRichTextValues(richTextValuesStyled);
}
