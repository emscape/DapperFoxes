/**
 * DapperFoxes weddingwebsite
 * Google Apps Script for Comments Backend
 * 
 * This script provides backend functionality for the comments feature:
 * 1. Accessing Google Form responses
 * 2. Approving/rejecting comments
 * 3. Serving approved comments via a web app endpoint
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
    LOCATION: 3,       // Column D - Which location would you prefer for our wedding
    COMMENT: 2,        // Column C - Make a suggestion
    NAME: 1           // Column B - Your name (ensure this matches the actual data)
  }
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
 * Get location poll statistics from form responses
 * @return {Object} Poll statistics data
 */
function getLocationStats() {
  try {
    // First, verify and update column configuration
    verifyColumnConfig();
    
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
    
    // Log the headers for debugging
    const headers = data[0];
    Logger.log("Headers: " + JSON.stringify(headers));
    Logger.log("Using LOCATION column index: " + CONFIG.COLUMNS.LOCATION);
    
    // Skip the header row and count votes for each location
    const locationCounts = {};
    let totalVotes = 0;
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Make sure we have enough columns
      if (row.length <= CONFIG.COLUMNS.LOCATION) {
        Logger.log(`Row ${i+1} doesn't have enough columns`);
        continue;
      }
      
      const location = row[CONFIG.COLUMNS.LOCATION];
      
      // Log each location for debugging
      Logger.log(`Row ${i+1} location: "${location}"`);
      
      // Skip empty locations
      if (!location) {
        continue;
      }
      
      // Count this vote
      locationCounts[location] = (locationCounts[location] || 0) + 1;
      totalVotes++;
    }
    
    // Log the location counts for debugging
    Logger.log("Location counts: " + JSON.stringify(locationCounts));
    
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
    
    // Create the result object
    const result = {
      locations: locations,
      totalVotes: totalVotes
    };
    
    Logger.log(`Found ${locations.length} locations with ${totalVotes} total votes`);
    Logger.log("Returning poll results: " + JSON.stringify(result));
    
    return result;
  } catch (e) {
    Logger.log("Error in getLocationStats: " + e.message);
    Logger.log("Stack trace: " + e.stack);
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
  
  // Log the request parameters for debugging
  Logger.log("Request parameters: " + JSON.stringify(e && e.parameter ? e.parameter : "No parameters"));
  Logger.log("Poll parameter: " + (e && e.parameter ? e.parameter.poll : "Not found"));
  Logger.log("Poll parameter type: " + (e && e.parameter ? typeof e.parameter.poll : "N/A"));

  let responseData = {};

  Logger.log("Before conditional checks: e = " + JSON.stringify(e));
  Logger.log("Before conditional checks: e.parameter = " + JSON.stringify(e ? e.parameter : null));

  // Check for poll results request
  if (e && e.parameter && (e.parameter.poll === 'true' || e.parameter.poll === true)) {
    Logger.log("Poll parameter detected, fetching location statistics");
    // Get location statistics
    const pollResults = getLocationStats();
    Logger.log("Returning poll results: " + JSON.stringify(pollResults));
    
    responseData = {
      success: true,
      locations: pollResults.locations,
      totalVotes: pollResults.totalVotes
    };
    Logger.log("Response data after poll: " + JSON.stringify(responseData));
  } else {
    // Regular request for approved comments
    const approvedComments = getApprovedComments();
    Logger.log("Returning " + approvedComments.length + " approved comments to client");
    
    responseData = {
      success: true,
      comments: approvedComments
    };
    Logger.log("Response data after comments: " + JSON.stringify(responseData));
  }
  
  Logger.log("Final responseData: " + JSON.stringify(responseData));
  return ContentService.createTextOutput(JSON.stringify(responseData))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Get all approved comments
 * @return {Array} Array of approved comment objects
 */
function getApprovedComments() {
  Logger.log("Fetching approved comments...");
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.APPROVED_COMMENTS_SHEET_NAME);
  
  // If the sheet doesn't exist or is empty, return an empty array
  if (!sheet || sheet.getLastRow() <= 1) {
    Logger.log("No approved comments found (sheet empty or missing)");
    return [];
  }
  
  // Get all data from the sheet
  const data = sheet.getDataRange().getValues();
  Logger.log(`Retrieved ${data.length} rows from the Approved Comments sheet`);
  
  // Skip the header row
  const approvedComments = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    Logger.log(`Row ${i}: ${JSON.stringify(row)}`); // Log each row for debugging
    approvedComments.push({
      timestamp: row[0], // Timestamp (Column A)
      name: row[1],      // Name (Column B)
      text: row[2]       // Comment (Column C)
    });
  }
  
  Logger.log(`Total approved comments: ${approvedComments.length}`);
  Logger.log("Approved comments fetched: " + JSON.stringify(approvedComments)); // Log the approved comments
  return approvedComments;
}
