# Warren Buffett Scorecard

![](https://fortunedotcom.files.wordpress.com/2016/08/warren-buffett-2015.jpg)

## Background

Warren Buffett coined the term "internal scorecard" to describe the importance of measuring self-worth by your own standards rather than those around you:

- https://fs.blog/2016/08/the-inner-scorecard/
- https://www.inc.com/marcel-schwantes/warren-buffett-says-he-became-a-self-made-billionaire-because-he-played-by-1-simple-rule-of-life-which-most-people-dont.html
- http://www.marcuswong.ninja/scorecard/

I've found that living according to an internal scorecard is easier said than done. Like most people, I'm easily — and sometimes unconsciously — influenced by my peers' opinions and incentives.

The Warren Buffett Scorecard is a personal project that solves two problems:

1. It helps me define my personal values in writing, making them more concrete.
2. It tracks my progress and reminds me if I'm letting any values slip.

## How it Works

1. I define my personal values in a [Google Docs spreadsheet](https://docs.google.com/spreadsheets/d/1Mf45Cc0E-FYtWfNFYXn4C3v8N_2grr_qCpInfx8-34c/edit?usp=sharing). My current values include Work, Social, Money, Health and Karma.

2. The `index.js` script converts the spreadsheet to JSON and uploads it to S3 along with a static `index.html` page for viewing my current grade for the week.

## Getting started

1. Create a Google Docs spreadsheet that follows [this structure](https://docs.google.com/spreadsheets/d/1Mf45Cc0E-FYtWfNFYXn4C3v8N_2grr_qCpInfx8-34c/edit?usp=sharing).

2. Sign up for an AWS account if necessary and then create a new bucket using S3. Your bucket should have public read access and the "default static website hosting" option turned on. Remember your bucket's name.

3. Create an IAM role with read/write permissions for the bucket. When you create this role, you'll receive an access key id and secret key for the user.

4. Modify your existing `~/.aws/credentials` file or create a new one with the keys from your new IAM role:

```
[default] ; default profile
aws_access_key_id = ...your secret...
aws_secret_access_key = ...your secret...
```

5. Git clone this repo. In `index.js`, change `BUCKET` to your S3 bucket and `spreadsheetId` to your spreadsheet.

6. Run `npm start`
