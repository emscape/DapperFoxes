/**
 * DapperFoxes Wedding Website
 * Google Apps Script for Comments Backend
 * 
 * This script provides backend functionality for the comments feature:
 * 1. Accessing Google Form responses
 * 2. Approving/rejecting comments
 * 3. Serving approved comments via a web app endpoint
 * 4. Simple admin interface for comment moderation
 */

// Configuration
const CONFIG = {
  // The ID of the Google Sheet containing form responses
  SPREADSHEET_ID: '1DFiI7rxIE5n-aJOkegiwbb0vf2m_6PIioMkzjmokBKI',
  
  // The name of the sheet containing form responses
  RESPONSES_SHEET_NAME: 'Form Responses 1',
  
  // The name of the sheet to store approved comments
  APPROVED_COMMENTS_SHEET_NAME: 'Approved Comments',
  
  // Column indices in the form responses sheet (0-based)
  COLUMNS: {
    TIMESTAMP: 0,      // Column A - Timestamp
    LOCATION: 1,       // Column B - Which location would you prefer for our wedding
    COMMENT: 2,        // Column C - This field fine-tunes the wedding model.
    NAME: 3,           // Column D - Commenter Name
    APPROVED: 4,       // Column E - Approval status
    DISPLAYED: 5       // Column F - Whether comment has been displayed (for tracking)
  },
  
  // Admin credentials (basic security)
  // In a production environment, consider using more secure authentication
  ADMIN_USERNAME: 'admin',
  ADMIN_PASSWORD: 'wedding2025'
};

/**
 * Initialize the script - runs automatically when the spreadsheet is opened
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  // Add a custom menu to the spreadsheet
  ui.createMenu('Comments Admin')
    .addItem('Setup Approval System', 'setupApprovalSystem')
    .addItem('Open Admin Interface', 'openAdminInterface')
    .addToUi();
}

/**
 * Set up the approval system by creating necessary sheets and columns
 */
function setupApprovalSystem() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  
  // Check if responses sheet exists
  let responsesSheet;
  try {
    responsesSheet = ss.getSheetByName(CONFIG.RESPONSES_SHEET_NAME);
    if (!responsesSheet) {
      throw new Error('Form responses sheet not found');
    }
  } catch (e) {
    SpreadsheetApp.getUi().alert('Error: ' + e.message);
    return;
  }
  
  // Add approval column if it doesn't exist
  const lastColumn = responsesSheet.getLastColumn();
  let headers = responsesSheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  
  if (headers.length <= CONFIG.COLUMNS.APPROVED || headers[CONFIG.COLUMNS.APPROVED] !== 'Approved') {
    responsesSheet.getRange(1, CONFIG.COLUMNS.APPROVED + 1).setValue('Approved');
  }
  
  if (headers.length <= CONFIG.COLUMNS.DISPLAYED || headers[CONFIG.COLUMNS.DISPLAYED] !== 'Displayed') {
    responsesSheet.getRange(1, CONFIG.COLUMNS.DISPLAYED + 1).setValue('Displayed');
  }
  
  // Create approved comments sheet if it doesn't exist
  let approvedSheet = ss.getSheetByName(CONFIG.APPROVED_COMMENTS_SHEET_NAME);
  if (!approvedSheet) {
    approvedSheet = ss.insertSheet(CONFIG.APPROVED_COMMENTS_SHEET_NAME);
    
    // Add headers to approved comments sheet
    approvedSheet.getRange('A1:D1').setValues([['Timestamp', 'Name', 'Comment', 'Original Row']]);
    approvedSheet.setFrozenRows(1);
  }
  
  SpreadsheetApp.getUi().alert('Approval system has been set up successfully!');
}

/**
 * Open the admin interface for comment moderation
 */
function openAdminInterface() {
  const html = HtmlService.createHtmlOutputFromFile('AdminInterface')
    .setWidth(800)
    .setHeight(600)
    .setTitle('Comments Admin Interface');
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Comments Admin Interface');
}

/**
 * Get all form responses that haven't been processed yet
 * @return {Array} Array of response objects
 */
function getPendingComments() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.RESPONSES_SHEET_NAME);
  
  // Get all data from the sheet
  const data = sheet.getDataRange().getValues();
  
  // Skip the header row and filter for pending comments
  const pendingComments = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    // Check if the comment has not been approved or rejected yet
    if (row[CONFIG.COLUMNS.APPROVED] === '') {
      pendingComments.push({
        rowIndex: i + 1, // +1 because array is 0-based but sheet is 1-based
        timestamp: row[CONFIG.COLUMNS.TIMESTAMP],
        name: row[CONFIG.COLUMNS.NAME],
        location: row[CONFIG.COLUMNS.LOCATION],
        comment: row[CONFIG.COLUMNS.COMMENT]
      });
    }
  }
  
  return pendingComments;
}

/**
 * Approve a comment
 * @param {number} rowIndex - The row index in the responses sheet
 * @return {Object} Result of the operation
 */
function approveComment(rowIndex) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const responsesSheet = ss.getSheetByName(CONFIG.RESPONSES_SHEET_NAME);
    const approvedSheet = ss.getSheetByName(CONFIG.APPROVED_COMMENTS_SHEET_NAME);
    
    // Mark as approved in the responses sheet
    responsesSheet.getRange(rowIndex, CONFIG.COLUMNS.APPROVED + 1).setValue('YES');
    
    // Get the comment data
    const rowData = responsesSheet.getRange(rowIndex, 1, 1, responsesSheet.getLastColumn()).getValues()[0];
    
    // Add to approved comments sheet
    const nextRow = approvedSheet.getLastRow() + 1;
    approvedSheet.getRange(nextRow, 1, 1, 4).setValues([[
      rowData[CONFIG.COLUMNS.TIMESTAMP],
      rowData[CONFIG.COLUMNS.NAME],
      rowData[CONFIG.COLUMNS.COMMENT],
      rowIndex
    ]]);
    
    return { success: true, message: 'Comment approved successfully' };
  } catch (e) {
    return { success: false, message: 'Error: ' + e.message };
  }
}

/**
 * Reject a comment
 * @param {number} rowIndex - The row index in the responses sheet
 * @return {Object} Result of the operation
 */
function rejectComment(rowIndex) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.RESPONSES_SHEET_NAME);
    
    // Mark as rejected in the responses sheet
    sheet.getRange(rowIndex, CONFIG.COLUMNS.APPROVED + 1).setValue('NO');
    
    return { success: true, message: 'Comment rejected successfully' };
  } catch (e) {
    return { success: false, message: 'Error: ' + e.message };
  }
}

/**
 * Get all approved comments
 * @return {Array} Array of approved comment objects
 */
function getApprovedComments() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.APPROVED_COMMENTS_SHEET_NAME);
  
  // If the sheet doesn't exist or is empty, return an empty array
  if (!sheet || sheet.getLastRow() <= 1) {
    return [];
  }
  
  // Get all data from the sheet
  const data = sheet.getDataRange().getValues();
  
  // Skip the header row
  const approvedComments = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    approvedComments.push({
      timestamp: row[0], // Timestamp (Column A)
      name: row[1],      // Name (Column B)
      text: row[2]       // Comment (Column C)
    });
  }
  
  return approvedComments;
}

/**
 * Web app endpoint to serve approved comments
 * This function is called when the web app is accessed
 * @return {Object} JSON response with approved comments
 */
function doGet(e) {
  // Basic CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };
  
  // Check for admin access (ensure e and e.parameter exist)
  if (e && e.parameter && e.parameter.admin === 'true') {
    // Verify admin credentials
    if (e.parameter.username === CONFIG.ADMIN_USERNAME &&
        e.parameter.password === CONFIG.ADMIN_PASSWORD) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        comments: getPendingComments()
      })).setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Invalid credentials'
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // Regular request for approved comments
  const approvedComments = getApprovedComments();
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    comments: approvedComments
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle POST requests for admin actions
 * @return {Object} JSON response with result
 */
function doPost(e) {
  // Parse the request data
  const data = JSON.parse(e.postData.contents);
  
  // Verify admin credentials
  if (data.username !== CONFIG.ADMIN_USERNAME ||
      data.password !== CONFIG.ADMIN_PASSWORD) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Invalid credentials'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  let result;
  
  // Handle different actions
  switch (data.action) {
    case 'approve':
      result = approveComment(data.rowIndex);
      break;
    case 'reject':
      result = rejectComment(data.rowIndex);
      break;
    default:
      result = { success: false, message: 'Invalid action' };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Debug function to log column headers from the form responses sheet
 */
function logColumnHeaders() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.RESPONSES_SHEET_NAME);
  
  // Get the headers from the first row
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Log each header with its index
  for (let i = 0; i < headers.length; i++) {
    Logger.log(`Column ${i} (${columnToLetter(i+1)}): "${headers[i]}"`);
  }
  
  // Helper function to convert column number to letter (e.g., 1 -> A, 2 -> B)
  function columnToLetter(column) {
    let temp, letter = '';
    while (column > 0) {
      temp = (column - 1) % 26;
      letter = String.fromCharCode(temp + 65) + letter;
      column = (column - temp - 1) / 26;
    }
    return letter;
  }
}

/**
 * Debug function to log column headers from the approved comments sheet
 */
function logApprovedCommentsHeaders() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.APPROVED_COMMENTS_SHEET_NAME);
  
  if (!sheet) {
    Logger.log("Approved Comments sheet not found!");
    return;
  }
  
  // Get the headers from the first row
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Log each header with its index
  for (let i = 0; i < headers.length; i++) {
    Logger.log(`Column ${i} (${columnToLetter(i+1)}): "${headers[i]}"`);
  }
  
  // Helper function to convert column number to letter
  function columnToLetter(column) {
    let temp, letter = '';
    while (column > 0) {
      temp = (column - 1) % 26;
      letter = String.fromCharCode(temp + 65) + letter;
      column = (column - temp - 1) / 26;
    }
    return letter;
  }
}

/**
 * Debug function to test the approval process
 */
function debugApprovalProcess() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const responsesSheet = ss.getSheetByName(CONFIG.RESPONSES_SHEET_NAME);
  const approvedSheet = ss.getSheetByName(CONFIG.APPROVED_COMMENTS_SHEET_NAME);
  
  // Log information about the sheets
  Logger.log(`Responses sheet: ${responsesSheet ? 'Found' : 'Not found'}`);
  Logger.log(`Approved Comments sheet: ${approvedSheet ? 'Found' : 'Not found'}`);
  
  // Get pending comments
  const pendingComments = getPendingComments();
  Logger.log(`Pending comments: ${pendingComments.length}`);
  
  // Log the first pending comment if available
  if (pendingComments.length > 0) {
    Logger.log(`First pending comment: ${JSON.stringify(pendingComments[0])}`);
    
    // Try to approve the first comment
    const result = approveComment(pendingComments[0].rowIndex);
    Logger.log(`Approval result: ${JSON.stringify(result)}`);
    
    // Check if the comment was added to the Approved Comments sheet
    const approvedData = approvedSheet.getDataRange().getValues();
    Logger.log(`Approved Comments rows: ${approvedData.length}`);
    
    // Log the last row if available
    if (approvedData.length > 1) {
      Logger.log(`Last approved comment: ${JSON.stringify(approvedData[approvedData.length - 1])}`);
    }
  }
}

/**
 * Debug function to test getting approved comments
 */
function debugGetApprovedComments() {
  const approvedComments = getApprovedComments();
  Logger.log(`Number of approved comments: ${approvedComments.length}`);
  
  if (approvedComments.length > 0) {
    Logger.log(`First approved comment: ${JSON.stringify(approvedComments[0])}`);
  }
  
  // Test the web app endpoint
  const webAppOutput = doGet({});
  Logger.log(`Web app output: ${webAppOutput.getContent()}`);
}

/**
 * Debug function to check what's happening in the admin interface
 */
function debugAdminInterface() {
  // Get pending comments
  const pendingComments = getPendingComments();
  Logger.log(`Number of pending comments: ${pendingComments.length}`);
  
  // Check if any comments have the Approved column empty
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.RESPONSES_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  // Log each row's approval status
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    Logger.log(`Row ${i+1}: Name=${row[CONFIG.COLUMNS.NAME]}, Approved="${row[CONFIG.COLUMNS.APPROVED]}"`);
  }
}