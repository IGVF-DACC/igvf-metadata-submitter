This documents describes how to replace submitter's script with the latest version without losing contents of the original Spreadsheet.

Please make a copy of original spreadsheet first and run the following on the copied spreadsheet.


1) Click on the menu `Extensions` - `Apps Script`.

2) Click on `functions.gs` and replace contents with 
https://raw.githubusercontent.com/IGVF-DACC/igvf-metadata-submitter/main/dist/functions.js

3) Click on `code.gs` and replace contents with 
https://raw.githubusercontent.com/IGVF-DACC/igvf-metadata-submitter/main/dist/code.js

4) Refresh the spreadsheet and check the version number in the `IGVF` menu.

5) Additionally run `IGVF` - `Show sheet info & check script version` to make sure that the script is up to date.
