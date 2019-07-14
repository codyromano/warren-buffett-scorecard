# Life Dashboard

A "Life Dashboard" that pops up when you open a new browser tab. Reads data from connected devices to show life progress in various categories.

![](https://internal-scorecard.s3-us-west-2.amazonaws.com/images/Screen+Shot+2019-07-13+at+5.56.28+PM.png)

## Basic setup

To get started:
```
npm install
```
Development:
```
npm run dev
```
Deployment (see instructions below):
```
npm run deploy
```

## Optional

You can run the `npm deploy` script to deploy the static files in this folder to S3. To enable this, follow the steps below:

1. Sign up for an AWS account if necessary and then create a new bucket using S3. Your bucket should have public read access and the "default static website hosting" option turned on. Remember your bucket's name.

2. Create an IAM role with read/write permissions for the bucket. When you create this role, you'll receive an access key id and secret key for the user.

3. Modify your existing `~/.aws/credentials` file or create a new one with the keys from your new IAM role:

```
[default] ; default profile
aws_access_key_id = ...your secret...
aws_secret_access_key = ...your secret...
```

4. In `index.js`, change `BUCKET` to your S3 bucket and `spreadsheetId` to your spreadsheet.

5. Run `npm deploy`

## Wishlist

- [ ] Create a .json file to store credentials for all integrations (Fitbit, Google Drive, etc.)
- [ ] Add instructions to this README for the setting up integrations.
