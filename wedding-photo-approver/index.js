// index.js (OAuth2 version)
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const config = require('./config.json');

const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('oauth_credentials.json', (err, content) => {
  if (err) return console.error('Error loading client secret file:', err);
  authorize(JSON.parse(content), notifyUnapprovedPhotos);
});

function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  console.log('Authorize this app by visiting this URL:', authUrl);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

async function notifyUnapprovedPhotos(auth) {
  const sheets = google.sheets({ version: 'v4', auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: config.sheetId,
    range: config.range,
  });

  const rows = res.data.values;
  if (!rows || rows.length === 0) return;

  const headers = rows[0];
  const nameIndex = headers.indexOf('Name');
  const photoIndex = headers.indexOf('Photo URL');
  const approvalIndex = headers.indexOf('Approved?');

  const unapproved = rows
    .slice(1)
    .filter(row => !row[approvalIndex])
    .map(row => ({
      name: row[nameIndex],
      photo: row[photoIndex],
    }));

  if (unapproved.length > 0) {
    await sendEmail(unapproved);
  }
}

async function sendEmail(photos) {
  const transporter = nodemailer.createTransport(config.email.smtp);

  const content = photos
    .map(p => `<p><strong>${p.name}</strong><br><img src="${p.photo}" width="300"/></p>`)
    .join('');

  await transporter.sendMail({
    from: config.email.from,
    to: config.email.to,
    subject: 'New Wedding Photo Submissions 🎉',
    html: `<h2>You’ve got new photos to approve:</h2>${content}`,
  });

  console.log('✅ Notification sent!');
}
