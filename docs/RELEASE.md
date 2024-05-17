# How to relase a new version

1. Create a branch for the new release.
2. Update `SCRIPT_VERSION` in `functions/Version.gs`.
3. Update the IGVF profiles to the latest in `functions/Endpoint.gs`.
4. Update INSALL.md with the new title, for example - IGVF Metadata Submitter v0.3.1, for creating the new google sheet. Follow the instructions in the document to create the new Google Spreadsheet. Get the script ID from the output and edit `scriptId` in `.clasp.json`
5. Update README.md with the new version number and new file link you just generated.
6. Update UPDATE.md with the new links for `functions.gs` and `code.gs`.
7. Create a pull request for it. Once it is approved then you can merge it to MAIN branch and create your new release.
