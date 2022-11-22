# IGVF metadata submitter

IGVF metadata submitter based on Google Apps Script + Google Sheets


## Installation

Enable [Google Apps Script API](https://script.google.com/home/usersettings).

Update `Node.js` and `npm`
```bash
$curl -fsSL https://deb.nodesource.com/setup_19.x | sudo -E bash - && sudo apt-get install -y nodejs
$sudo npm install npm -g
```

Install `clasp`
```bash
$ sudo npm i @google/clasp@2.3.0 -g
```


## How to use

Create with a new Google Spreadsheet with the script.
```bash
$ npx clasp create --type sheets --title "IGVF Metadata Submitter v0.1.1" --rootDir ./dist
```

Edit `scriptId` in `.clasp.json` to change the target Google Sheet to embed the script in.

Deploy the script to the sheet.
```bash
$ npm run deploy
```
