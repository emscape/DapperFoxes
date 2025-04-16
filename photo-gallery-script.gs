// Google Apps Script for DapperFoxes Photo Gallery Automation

// --- Configuration ---
// !!! IMPORTANT: Replace these placeholders with your actual IDs and settings !!!
const SHEET_ID = '1OSytgxAXJ1Sc-Y1mUn8A3dpYTHhk61QDpC16zXJ0SPM'; // The ID of the Google Sheet linked to your Form
const SHEET_NAME = 'Form Responses 1'; // The exact name of the sheet tab containing responses
const DRIVE_FOLDER_ID = '1k2ZYVICHLqmhoQ47tNg124CnV1WZOTiKjUIkX_pZ5GKttggFRai1-0uxfYeD1g8cesbGSGO7'; // The ID of the Google Drive folder where Form uploads are saved
const APPROVED_COLUMN_HEADER = 'Approved?'; // The exact header text of your approval column
const APPROVAL_MARKER = 'YES'; // The text you type to mark a photo as approved (case-sensitive)

// --- Main Function (Web App Entry Point) ---
/**
 * Handles GET requests to the web app.
 * Returns a JSON list of approved photos.
 */
function doGet(e) {
  try {
    const approvedPhotos = getApprovedPhotos();
    
    // Return JSON response
    return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        photos: approvedPhotos 
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error in doGet: ' + error);
    return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        message: 'Error fetching photos: ' + error.message 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// --- Helper Functions ---

/**
 * Fetches data from the sheet, filters for approved photos, and gets shareable links.
 * @return {Array} An array of objects, each representing an approved photo.
 */
function getApprovedPhotos() {
  const ss = SpreadsheetApp.getActiveSpreadsheet(); // Use getActiveSpreadsheet() when bound to the sheet
  // If running standalone, use: SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    throw new Error(`Sheet "${SHEET_NAME}" not found.`);
  }

  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  const headers = values[0];
  const approvedPhotos = [];

  // Find column indices dynamically
  const timestampCol = headers.indexOf('Timestamp');
  const nameCol = headers.indexOf('Your Name'); // Match exact form question
  const dateCol = headers.indexOf('(Approximate) Date of Photo'); // Match exact form question - UPDATED
  const photoLinkCol = headers.indexOf('Upload Your Photo'); // Match exact form question
  const descriptionCol = headers.indexOf('  Tell us why this moment made the cut.  '); // Match exact form question - UPDATED with spaces
  const approvedCol = headers.indexOf(APPROVED_COLUMN_HEADER);

  if (approvedCol === -1) {
    throw new Error(`Approval column "${APPROVED_COLUMN_HEADER}" not found.`);
  }
  if (photoLinkCol === -1) {
    throw new Error(`Photo link column "Upload Your Photo" not found.`);
  }
   if (nameCol === -1) {
    Logger.log('Warning: "Your Name" column not found.');
  }
   if (dateCol === -1) {
    Logger.log('Warning: "Approximate Date of Photo" column not found.');
  }
   if (descriptionCol === -1) {
    Logger.log('Warning: "Tell Us About the Photo (Optional)" column not found.');
  }


  // Iterate through rows (skip header row)
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    
    // Check if the row is marked as approved
    if (row[approvedCol] && row[approvedCol].toString().toUpperCase() === APPROVAL_MARKER) {
      
      const photoDriveLink = row[photoLinkCol];
      let shareableUrl = null;
      let fileId = null;

      if (photoDriveLink) {
         // Extract file ID from the Google Drive link provided by the Form
         // Link format is usually: https://drive.google.com/open?id=FILE_ID or similar
         const match = photoDriveLink.match(/id=([^&]+)/); 
         if (match && match[1]) {
           fileId = match[1];
           try {
             // Get the file and make it publicly viewable via link
             const file = DriveApp.getFileById(fileId);
             
             // --- IMPORTANT PERMISSION STEP ---
             // Ensure the file is viewable by anyone with the link. 
             // This might require the script to have broader permissions or 
             // for the containing folder's permissions to be set correctly beforehand.
             // Setting permissions programmatically can be complex due to security.
             // It's often easier to set the *folder's* sharing settings manually.
             file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); 
             
             // Construct the direct image URL using the thumbnail endpoint (works for public files).
             // Append &sz=s0 to request a larger image size (often original).
             shareableUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=s0`;
             // No need to check for null here, as we construct it directly if fileId exists.
             // The file.setSharing() call earlier should ensure it's accessible.
           } // End of try block
           catch (fileError) { // Removed extra '}' before catch
             Logger.log(`Error accessing file ID ${fileId} for row ${i + 1}: ${fileError}`);
             // Decide how to handle: skip this photo, use a placeholder, etc.
             shareableUrl = null; // Indicate failure
           }
         } else {
            Logger.log(`Could not extract file ID from link in row ${i + 1}: ${photoDriveLink}`);
         }
      } else {
         Logger.log(`Missing photo link in approved row ${i + 1}.`);
      }

      // Only add if we successfully got a shareable URL
      if (shareableUrl) {
        approvedPhotos.push({
          // timestamp: row[timestampCol] ? new Date(row[timestampCol]).toISOString() : null, // Optional
          submitterName: nameCol !== -1 ? row[nameCol] : 'Unknown',
          photoDate: dateCol !== -1 ? row[dateCol] : 'Unknown Date', // Handle potential Date object or string
          description: descriptionCol !== -1 ? row[descriptionCol] : '',
          imageUrl: shareableUrl,
          // fileId: fileId // Optional: include for debugging
        });
      }
    }
  }

  Logger.log(`Found ${approvedPhotos.length} approved photos.`);
  return approvedPhotos;
}

// --- Optional: Function to set up a time-driven trigger ---
/**
 * Creates a time-driven trigger to run the sync function automatically.
 * Run this function manually once from the script editor to set up the trigger.
 */
function createTimeDrivenTrigger() {
  // Check if trigger already exists to avoid duplicates
  const existingTriggers = ScriptApp.getProjectTriggers();
  let triggerExists = false;
  existingTriggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'doGet') { // Or a dedicated sync function if you create one
      triggerExists = true;
    }
  });

  if (!triggerExists) {
    // Trigger every hour
    ScriptApp.newTrigger('doGet') // Or the name of your main sync function if different
        .timeBased()
        .everyHours(1) 
        .create();
    Logger.log('Time-driven trigger created successfully.');
  } else {
    Logger.log('Time-driven trigger already exists.');
  }
}