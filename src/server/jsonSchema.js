const AjvDraft04 = require('ajv-draft-04');
const Ajv = require('ajv');

global.validateJson = (schema, data) => {
  const ajv =
    schema.$schema === 'http://json-schema.org/draft-04/schema#'
      ? new AjvDraft04({ strict: false })
      : new Ajv({ strict: false });

  const valid = ajv.validate(schema, data);
  return { valid, errors: ajv.errors };
};
