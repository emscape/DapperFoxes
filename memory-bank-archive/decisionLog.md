# Decision Log

This file records architectural and implementation decisions using a list format.
2025-03-22 20:39:00 - Log of updates made.

*

## Decision

* Use GitHub Pages for hosting the wedding website
* Implement a phased approach with MVP in 2 days and full features in 60 days
* Focus MVP on poll functionality and photo sharing
* Use serverless functions for backend services
* Integrate with Google Forms and Google Albums

## Rationale 

* GitHub Pages provides free, reliable hosting for static websites
* Phased approach allows for quick delivery of essential features while planning for comprehensive functionality
* Poll and photo sharing functionality allows for immediate engagement with wedding guests
* Serverless functions eliminate the need for maintaining a dedicated server
* Google services integration leverages existing, reliable platforms

## Implementation Details

* Static website with HTML, CSS, and JavaScript
* Responsive design with mobile-first approach
* Backend services for form processing, email notifications, and content approval
* Admin interface for moderating comments and photos

[2025-03-23 14:31:00] - Configured custom domain www.thedapperfoxes.com for the wedding website

## Rationale

* Using a custom domain provides a more professional and memorable URL for wedding guests
* The www subdomain was chosen as the primary domain for better compatibility with GitHub Pages
* Both apex domain (thedapperfoxes.com) and www subdomain will be configured to work

## Implementation Details

* Added CNAME file to the repository with www.thedapperfoxes.com
* Provided instructions for configuring DNS records with the domain registrar
* A records for apex domain pointing to GitHub Pages IP addresses
* CNAME record for www subdomain pointing to emscape.github.io
[2025-03-23 15:24:00] - Decided to integrate 'Our Story' content directly into the home page rather than having it as a separate page

## Rationale

* Simplifies the user experience by reducing the number of pages to navigate
* Allows visitors to immediately see the couple's story when they visit the site
* Creates a more cohesive narrative flow on the home page

## Implementation Details

* Added a dedicated 'Our Story' section to the home page with content from our-story.md
* Incorporated photos from the images folder to illustrate the story
* Updated navigation to remove the separate 'Our Story' link
* Added responsive styling for the story section

* Integration with Google services for forms and photo management

[2025-03-23 15:40:00] - Created placeholder "Coming Soon" pages for all planned website sections

## Rationale

* Provides a complete website structure that visitors can navigate
* Sets expectations for upcoming features
* Ensures consistent navigation across the site
* Allows for incremental development of each section

## Implementation Details

* Created placeholder pages for: poll.html, photos.html, registry.html, rsvp.html, and events.html
* Each page follows the same design pattern with a "Coming Soon" message
* Updated navigation menu in index.html to include links to all pages
[2025-03-23 20:10:34] - Reorganized the home page layout for improved user experience

## Rationale

* Removed the welcome section to streamline the page and reduce redundancy
* Moved 'Our Story' section directly under the banner to give it more prominence
* Centered the featured sections for better visual balance and to draw attention to all options equally

## Implementation Details

* Removed the "Welcome to Our Wedding Website" section and thank you message
* Repositioned the "Our Story" section to appear immediately after the hero banner
* Added inline CSS to center the features section with flex layout
* Used `justify-content: center` and `text-align: center` for consistent alignment



[2025-03-23 22:24:33] - Replaced large TIF image file with PNG version to comply with GitHub file size limits

## Rationale

* GitHub has a file size limit of 100MB per file
* The original KLC_6613.tif file was 102.97MB, exceeding this limit
* Converting to PNG format reduced the file size while maintaining acceptable image quality

## Implementation Details

* Removed the large TIF file from git tracking
* Added the PNG version to the repository
* Updated commit message to document the file format change

* Updated featured sections on the home page to include all planned features

[2025-03-23 22:30:00] - Implemented location poll with interactive voting system

## Rationale

* Poll functionality was identified as a key MVP feature in the product requirements
* Interactive voting system provides immediate feedback to users
* Storing votes in localStorage prevents multiple votes from the same browser
* Custom location input for "Other" option allows for gathering additional suggestions

## Implementation Details

* Created poll interface with four location options (England, LA, Minnesota, Other)
* Added conditional display of text input field when "Other" is selected
* Implemented client-side validation to ensure complete submissions
* Added visual results display with bar charts showing vote percentages
* Used localStorage to track whether a user has already voted

[2025-03-23 23:50:00] - Replaced client-side poll with Google Form integration

## Rationale

* Google Forms provides a more robust solution for collecting and managing poll responses
* Allows for easier data collection and analysis of responses
* Provides a more secure and reliable way to handle user submissions
* Integrates well with the existing website design

## Implementation Details

* Embedded Google Form using an iframe in poll.html
* Updated the page with fun, tech-themed content from build-with-ai-wedding.md
* Removed client-side poll implementation from main.js
* Added CSS styles for the Google Form container and new content elements

[2025-03-24 00:03:24] - Decided to implement a system for displaying approved Google Form comments on the poll page

## Rationale

* Enhances user engagement by showing what others have submitted
* Creates a sense of community around the wedding planning process
* Provides transparency while maintaining control over displayed content through manual approval
* Aligns with the tech-themed, collaborative approach of the wedding website

## Implementation Details

* Will use a backend service to manage comment approval and retrieval
* Frontend will display comments in a styled section below the Google Form
* Comments will include submitter's name and timestamp
* Admin interface will allow for comment moderation
* Maintained the existing design aesthetic while incorporating the new content

[2025-03-24 00:55:00] - Added favicon to all website pages

## Rationale

* Enhances brand identity with the "Dapper Foxes" theme
* Improves user experience by providing a visual identifier in browser tabs and bookmarks
* Creates a more professional and polished appearance for the website
* Consistent branding across all pages of the website

## Implementation Details

* Added foxes-favicon.ico to the root directory
* Added favicon links in the head section of all HTML files
* Used both standard and shortcut icon links for maximum browser compatibility
* Maintained the existing file structure and naming conventions

[2025-03-24 14:03:00] - Implemented comments display feature with mock data

## Rationale

* Provides a visual representation of how the comments section will look and function
* Allows for testing and refinement of the UI before connecting to a backend service
* Creates a more engaging user experience by showing sample comments
* Follows the implementation plan created earlier for the comments feature

## Implementation Details

* Added a new section to poll.html to display comments
* Created CSS styles for the comments section with a consistent design
* Implemented JavaScript functionality to fetch and display comments
* Used mock data to simulate approved comments from Google Form submissions
* Added a note to inform users that the current comments are samples

[2025-03-24 14:26:00] - Implemented Google Apps Script backend for comments functionality

## Rationale

* Google Apps Script provides tight integration with Google Forms and Sheets
* Eliminates the need for additional hosting services
* Provides a simple way to manage comment approval through a custom admin interface
* Leverages existing Google infrastructure for reliability and security
* Allows for easy maintenance and updates

## Implementation Details

* Created a Google Apps Script that accesses form responses from Google Sheets
* Implemented an approval system for moderating comments
* Developed an admin interface for reviewing and approving/rejecting comments
* Created a web app endpoint to serve approved comments to the website
* Updated the frontend JavaScript to fetch comments from the Google Apps Script web app


[2025-03-24 17:07:00] - Added a 'Proposal Story' section to the home page

## Rationale

* Enhances the personal narrative of the couple's journey together
* Provides a meaningful and emotional story that wedding guests will appreciate
* Creates a more complete picture of Emily and Sean's relationship
* Utilizes existing high-quality proposal photos that tell a compelling story

## Implementation Details

* Added a new section between 'Our Story' and 'Featured Sections' on the home page
* Used content from proposal-story.md with the engaging narrative about Baldwin Hills Scenic Overlook
* Incorporated three key photos from the proposal event
* Maintained consistent styling with the existing 'Our Story' section
* Used emojis and conversational tone to match the existing website style

[2025-03-25 15:35:00] - Replaced Google Apps Script web app with published Google Sheets CSV for comments functionality

## Rationale

* The Google Apps Script web app was experiencing authorization issues that prevented the admin interface from working correctly
* Publishing the Google Sheet as CSV provides a simpler, more reliable way to serve approved comments
* This approach eliminates the need for complex authorization and permission management
* Manual approval process (typing "YES" in the approved column) is more straightforward for non-technical users

## Implementation Details

* Modified the fetchComments function in main.js to fetch and parse CSV data directly from a published spreadsheet URL
* Added a parseCSV helper function to convert the CSV text into comment objects
* Created a separate "Approved Comments" sheet in the Google Spreadsheet
* Published the "Approved Comments" sheet as CSV using Google Sheets' "Publish to web" feature
* Added fallback to mock data if the CSV fetch fails

* Provided comprehensive setup documentation for configuring the backend system