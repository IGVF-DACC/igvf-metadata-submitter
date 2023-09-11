# IGVF metadata submitter

IGVF metadata submitter based on Google Sheet + Google Apps Script.


## Limitation

This script is heavily based on Google Apps Script(GAP)'s URL fetch call to communicate with the portal. GAP is free but has some limit/quota. Check quota [here](https://developers.google.com/apps-script/guides/services/quotas). It's limited to `20,000` URL fetch calls a day. It's `100,000` for Google Workspace users (it costs $6 per month).

## Installation

You can install it from code or make a copy from a portable version.

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
$ npx clasp create --type sheets --title "IGVF Metadata Submitter v0.2.7 (WRN-446)" --rootDir ./dist
```

Get the script ID from the output and edit `scriptId` in `.clasp.json`.

Deploy the script to the created sheet. Whenver you make changes to the code, run this to update the code in Google Apps Script.
```bash
$ npm run deploy
```

## Cloning a portable version (user)

Make a copy of this portable version and grant any required permissions.

`v0.2.7 (WRN-446)`: https://docs.google.com/spreadsheets/d/1fq1Tk297428Zc5J1B22Tcv9wFuPRRjp6Osr8a1LjRSo/edit?usp=sharing


## Settings

You can configure the submitter either globally or for a specific sheet.

### Authorization

Authorize on ENCODE and IGVF portal. Get a username/password pair from portal's `Profile` menu.

### Endpoints

There are two endpoints for READ and WRITE. READ actions (GET, getting profile schema JSON) send requests to the READ endpoint and WRITE actions (PATCH, POST, PUT) send requests to the WRITE endpoint.

### Profile

Name of a profile. Only `snake_case` or capitalized `CamelCase` works. For example, `experiment`, `Lab`, `human_donor` and `MouseDonor`.

## Functions

This section describes how to use each function. This metadata submitter converts each row into a JSON object and then submit it to the portal.

You can skip a row by setting `#skip` column as `1` or by hiding the row itself (right-click on the selected rows and `Hide`).

Also, if cell's value is empty for a certain property then such property is not included in the JSON object when being sent to the portal.

### GET

GET will send a GET request to the portal and will convert retrieved metadata to a row on the sheet.

### PATCH

PATCH will send a patch request to the portal in order to patch properties of **SELECTED** columns. Only selected columns will be affected by this request. Properties in other columns will not be included in the request.

### POST

POST sends a POST request to the portal. Use this to submit a new metadata and generate an accession/ID.

### PUT

PUT sends a PUT request to the portal so that the whole metadata on the portal is replaced with a row on the sheet. **Beware that this will remove any missing properties on the sheet from the portal**.

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

### File upload sidebar

You can directly upload local files to portal's S3 bucket on the upload sidebar. Use it after POSTing metadata to the portal. Make sure that there is at least one identifying property in the header (e.g. `accession`, `uuid`).

Add three commented columns `#upload_status`, `#upload_abspath` and `#upload_cmd` to the sheet. `#upload_status` will be automatically updated while uploading. `#upload_abspath` is to define absolue path of files to be uploaded.

Click on menu `IGVF/ENCODE` - `Upload sidebar` and read the instruction carefully. 

`#upload_cmd` is optional for manual uploading using S3 CLI. If you want to upload from a remote server via AWS CLI, then drag and drop any empty folder and click on the initialize button. Make sure that `--body` parameter in `#upload_cmd` points to a correct path on a remote server.

You need to drag and drop a root folder that contains all files to be uploaded. Such action is necessary to grant read permission of files to the sidebar. Therefore, make sure that all files are organized under a single root directory.
