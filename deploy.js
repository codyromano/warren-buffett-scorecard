const AWS = require("aws-sdk");
const fs = require('fs-extra');
const path = require('path');

const walk = async (dir, filelist = []) => {
  const files = await fs.readdir(dir);

  for (file of files) {
    const filepath = path.join(dir, file);
    const stat = await fs.stat(filepath);

    if (stat.isDirectory()) {
      filelist = await walk(filepath, filelist);
    } else {
      filelist.push(filepath);
    }
  }

  return filelist;
}

const credentials = new AWS.SharedIniFileCredentials({ profile: "default" });
AWS.config.credentials = credentials;

const s3 = new AWS.S3({
  signatureVersion: "v4"
});

const BUCKET = "internal-scorecard";

async function uploadFiles(files) {
   const filepaths = await walk('./public');

   for (const filepath of filepaths) {
    const bodyContent = await fs.readFileSync(filepath, error => {
      if (error) {
        console.log("Problem reading local file for S3 upload");
        throw error;
      }
    });

    const extension = filepath.split('.').slice(-1)[0];
    const mapExtensionToFileType = {
      'html': 'text/html',
      'json': 'text/json',
      'gif': 'image',
      'jpeg': 'image',
    };

    s3.upload(
      {
        Key: filepath.replace('public/',''),
        Bucket: BUCKET,
        Body: bodyContent,
        ContentType: mapExtensionToFileType[extension] || `text/${extension}`,
        ACL: "public-read"
      },
      (error, data) => {
        if (error) {
          console.log("Error uploading file to S3.");
          throw error;
        } else {
          console.log(`Uploaded ${data.Location}`);
        }
      }
    );
   }
  }

uploadFiles();
