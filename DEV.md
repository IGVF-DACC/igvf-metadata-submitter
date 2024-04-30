### Code structure

There are 3 places for source code.

- `functions/*.js`: Most of source code resides here. All `.js` files will be merged to a single file `dist/functions.gs`.
- `src/html/*.html`: Place for all HTMLs (dialog box, sidebar). All HTMLs will be copied to `dist/`.
- `src/server/menu.js`: This file and all node packages will be merged to `dist/code.gs`.
- `src/server/ANY_NODE_PACKAGE_NAME.js`: Interface for Node package. See the below section for details.
- `appsscript.json`: Google Permission stuffs. If you add a new feature that requires more Google Permission, then add it to this file.


## How to deploy it to remote Apps Script

Running `npm run deploy` will make a new build on `dist/` and deploy it to the App Script defined in `.clasp.json`.


### How to add a new Node package

Google Apps Script has its own libraries but they are not very good. For example, they didn't have a good JSON schema validator so I added `ajv` to the project.

Add a package of interest to `package.json` and make a new `ANY_GOOD_NAME.js` file on `src/server/` and add a global function to call functions from the package. Apps Script files in `functions/` will only have access to those global functions (not the package itself).

Take a look at `src/server/jsonSchema.js` and see how `validateJson()` is called in Apps Script files in `functions/`.


### CLI version of the submitter

There is a CLI version https://github.com/IGVF-DACC/igvf_utils. It's forked from `encode_utils`.


### Apps Script Quota and why profiles are hard-coded.

Apps Script is free but limited. There is a quota for many actions. e.g. Number of URL fetch requests per day. I tried to minimize number of requests so had to hard-code list of valid profiles. So update `ALL_IGVF_PROFILES` array in `functions/Endpoint.js` whenever there is a new release for the portal.


### How to debug in Apps Script

Go to the spreadsheet and click on `Extensions` - `Apps Script`. Most menu items are linked to functions in `functions/UserInterface.gs` and they are free of arguments. So select any function to debug and click on Debug button.


### How script update (upgrade) works

If a user clicks on `Check for script update` menu then the code wil check the latest release on github and check if its tag matches with `SCRIPT_VERSION`. See `Version.js` for details.


### How to bump version and make a new sheet

See [`INSTALL.md`](./INSTALL.md) for details about how to create a new Google Sheet document.

And then update the followings:
- var `SCRIPT_VERSION` in `functions/Version.gs`.
- Google Sheet URL and version number in `README.md`.
- Version number in `INSTALL.md`.


### How to update IGVF profiles to the latest

For Google Apps Script quota-related reasons, list of valid profiles for both platforms (ENCODE and IGVF) are hardcoded in `functions/Endpoint.gs`. You can find a shell command line to get the latest sorted profiles directly from the production server.

Check comments in the above file. For example, to get the latest IGVF profiles, run the following:
```
$ curl "https://api.data.igvf.org/profiles?format=json&frame=object" \
  | jq | perl -ne '/\/profiles\/(.+).json/ and print "  \"$1\",\n";' | sort | uniq
```
And then replace contents of var `ALL_IGVF_PROFILES` with the result.


### Make changes to the local code and apply it to remote Sheet

Simply run the following to update remote Sheet with the local code.
```
$ npm run deploy
```

Make sure that target Apps Script ID matches with that defined in `.clasp.json`.
