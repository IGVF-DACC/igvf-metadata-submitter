const Ajv = require('ajv-draft-04');

global.validateJson = (schema, data) => {
  const ajv = new Ajv({ strict: false });
  const valid = ajv.validate(schema, data);
  return { valid, errors: ajv.errors };
};
