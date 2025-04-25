# Comments Backend Setup Guide

This document provides instructions for setting up and maintaining the comments backend for the wedding website.

## Overview

The comments system uses:
- Google Forms for collecting user submissions
- Google Sheets for storing the submissions
- Google Apps Script for processing, approving, and serving comments
- JavaScript on the website to fetch and display approved comments

## Setup Steps Completed

1. **Google Form**
   - Created a form to collect name, location preference, and comments
   - Form responses are stored in a Google Sheets spreadsheet

2. **Google Sheets**
   - Spreadsheet ID: `1DFiI7rxIE5n-aJOkegiwbb0vf2m_6PIioMkzjmokBKI`
   - Contains form responses

3. **CSV Publication**
   - Published the Google Sheet as CSV
   - Made the data publicly accessible for reading
   - CSV URL: `https://docs.google.com/spreadsheets/d/e/2PACX-1vSOHsyRucu7GV5fPCIS28rfqyJmaGr0JL6uKY2mxl-Nek19QMjhTHl51QEb9tJHDgIcITopPplUnEuR/pub?gid=1432295459&single=true&output=csv`

4. **Website Integration**
   - Updated `js/main.js` to fetch comments directly from the published CSV
   - Added fallback to mock data if the API is unavailable

## How to Use

### Approving Comments

1. Open your Google Sheets spreadsheet
2. Click on the "Comments Admin" menu in the top menu bar
3. Select "Open Admin Interface"
4. Review pending comments and click "Approve" or "Reject" for each one
5. Approved comments will automatically appear on the website

### Admin Credentials

- Username: `admin`
- Password: `wedding2025`

You can change these in the `comments-backend.gs` file in the `CONFIG` object.

## Troubleshooting

If comments are not appearing on the website:

1. Check that the Google Apps Script web app is deployed and accessible
2. Verify that there are approved comments in the "Approved Comments" sheet
3. Check the browser console for any JavaScript errors
4. Try refreshing the page or clearing the browser cache

## Future Improvements

- Add email notifications for new submissions
- Enhance the admin interface with more filtering and sorting options
- Implement comment editing functionality
- Add analytics for comment engagement