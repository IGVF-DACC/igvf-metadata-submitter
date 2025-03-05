## Installing from code

Enable [Google Apps Script API](https://script.google.com/home/usersettings).

Update `Node.js` and `npm`
```bash
$ curl -fsSL https://deb.nodesource.com/setup_19.x | sudo -E bash - && sudo apt-get install -y nodejs
$ sudo npm install npm -g
```

Install `clasp`
```bash
$ sudo npm i @google/clasp@2.3.0 -g
```

Create with a new Google Spreadsheet with the script.
```bash
$ npx clasp create --type sheets --title "IGVF Metadata Submitter v0.3.5" --rootDir ./dist
```

Get the new Google Sheets Add-on script ID from the console output and edit `scriptId` in `.clasp.json`.

Deploy the script to the created sheet. Whenver you make changes to the code, run this to update the code in Google Apps Script.
```bash
$ npm run deploy
```
