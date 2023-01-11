# IGVF metadata submitter

IGVF metadata submitter based on Google Apps Script + Google Sheets


## Installation

You can install it from code or make a copy of a portable version.

## Installing from code

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

Create with a new Google Spreadsheet with the script.
```bash
$ npx clasp create --type sheets --title "IGVF Metadata Submitter v0.2.0" --rootDir ./dist
```

Get the script ID from the output and edit `scriptId` in `.clasp.json`.

Deploy the script to the created sheet. Whenver you make changes to the code, run this to update the code in Google Apps Script.
```bash
$ npm run deploy
```


## Cloning a portable version (user)

Make a copy of this portable version and grant any required permissions.

https://docs.google.com/spreadsheets/d/1zEw5qilpKZdiMXCNv4n9hOXv9s3THWkwi7-WAC2sM7k/edit?usp=sharing


## Configuration

Can configure the submitter either globally or for a specific sheet.

### Authorization

Authorize on ENCODE and IGVF portal. Get a username/password pair from Profile menu.

### Endpoints

There are two endpoints for READ and WRITE. READ actions (GET, getting profile JSON) send requests to the READ endpoint and WRITE actions (PATCH, POST, PUT) send requests to the WRITE endpoint.


## Functions

This section describes how to use each function.

### GET

### PATCH-APPEND

### PATCH-REMOVE

### POST

### PUT
