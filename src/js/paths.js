/**
 * Centralized path management for the DapperFoxes Wedding Website.
 */

// Base URLs for external services
const GOOGLE_APPS_SCRIPT_BASE_URL = 'https://script.google.com/macros/s/';

// Specific Web App URLs
export const POLL_COMMENTS_APP_URL = `${GOOGLE_APPS_SCRIPT_BASE_URL}AKfycbxE-r-2jO4jgRaVcVWO7SSSJY9gwTDmsDnLsHkOndI0FqpTdMj2YT1odmtMg8pRVzWScA/exec`;
export const GUEST_PHOTOS_APP_URL = `${GOOGLE_APPS_SCRIPT_BASE_URL}AKfycbzIWWruyUl574PtFqglVXNU3RPmuKrsQSPYBTSzLvJVou81EkZJX7voqq5QONWC2nwZ/exec`;

// Paths to project data files (relative to the project root)
const DATA_DIR = '/'; // Assuming data files are at the root for now

export const OFFICIAL_PHOTOS_JSON_PATH = `${DATA_DIR}official-photos.json`;

// Paths to asset directories (relative to the project root)
const IMAGES_DIR = '/images/';
export const WEDDING_WEBSITE_IMAGES_DIR = `${IMAGES_DIR}weddingwebsite/`;

// Example function for constructing image paths (if needed later)
// export function getWeddingWebsiteImagePath(filename) {
//   return `${WEDDING_WEBSITE_IMAGES_DIR}${filename}`;
// }