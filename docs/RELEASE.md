# How to relase a new version

1. Create a branch for the new release.
2. Update `SCRIPT_VERSION` in `functions/Version.gs`.
3. Update the IGVF profiles to the latest in `functions/Endpoint.gs`.
4. Run `npm run sync:install-version` to automatically update INSALL.md title for creating the new google sheet (for example: IGVF Metadata Submitter v0.3.1). Follow the document instructions to create the new Google Spreadsheet. Get the script ID from the output and edit `scriptId` in `.clasp.json`.
5. Update README.md with the new file link you just generated.
6. Update UPDATE.md with the new links for `functions.gs` and `code.gs`.
7. Create a pull request for it. Once it is approved then you can merge it to MAIN branch and create your new release.
