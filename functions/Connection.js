const PROPERTY_ENCODE_USERNAME = "encodeUsername";
const PROPERTY_ENCODE_PASSWORD = "encodePassword";
const PROPERTY_IGVF_USERNAME = "igvfUsername";
const PROPERTY_IGVF_PASSWORD= "igvfPassword";


function getUsername(server) {
  var userProperties = PropertiesService.getUserProperties();
  switch(server) {
    case ENCODE:
      return userProperties.getProperty(PROPERTY_ENCODE_USERNAME);
    case IGVF:
      return userProperties.getProperty(PROPERTY_IGVF_USERNAME);
  }
}

function setUsername(username, server) {
  var userProperties = PropertiesService.getUserProperties();
  switch(server) {
    case ENCODE:
      return userProperties.setProperty(PROPERTY_ENCODE_USERNAME, username);
    case IGVF:
      return userProperties.setProperty(PROPERTY_IGVF_USERNAME, username);
  }  
}

function getPassword(server) {
  var userProperties = PropertiesService.getUserProperties();
  switch(server) {
    case ENCODE:
      return userProperties.getProperty(PROPERTY_ENCODE_PASSWORD);
    case IGVF:
      return userProperties.getProperty(PROPERTY_IGVF_PASSWORD);
  }  
}

function setPassword(password, server) {
  var userProperties = PropertiesService.getUserProperties();
  switch(server) {
    case ENCODE:
      return userProperties.setProperty(PROPERTY_ENCODE_PASSWORD, password);
    case IGVF:
      return userProperties.setProperty(PROPERTY_IGVF_PASSWORD, password);
  }
}

function makeAuthHeaders(username, password) {
  return {"Authorization" : "Basic " + Utilities.base64Encode(username + ":" + password)};
}

function restGet(url) {
  var params = {"method" : "GET", "contentType": "application/json", "muteHttpExceptions": true};
  var server = getServerFromUrl(url);
  var username = getUsername(server);
  var password = getPassword(server);
  if (username && password) {
    params["headers"] = makeAuthHeaders(username, password);
  }
  return UrlFetchApp.fetch(url, params);
}

function restSubmit(url, payloadJson, method) {
  var params = {"method" : method, "contentType": "application/json", "muteHttpExceptions": true};
  var server = getServerFromUrl(url);
  var username = getUsername(server);
  var password = getPassword(server);
  if (username && password) {
    params["headers"] = makeAuthHeaders(username, password);
  }
  Logger.log(params);
  params["payload"] = JSON.stringify(payloadJson);
  return UrlFetchApp.fetch(url, params);
}

//////////// developer only (for debugging purpose) //////////

const PROPERTY_AWS_ACCESS_KEY = "awsAccessKey";
const PROPERTY_AWS_SECRET_ACCESS_KEY = "awsSecretAccessKey";


function getAwsAccessKey() {
  var userProperties = PropertiesService.getUserProperties();
  return userProperties.getProperty(PROPERTY_AWS_ACCESS_KEY);
}

function setAwsAccessKey(key) {
  var userProperties = PropertiesService.getUserProperties();
  return userProperties.setProperty(PROPERTY_AWS_ACCESS_KEY, key);
}

function getAwsSecretAccessKey() {
  var userProperties = PropertiesService.getUserProperties();
  return userProperties.getProperty(PROPERTY_AWS_SECRET_ACCESS_KEY);
}

function setAwsSecretAccessKey(key) {
  var userProperties = PropertiesService.getUserProperties();
  return userProperties.setProperty(PROPERTY_AWS_SECRET_ACCESS_KEY, key);
}
