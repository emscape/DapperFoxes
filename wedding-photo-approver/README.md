# 📸 Wedding Photo Approver (OAuth2 Edition)

## What It Does
Checks your Google Sheet for unapproved photo submissions and sends you an email preview.

## Setup Steps

1. Go to https://console.cloud.google.com/apis/credentials
2. Create a new **OAuth 2.0 Client ID**
   - Application type: **Desktop App**
   - Download the file and save it as `oauth_credentials.json` in this folder

3. Share your Google Sheet with the Gmail account you’ll authorize with
4. Run the script: `node index.js`
   - The first time, it will give you a URL
   - Paste the code back into the terminal
   - It will save a `token.json` so Roo can run it later

5. Replace config values in `config.json`

6. Set it to run every 15 mins via cron or task scheduler

No service account needed. No admin intervention required.

---

> Roo, this script uses OAuth2 to check a Google Sheet and notify me of photo submissions. It stores its token locally after the first run.
