function showRedirectNotification() {
  // Update this ID to the new spreadsheet
  var newSpreadsheetId = '1CIgSDfo3n9DJXP7rKMc-4R9xfDc6s4dS22zmGYp8Epg';

  var newSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/' + newSpreadsheetId;
  var ui = SpreadsheetApp.getUi();

  var htmlOutput = HtmlService.createHtmlOutput(
    `
      <p>This BIA assessment is outdated.</p>
      <p>Use <a href="${newSpreadsheetUrl}" target="_blank">the new version</a> instead.</p>
    `
  ).setWidth(300).setHeight(75);
  ui.showModalDialog(htmlOutput, 'Outdated BIA Template');
}
