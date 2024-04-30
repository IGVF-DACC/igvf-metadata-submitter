# IGVF metadata submitter

IGVF metadata submitter based on Google Sheet + Google Apps Script.


## Installation

Make a copy of the following spreadsheet.

`v0.3.2`: https://docs.google.com/spreadsheets/d/1B3rtH8j0D-EI_zJksYD40cuG-eF-RxArKjk2ZvYDOmQ/edit?usp=sharing

Click on the menu item `IGVF` and then `Authorize for IGVF`. You will see an error message `Authorization Required`. Click on `Continue`, choose your Google account. Click on `Advanced` and `Go to IGVF Metadata Submitter (unsafe)` and then click on `Allow`.

To build and deploy a new spreadsheet directly from a code, see [INSTALL.md](INSTALL.md).

### Authorization

Get a key/secret pair from portal's `Profile` menu. Click on menu `Authorize for IGVF` and enter credentials.


### Endpoint

Click on menu `Set endpoint`. We provide multiple endpoints to communicate with the portal. For example, `https://api.sandbox.igvf.org` is an endpoint for testing purpose and `https://api.data.igvf.org` is for production. Click on menu `Set endpoint` and enter supported endpoints.


### Profile

Create a new sheet and click on menu `Set endpoint`. An endpoint is set for each sheet. Only `snake_case` (recommended) or capitalized `CamelCase` works. For example, `measurement_set`, `sequence_file`, `award` and `Lab`. The script will automatically create a template row for the given profile.


## Functions

This metadata submitter converts each row into a JSON object and then submit it to the portal.

You can skip any row by setting `#skip` column as `1` or by hiding the row itself (right-click on the selected rows and `Hide`).

Also, if cell's value is empty for a certain property then such property is simply ignored (not included in the JSON object when being sent to the portal).

### GET

GET will send a GET request to the portal and will convert retrieved metadata to a row on the sheet.

### POST

POST sends a POST request to the portal. Use this to submit a new metadata and generate an accession/ID.

### PATCH

PATCH will send a patch request to the portal in order to patch properties of **SELECTED** columns. Only selected columns will be affected by this request. Properties in other columns will not be included in the request.

### PUT (Admin only)

PUT sends a PUT request to the portal so that the whole metadata on the portal is replaced with a row on the sheet. **Beware that this will remove any missing properties on the sheet from the portal**.

Before you PUT to the portal, make sure to GET the metadata with GET (ADMIN) first.


### Attachment

For a profile with `attachment` property (e.g. `document` profile), you can define `attachment` column as a JSON string `{"path":"/GOOGLE/DRIVE/PATH/TO/FILE/me.pdf"}`.

It is recommended to make a local directory for document files only on your computer, and then drag and drop the folder itself to your Google Drive. Then all files in it will be transferred to Google Drive while keeping the directory structure.


### Local file uploading (sidebar)

You can directly upload local files to portal's S3 bucket on the upload sidebar. Use it after POSTing metadata to the portal. Make sure that there is at least one identifying property in the header (e.g. `accession`, `uuid`).

Click on menu `IGVF` - `Upload local files (sidebar)` and it will automatically add two columns to the current sheet: `#upload_status` and `#upload_abspath`. Define absolute paths of files to be uploaded under the column `#upload_abspath`. `#upload_status` will show uploading status.

On the sidebar, you need to drag and drop a root folder that contains all files to be uploaded. Such action is necessary to grant read permission of files to the sidebar. Therefore, make sure that all files are organized under a single root directory.


### Local file uploading (S3 command line)

Install AWS CLI first on your local computer/cluster where your files are.

```bash
$ pip install awscli
```

Click on menu `IGVF` - `Generate S3 command line for file uploading` and then the script will generate required columns for the feature: `#upload_abspath` and `#upload_cmd`. Define `#upload_abspath` for each row and click on the menu again. Use shell command line under `#upload_cmd` column to manually upload your files to the portal.


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


## Developer notes

See [`DEV.md`](./DEV.md) for details how to maintain this tool.
