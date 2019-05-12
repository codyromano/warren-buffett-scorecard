const fs = require("fs");
const readline = require("readline");
const AWS = require("aws-sdk");
const { google } = require("googleapis");

const credentials = new AWS.SharedIniFileCredentials({ profile: "default" });
AWS.config.credentials = credentials;

const s3 = new AWS.S3({
  signatureVersion: "v4"
});

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.

const BUCKET = "internal-scorecard";
const TOKEN_PATH = "token.json";
const REPORT_PATH = "report.json";

// Load client secrets from a local file.
fs.readFile("credentials.json", (err, content) => {
  if (err) return console.log("Error loading client secret file:", err);
  // Authorize a client with credentials, then call the Google Sheets API.
  authorize(JSON.parse(content), reviewScorecard);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question("Enter the code from that page here: ", code => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err)
        return console.error(
          "Error while trying to retrieve access token",
          err
        );
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function uploadFiles(files) {
  let filesUploaded = 0;

  for (const fileName of files) {
    const bodyContent = fs.readFileSync(fileName, error => {
      if (error) {
        console.log("Problem reading local file for S3 upload");
        throw error;
      }
    });

    const extension = fileName.split(".")[1];

    s3.upload(
      {
        Key: fileName,
        Bucket: BUCKET,
        Body: bodyContent,
        ContentType: `text/${extension}`,
        ACL: "public-read"
      },
      (error, data) => {
        if (error) {
          console.log("Error uploading file to S3.");
          throw error;
        } else {
          filesUploaded += 1;
          console.log(`Uploaded ${data.Location}`);
        }
        if (filesUploaded === files.length) {
          console.log(`App deployed successfully!`);
        }
      }
    );
  }
}

function reviewScorecard(auth) {
  const sheets = google.sheets({ version: "v4", auth });
  sheets.spreadsheets.values.get(
    {
      spreadsheetId: "1AxA05tYZ1A5fzPQvqgIroOJQc39Q-aWBYFn0Ic33nP4",
      range: "Scorecard!A1:H"
    },
    (err, res) => {
      if (err) return console.log("The API returned an error: " + err);

      const report = {
        rows: res.data.values
      };

      fs.writeFileSync(REPORT_PATH, JSON.stringify(report), err => {
        if (err) return console.error(err);
        console.log("Report stored to ", REPORT_PATH);
      });

      uploadFiles([REPORT_PATH, "index.html", "report.css", "showReport.js"]);
    }
  );
}
