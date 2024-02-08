### How to bump version and make a new sheet

See [`INSTALL.md`](./INSTALL.md) for details about how to create a new Google Sheet document.

Update the followings:
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
