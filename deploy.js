const fs = require("fs");
const AWS = require("aws-sdk");

const credentials = new AWS.SharedIniFileCredentials({ profile: "default" });
AWS.config.credentials = credentials;

const s3 = new AWS.S3({
  signatureVersion: "v4"
});

const BUCKET = "internal-scorecard";

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

uploadFiles(["index.html", "report.css", "showReport.js"]);
