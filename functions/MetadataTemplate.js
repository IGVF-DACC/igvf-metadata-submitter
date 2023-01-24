const DEFAULT_BASE_TEMPLATE = {
  [HEADER_COMMENTED_PROP_RESPONSE]: null,
  [HEADER_COMMENTED_PROP_RESPONSE_TIME]: null,
};

function makeMetadataTemplateFromProfile(profile, forAdmin=false, template=DEFAULT_BASE_TEMPLATE) {
  // add all properties except for non-editable ones
  // if default exists for a prop then use it
  // otherwise use null for prop
  var result = template;
  for (var prop of Object.keys(profile["properties"])) {
    if (!isPostableProp(profile, prop, forAdmin)) {
      continue;
    }
    // null if default does not exist
    result[prop] = getDefaultForProp(profile, prop);
  }

  return result;
}
