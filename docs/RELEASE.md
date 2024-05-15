# How to relase a new version

1. Create a branch for the new release.
2. Update `SCRIPT_VERSION` in `functions/Version.gs`.
3. Update INSALL.md with the new title, for example - IGVF Metadata Submitter v0.3.1, for creating the new google sheet. Create with the new Google Spreadsheet with the script follow the instruction in the document. Get the script ID from the output and edit `scriptId` in `.clasp.json`
4. Update README.md with the new version number and new file link you just generated.
5. Update UPDATE.md with the new links for `functions.gs` and `code.gs`.
6. Create a pull request for it. Once it is approved then you can merge it to MAIN branch and create your new release.
