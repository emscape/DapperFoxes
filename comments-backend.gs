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
  // IMPORTANT: Make sure you have edit access to this spreadsheet
  SPREADSHEET_ID: '1DFiI7rxIE5n-aJOkegiwbb0vf2m_6PIioMkzjmokBKI',
  
  // The name of the sheet containing form responses
  RESPONSES_SHEET_NAME: 'Form Responses 1',
  
  // The name of the sheet to store approved comments
  APPROVED_COMMENTS_SHEET_NAME: 'Approved Comments',
  
  // Column indices in the form responses sheet (0-based)
  // These will be verified and updated by the verifyColumnConfig function
  COLUMNS: {
    TIMESTAMP: 0,      // Column A - Timestamp
    LOCATION: 1,       // Column B - Which location would you prefer for our wedding
    COMMENT: 2,        // Column C - Make a suggestion
    NAME: 3,           // Column D - Your name
    APPROVED: 4,       // Column E - Approval status
    DISPLAYED: 5       // Column F - Whether comment has been displayed (for tracking)
  },
  
  // Admin credentials (basic security)
  // In a production environment, consider using more secure authentication
  ADMIN_USERNAME: 'admin',
  ADMIN_PASSWORD: 'wedding2025'
};

/**
 * Check if the script has permission to access the spreadsheet
 * @return {Object} Result of the permission check
 */
function checkPermissions() {
  try {
    Logger.log("Checking permissions for spreadsheet: " + CONFIG.SPREADSHEET_ID);
    
    // Try to open the spreadsheet
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    Logger.log("Successfully opened spreadsheet");
    
    // Try to get the responses sheet
    const responsesSheet = ss.getSheetByName(CONFIG.RESPONSES_SHEET_NAME);
    if (!responsesSheet) {
      Logger.log("WARNING: Could not find sheet: " + CONFIG.RESPONSES_SHEET_NAME);
      return {
        success: false,
        message: "Could not find sheet: " + CONFIG.RESPONSES_SHEET_NAME,
        permissionOk: true
      };
    }
    
    // Try to read data from the sheet
    const data = responsesSheet.getDataRange().getValues();
    Logger.log("Successfully read " + data.length + " rows from the sheet");
    
    return {
      success: true,
      message: "Permissions OK",
      rowCount: data.length
    };
  } catch (e) {
    Logger.log("Permission error: " + e.message);
    
    // Check if it's a permission error
    if (e.message.includes("PERMISSION_DENIED")) {
      return {
        success: false,
        message: "PERMISSION_DENIED: You don't have permission to access this spreadsheet. Make sure you have edit access to the spreadsheet with ID: " + CONFIG.SPREADSHEET_ID,
        error: e.message
      };
    }
    
    return {
      success: false,
      message: "Error checking permissions: " + e.message,
      error: e.message
    };
  }
}

/**
 * Verify and update column configuration based on actual spreadsheet headers
 * This function should be called before any other functions that access the spreadsheet
 */
function verifyColumnConfig() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.RESPONSES_SHEET_NAME);
    
    if (!sheet) {
      Logger.log("ERROR: Responses sheet not found: " + CONFIG.RESPONSES_SHEET_NAME);
      return false;
    }
    
    // Get the headers from the first row
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Log all headers for debugging
    Logger.log("ACTUAL SPREADSHEET HEADERS:");
    for (let i = 0; i < headers.length; i++) {
      Logger.log(`Column ${i} (${columnToLetter(i+1)}): "${headers[i]}"`);
    }
    
    // Expected header names (adjust these based on your actual form questions)
    const expectedHeaders = {
      TIMESTAMP: "Timestamp",
      LOCATION: "Which location would you prefer for our wedding?",
      COMMENT: "Make a suggestion:",
      NAME: "Your name:"
    };
    
    // Log expected vs. configured
    Logger.log("EXPECTED VS CONFIGURED:");
    for (const [key, expectedHeader] of Object.entries(expectedHeaders)) {
      Logger.log(`${key}: Expected="${expectedHeader}", Configured at index=${CONFIG.COLUMNS[key]}`);
    }
    
    // Try to find each expected header in the actual headers
    let updatedConfig = false;
    for (const [key, expectedHeader] of Object.entries(expectedHeaders)) {
      // Look for exact match first
      let foundIndex = headers.findIndex(h => h === expectedHeader);
      
      // If not found, try partial match
      if (foundIndex === -1) {
        foundIndex = headers.findIndex(h => h && h.includes(expectedHeader.split(' ')[0]));
      }
      
      if (foundIndex !== -1 && foundIndex !== CONFIG.COLUMNS[key]) {
        Logger.log(`Updating ${key} from ${CONFIG.COLUMNS[key]} to ${foundIndex}`);
        CONFIG.COLUMNS[key] = foundIndex;
        updatedConfig = true;
      }
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
    
    return updatedConfig;
  } catch (e) {
    Logger.log("Error in verifyColumnConfig: " + e.message);
    return false;
  }
}

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
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.RESPONSES_SHEET_NAME);
    
    if (!sheet) {
      Logger.log("Responses sheet not found: " + CONFIG.RESPONSES_SHEET_NAME);
      return [];
    }
    
    // Get all data from the sheet
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      Logger.log("No data found in responses sheet (or only headers)");
      return [];
    }
    
    // Log the headers for debugging
    const headers = data[0];
    Logger.log("Headers: " + JSON.stringify(headers));
    
    // Skip the header row and filter for pending comments
    const pendingComments = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Log each row for debugging
      Logger.log(`Row ${i+1}: ${JSON.stringify(row)}`);
      
      // Make sure we have enough columns
      if (row.length <= Math.max(
        CONFIG.COLUMNS.TIMESTAMP,
        CONFIG.COLUMNS.NAME,
        CONFIG.COLUMNS.LOCATION,
        CONFIG.COLUMNS.COMMENT,
        CONFIG.COLUMNS.APPROVED
      )) {
        Logger.log(`Row ${i+1} doesn't have enough columns`);
        continue;
      }
      
      // Check if the comment has not been approved or rejected yet
      if (row[CONFIG.COLUMNS.APPROVED] === '') {
        pendingComments.push({
          rowIndex: i + 1, // +1 because array is 0-based but sheet is 1-based
          timestamp: row[CONFIG.COLUMNS.TIMESTAMP],
          name: row[CONFIG.COLUMNS.NAME] || "Anonymous",
          location: row[CONFIG.COLUMNS.LOCATION] || "Not specified",
          comment: row[CONFIG.COLUMNS.COMMENT] || "No comment provided"
        });
      }
    }
    
    Logger.log(`Found ${pendingComments.length} pending comments`);
    return pendingComments;
  } catch (e) {
    Logger.log("Error in getPendingComments: " + e.message);
    return [];
  }
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
 * Get location poll statistics from form responses
 * @return {Object} Poll statistics data
 */
function getLocationStats() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.RESPONSES_SHEET_NAME);
    
    if (!sheet) {
      Logger.log("Responses sheet not found: " + CONFIG.RESPONSES_SHEET_NAME);
      return {
        error: true,
        message: "Responses sheet not found"
      };
    }
    
    // Get all data from the sheet
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      Logger.log("No data found in responses sheet (or only headers)");
      return {
        locations: [],
        totalVotes: 0
      };
    }
    
    // Skip the header row and count votes for each location
    const locationCounts = {};
    let totalVotes = 0;
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Make sure we have enough columns
      if (row.length <= CONFIG.COLUMNS.LOCATION) {
        continue;
      }
      
      const location = row[CONFIG.COLUMNS.LOCATION];
      
      // Skip empty locations
      if (!location) {
        continue;
      }
      
      // Count this vote
      locationCounts[location] = (locationCounts[location] || 0) + 1;
      totalVotes++;
    }
    
    // Convert to array format expected by the frontend
    const locations = Object.keys(locationCounts).map(name => {
      // Create a URL-friendly ID from the location name
      const id = name.toLowerCase()
                     .replace(/[^a-z0-9]+/g, '-')
                     .replace(/(^-|-$)/g, '');
      
      return {
        name: name,
        votes: locationCounts[name],
        id: id
      };
    });
    
    // Sort by votes (highest first)
    locations.sort((a, b) => b.votes - a.votes);
    
    Logger.log(`Found ${locations.length} locations with ${totalVotes} total votes`);
    
    return {
      locations: locations,
      totalVotes: totalVotes
    };
  } catch (e) {
    Logger.log("Error in getLocationStats: " + e.message);
    return {
      error: true,
      message: e.message
    };
  }
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
  
  // Check for poll results request
  if (e && e.parameter && e.parameter.poll === 'true') {
    // Get location statistics
    const pollResults = getLocationStats();
    Logger.log("Returning poll results");
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      pollResults: pollResults
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Check for admin access (ensure e and e.parameter exist)
  if (e && e.parameter && e.parameter.admin === 'true') {
    // Verify admin credentials
    if (e.parameter.username === CONFIG.ADMIN_USERNAME &&
        e.parameter.password === CONFIG.ADMIN_PASSWORD) {
      // Get pending comments
      const pendingComments = getPendingComments();
      Logger.log("Returning " + pendingComments.length + " pending comments to admin");
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        comments: pendingComments
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
  Logger.log("Returning " + approvedComments.length + " approved comments to client");
  
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
 * Get raw data from the spreadsheet for debugging
 * @return {Object} Raw data from the spreadsheet
 */
function getRawData() {
  try {
    Logger.log("getRawData function called");
    
    // Check permissions first
    const permissionCheck = checkPermissions();
    if (!permissionCheck.success) {
      return {
        error: true,
        message: permissionCheck.message
      };
    }
    
    // Get spreadsheet info
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const responsesSheet = ss.getSheetByName(CONFIG.RESPONSES_SHEET_NAME);
    
    if (!responsesSheet) {
      return {
        error: true,
        message: "Responses sheet not found: " + CONFIG.RESPONSES_SHEET_NAME
      };
    }
    
    // Get all data from the sheet
    const data = responsesSheet.getDataRange().getValues();
    Logger.log("Got " + data.length + " rows of data");
    
    // Get headers
    const headers = data.length > 0 ? data[0] : [];
    
    // Convert data to objects with column names
    const rows = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowObj = {
        rowIndex: i + 1
      };
      
      // Add each column with its header name
      for (let j = 0; j < headers.length; j++) {
        if (headers[j]) {
          rowObj[headers[j]] = row[j];
        } else {
          rowObj["Column" + j] = row[j];
        }
      }
      
      rows.push(rowObj);
    }
    
    return {
      success: true,
      headers: headers,
      rows: rows,
      columnConfig: CONFIG.COLUMNS,
      timestamp: new Date().toISOString()
    };
  } catch (e) {
    Logger.log("Error in getRawData: " + e.message);
    return {
      error: true,
      message: e.message,
      stack: e.stack
    };
  }
}

/**
 * Debug function to check what's happening in the admin interface
 * This function is called from the AdminInterface.html file
 * @return {Object} Debug information
 */
function debugAdminInterface() {
  try {
    Logger.log("debugAdminInterface function called");
    
    // First, check permissions
    const permissionCheck = checkPermissions();
    Logger.log("Permission check result: " + JSON.stringify(permissionCheck));
    
    // If permissions failed, return the error
    if (!permissionCheck.success) {
      return {
        error: true,
        message: permissionCheck.message,
        permissionError: true,
        timestamp: new Date().toISOString()
      };
    }
    
    // Verify and potentially update column configuration
    const configUpdated = verifyColumnConfig();
    Logger.log("Column configuration updated: " + configUpdated);
    
    // Get spreadsheet info
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    Logger.log("Spreadsheet opened: " + CONFIG.SPREADSHEET_ID);
    
    const responsesSheet = ss.getSheetByName(CONFIG.RESPONSES_SHEET_NAME);
    Logger.log("Responses sheet found: " + !!responsesSheet);
    
    const approvedSheet = ss.getSheetByName(CONFIG.APPROVED_COMMENTS_SHEET_NAME);
    Logger.log("Approved sheet found: " + !!approvedSheet);
    
    // Get pending comments
    Logger.log("Calling getPendingComments()");
    const pendingComments = getPendingComments();
    Logger.log("Found " + pendingComments.length + " pending comments");
    
    // Get sheet data
    const data = responsesSheet ? responsesSheet.getDataRange().getValues() : [];
    Logger.log("Got " + data.length + " rows of data");
    
    const headers = data.length > 0 ? data[0] : [];
    Logger.log("Headers: " + JSON.stringify(headers));
    
    // Sample some rows for debugging
    const sampleRows = [];
    if (data.length > 1) {
      for (let i = 1; i < Math.min(data.length, 5); i++) {
        const row = data[i];
        const sampleRow = {
          rowIndex: i + 1,
          timestamp: row[CONFIG.COLUMNS.TIMESTAMP],
          name: row[CONFIG.COLUMNS.NAME],
          location: row[CONFIG.COLUMNS.LOCATION],
          comment: row[CONFIG.COLUMNS.COMMENT],
          approved: row[CONFIG.COLUMNS.APPROVED]
        };
        sampleRows.push(sampleRow);
        Logger.log("Sample row " + i + ": " + JSON.stringify(sampleRow));
      }
    }
    
    // Prepare debug info
    const debugInfo = {
      spreadsheetId: CONFIG.SPREADSHEET_ID,
      responsesSheetExists: !!responsesSheet,
      approvedSheetExists: !!approvedSheet,
      pendingCommentsCount: pendingComments.length,
      pendingComments: pendingComments,
      columnConfig: CONFIG.COLUMNS,
      columnConfigUpdated: configUpdated,
      headers: headers,
      rowCount: data.length,
      sampleRows: sampleRows,
      config: CONFIG,
      timestamp: new Date().toISOString(),
      permissionCheck: permissionCheck
    };
    
    // Log debug info
    Logger.log("Debug info prepared, returning to client");
    
    return debugInfo;
  } catch (e) {
    Logger.log("Error in debugAdminInterface: " + e.message);
    Logger.log("Stack trace: " + e.stack);
    return {
      error: true,
      message: e.message,
      stack: e.stack,
      timestamp: new Date().toISOString()
    };
  }
}