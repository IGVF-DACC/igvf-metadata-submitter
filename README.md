# IGVF metadata submitter

IGVF metadata submitter based on Google Sheet + Google Apps Script.


## Installation

Make a copy of the following spreadsheet and grant any required permissions. Then refresh the cloned spreadsheet page.

`v0.3.0`: https://docs.google.com/spreadsheets/d/1gWEHGdi0eNjaX1mmC3FrgHFntfhWMib3ipQeas3ukzI/edit?usp=sharing

To build and deploy a new spreadsheet, see [INSTALL.md](INSTALL.md).


## Settings

Authorization and endpoint are global settings. Profile name should be defined for each sheet.

### Authorization

Get a key/serect pair from portal's `Profile` menu. Click on menu `Authorize for IGVF` and enter them.

### Endpoint

We provide multiple endpoints to communicate with the portal. Click on menu `Set endpoint` and enter supported endpoints.

### Profile

You need to set a profile for each sheet in the spreadsheet. For each sheet, click on menu `Set profile name`. Only `snake_case` or capitalized `CamelCase` works. For example, `measurement_set`, `award` and `Lab`.


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

### PUT (Admin only)

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


## File upload sidebar

You can directly upload local files to portal's S3 bucket on the upload sidebar. Use it after POSTing metadata to the portal. Make sure that there is at least one identifying property in the header (e.g. `accession`, `uuid`).

Add three commented columns `#upload_status`, `#upload_abspath` and `#upload_cmd` to the sheet. `#upload_status` will be automatically updated while uploading. `#upload_abspath` is to define absolue path of files to be uploaded.

Click on menu `IGVF/ENCODE` - `Upload sidebar` and read the instruction carefully. 

`#upload_cmd` is optional for manual uploading using S3 CLI. If you want to upload from a remote server via AWS CLI, then drag and drop any empty folder and click on the initialize button. Make sure that `--body` parameter in `#upload_cmd` points to a correct path on a remote server.

You need to drag and drop a root folder that contains all files to be uploaded. Such action is necessary to grant read permission of files to the sidebar. Therefore, make sure that all files are organized under a single root directory.


## Attachment

For a profile with `attachment` property (e.g. `document` profile), you can define `attachment` column as a JSON string `{"path":"/GOOGLE/DRIVE/PATH/TO/FILE/me.pdf"}`.

It is recommended to make a local directory for document files only on your computer, and then drag and drop the folder itself to your Google Drive. Then all files in it will be transferred to Google Drive while keeping the directory structure.
