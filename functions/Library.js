function getType(p) {
    if (Array.isArray(p)) return "array";
    else if (typeof p == "string") return "string";
    else if (typeof p == "number") return "number";
    else if (p != null && typeof p == "object") return "object";
    else return "other";
}

function last(array) {
  return array[array.length - 1];
}

function toBoolean(val) {
  var s = String(val).toLowerCase();
  return ["1", "true", "t", "o"].includes(s);
}

function isArrayString(str) {
  var trimmed = str.trim();
  return trimmed.startsWith("[") && trimmed.endsWith("]");
}

function isJsonString(str) {
  var trimmed = str.trim();
  return trimmed.startsWith("{") && trimmed.endsWith("}");
}

function trimTrailingDot(str) {
  return str.replace(/\.$/, "");
}

function trimTrailingSlash(str) {
  return str.replace(/\/+$/, "");
}

function snakeToCamel(snake) {
  return snake.toLowerCase().replace(/([-_][a-z])/g,
    group => group.toUpperCase().replace('-', '').replace('_', '')
  );
}

function camelToSnake(camel) {
  return camel.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function capitalizeWord(word) {
  return word[0].toUpperCase() + word.substr(1);
}

function uncapitalizeWord(word) {
  return word[0].toLowerCase() + word.substr(1);
}

function alertBoxOkCancel(prompt) {
  return SpreadsheetApp.getUi().alert(
    prompt, SpreadsheetApp.getUi().ButtonSet.OK_CANCEL
  ) === SpreadsheetApp.getUi().Button.OK;
}

function alertBox(prompt) {
  SpreadsheetApp.getUi().alert(prompt);
}

function getCurrentLocalTimeString(sep="-") {
  // returns current time string with all special characters
  // replaced with `sep`
  var d = new Date();
  d = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  if (sep != "") {
    return d.toISOString().replace(/T/g,sep).replace(/\:/g,sep).replace(/Z/g,'') .replace(/\..*/g,'');
  }
  return d.toISOString().replace(/T/g,' ').replace(/Z/g,'');
}

// https://stackoverflow.com/a/47098533/8819536
function openUrl( url ){
  var html = HtmlService.createHtmlOutput('<html><script>'
  +'window.close = function(){window.setTimeout(function(){google.script.host.close()},9)};'
  +'var a = document.createElement("a"); a.href="'+url+'"; a.target="_blank";'
  +'if(document.createEvent){'
  +'  var event=document.createEvent("MouseEvents");'
  +'  if(navigator.userAgent.toLowerCase().indexOf("firefox")>-1){window.document.body.append(a)}'                          
  +'  event.initEvent("click",true,true); a.dispatchEvent(event);'
  +'}else{ a.click() }'
  +'close();'
  +'</script>'
  // Offer URL as clickable link in case above code fails.
  +'<body style="word-break:break-word;font-family:sans-serif;">Failed to open automatically. <a href="'+url+'" target="_blank" onclick="window.close()">Click here to proceed</a>.</body>'
  +'<script>google.script.host.setHeight(40);google.script.host.setWidth(410)</script>'
  +'</html>')
  .setWidth( 90 ).setHeight( 1 );
  SpreadsheetApp.getUi().showModalDialog( html, "Opening ..." );
}
