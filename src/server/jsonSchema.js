const AjvDraft04 = require('ajv-draft-04');
const AjvDraft202012 = require('ajv/dist/2020');

global.validateJson = (schema, data) => {
  // To use different schema engine for two platforms
  // ENCODE: draft-4
  // IGVF: draft-2022-12
  const ajv =
    schema.$schema === 'http://json-schema.org/draft-04/schema#'
      ? new AjvDraft04({ strict: false })
      : new AjvDraft202012({ strict: false });

  const valid = ajv.validate(schema, data);
  return { valid, errors: ajv.errors };
};
