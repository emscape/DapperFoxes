# Photo Upload Feature Plan (Automated)

This document outlines the plan for implementing the guest photo upload feature with an automated gallery update process using Google Forms and Google Apps Script.

## 1. Google Form Setup

*   **Action:** Create a new Google Form.
*   **Fields:**
    *   Your Name (Short Answer, Required)
    *   Approximate Date of Photo (Date or Short Answer, Required)
    *   Upload Your Photo (File Upload, Required)
        *   Configure to accept Image files only.
        *   Set appropriate file size limits if desired (within Google's limits).
    *   Tell Us About the Photo (Paragraph, Optional)
*   **Configuration:**
    *   Link the Form to a new Google Sheet to collect responses.
    *   Configure the Form's file upload setting to save photos automatically to a specific Google Drive folder. **Note:** Remember the name/location of this folder.
    *   Manually add an "Approved?" column to the linked Google Sheet after creation.

## 2. Approval Workflow

1.  **Guest Submission:** Guests access the `photos.html` page and use the embedded Google Form to submit their name, photo date, photo file, and optional description.
2.  **System Action:** The Form automatically saves the text data to the linked Google Sheet and the photo file to the designated Google Drive folder.
3.  **Manual Review (Emily):** Periodically review new submissions by checking the Google Sheet and the Google Drive folder.
4.  **Manual Approval (Emily):** For photos to be included in the gallery, type "YES" (or another consistent marker) into the "Approved?" column for the corresponding row in the Google Sheet.

## 3. Google Apps Script (Automation)

*   **Action:** Create a new Google Apps Script project attached to the Google Sheet containing the form responses.
*   **Script Functionality:**
    *   **Trigger:** Set up a time-driven trigger (e.g., runs every hour) or potentially an `onFormSubmit` trigger (though time-driven might be more robust for processing).
    *   **Read Sheet:** The script reads all rows from the response sheet.
    *   **Filter Approved:** It identifies rows where the "Approved?" column is marked "YES".
    *   **Get Drive Links:** For each approved row, the script needs to find the corresponding photo file in the Google Drive folder. **Crucially, it must then generate a shareable link for that file.** The permissions on the Drive folder *must* be set so that "Anyone with the link can view".
    *   **Compile JSON:** The script creates a JSON array containing objects for each approved photo. Each object should include:
        *   `imageUrl`: The shareable Google Drive link.
        *   `submitterName`: The name provided by the guest.
        *   `photoDate`: The approximate date provided.
        *   `description`: The optional description.
    *   **Publish Web App:** The script publishes the JSON data as a web app. The web app's `doGet()` function will return the JSON data. Note the unique URL of the deployed web app.

## 4. Website Integration (`js/main.js`)

*   **Action:** Modify the `initPhotoGallery` function in `js/main.js`.
*   **Functionality:**
    *   Remove the hardcoded `imageFiles` array.
    *   Use the `fetch` API to retrieve the JSON data from the deployed Google Apps Script web app URL.
    *   Handle potential errors during fetching (e.g., network issues, script errors).
    *   If the fetch is successful, parse the JSON data.
    *   Dynamically create the HTML elements for each photo in the `gallery-grid` div using the data from the JSON (image URL for `src`, other fields for potential captions or alt text).
    *   Ensure the lightbox functionality works with the dynamically loaded images.

## 5. Result

Once implemented, the workflow will be:
1.  Guest uploads photo.
2.  Emily marks "YES" in the Sheet.
3.  Apps Script runs, finds the "YES", gets the link, updates the JSON data at its URL.
4.  The next time a user visits `photos.html`, the JavaScript fetches the updated JSON and displays the newly approved photo in the gallery automatically.

## Workflow Diagram (Mermaid)

```mermaid
graph TD
    A[Guest Submits Photo via Google Form] --> B{Google Form};
    B --> C[Google Sheet Populated];
    B --> D[Photo Saved to Google Drive];
    C --> E{Emily Reviews Sheet};
    D --> E;
    E -- Marks 'YES' --> F[Approved? Column Updated in Sheet];
    F --> G{Google Apps Script (Scheduled)};
    G -- Reads Sheet --> G;
    G -- Gets Shareable Links from Drive --> G;
    G --> H[Publishes Approved Photo List (JSON) to URL];
    H --> I{Website JavaScript (js/main.js)};
    I -- Fetches JSON --> I;
    I --> J[Dynamically Builds Gallery];
    J --> K[Website Gallery Updated Automatically];

    subgraph Manual Steps
        E
    end

    subgraph Automated Steps
        A
        B
        C
        D
        F
        G
        H
        I
        J
        K
    end

    style E fill:#f9f,stroke:#333,stroke-width:2px
```

## Next Steps

Switch to Code mode to begin implementation, starting with the Google Form creation and embedding, followed by the Apps Script development and website JavaScript modifications.