# IGVF metadata submitter

IGVF metadata submitter based on Google Sheet + Google Apps Script.


## Installation

You can install it from code or make a copy from a portable version.

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
$ npx clasp create --type sheets --title "IGVF Metadata Submitter v0.2.1" --rootDir ./dist
```

Get the script ID from the output and edit `scriptId` in `.clasp.json`.

Deploy the script to the created sheet. Whenver you make changes to the code, run this to update the code in Google Apps Script.
```bash
$ npm run deploy
```


## Cloning a portable version (user)

Make a copy of this portable version and grant any required permissions.
-`v0.2.1`: https://docs.google.com/spreadsheets/d/1zEw5qilpKZdiMXCNv4n9hOXv9s3THWkwi7-WAC2sM7k/edit?usp=sharing


## Settings

You can configure the submitter either globally or for a specific sheet.

### Authorization

Authorize on ENCODE and IGVF portal. Get a username/password pair from portal's `Profile` menu.

### Endpoints

There are two endpoints for READ and WRITE. READ actions (GET, getting profile schema JSON) send requests to the READ endpoint and WRITE actions (PATCH, POST, PUT/REPLACE) send requests to the WRITE endpoint.

### Profile

Name of a profile. Only `snake_case` or capitalized `CamelCase` works. For example, `experiment`, `Lab`, `human_donor` and `MouseDonor`.

## How to select rows

You can skip a row by setting `#skip` column as `1` or by hiding the row itself (right-click on the selected rows and `Hide`).

## Functions

This section describes how to use each function.

### GET

GET will send a GET request to the portal and will convert retrieved metadata to a row on the sheet.

### PATCH

Not implemented yet

### PATCH-APPEND

Not implemented yet

### PATCH-REMOVE

Not implemented yet

### POST

POST sends a POST request to the portal. Use this to submit a new metadata and generate an accession/ID.

### PUT (REPLACE)

PUT (REPLACE) sends a PUT request to the portal so that the whole metadata on the portal is replaced with a row on the sheet. **Beware that this will remove any missing properties on the sheet from the portal**.

Before you PUT to the portal, make sure to GET the metadata with GET (ADMIN) first.

## Property legends

Color and style represents a type of property.

### Property color

- <span style="color:blue">Blue</span>: Identifying property
- <span style="color:red">Red</span>: Required property
- <span style="color:gray">Gray</span>: Admin-only/non-submittable property
- <span style="color:black">Black</span>: Submittable property

### Property style

- <span style="text-decoration:underline">Underline</span>: Searchable property
- ***Italic+Bold***: Array type property
