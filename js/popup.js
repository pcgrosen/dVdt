let PREFIX = "enabled!";
let ISWHITELIST = "isWhitelist";
let PLAYBACKRATE = "playbackRate";
let TOGGLELANG = ["Disable", "Enable"];
var currentHost = null;

function makeKey(host) {
  return PREFIX + host;
}

function isKey(key) {
  return key.indexOf(PREFIX) === 0;
}

function parseKey(key) {
  return key.substr(PREFIX.length);
}

function isHostKey(key) {
  return isKey(key) && parseKey(key) === document.location.host;
}

function updateSpeedDisplay() {
  chrome.storage.sync.get(PLAYBACKRATE, function(values) {
    document.getElementById("current-speed").innerText = values[PLAYBACKRATE].toString() + "x";
  });
}

function setSpeed(newSpeed) {
  var set = {};
  set[PLAYBACKRATE] = newSpeed;
  chrome.storage.sync.set(set, function() {
    updateSpeedDisplay();
  });
}

function addSpeed(val) {
  chrome.storage.sync.get(PLAYBACKRATE, function(values) {
    var newSpeed = values[PLAYBACKRATE] + val;
    if (newSpeed <= 0) {
      return;
    }
    setSpeed(newSpeed);
  });
}

function updateToggleButton() {
  var hostKey = makeKey(currentHost);
  chrome.storage.sync.get([ISWHITELIST, hostKey], function(values) {
    var state;
    if (values[hostKey] !== undefined) {
      state = values[hostKey];
    } else {
      state = !values[ISWHITELIST];
    }
    document.getElementById("toggle-state").innerText = TOGGLELANG[0 + !state];
    document.getElementById("toggle-host").innerText  = currentHost;
  });
}

function toggleEnabled() {
  var hostKey = makeKey(currentHost);
  chrome.storage.sync.get([ISWHITELIST, hostKey], function(values) {
    var state;
    if (values[hostKey] !== undefined) {
      state = values[hostKey];
    } else {
      state = !values[ISWHITELIST];
    }
    var set = {};
    set[hostKey] = !state;
    chrome.storage.sync.set(set, function() {
      updateToggleButton();
    });
  });
}

document.getElementById("minus-speed").onclick = () => addSpeed(-0.25);
document.getElementById("plus-speed").onclick  = () => addSpeed( 0.25);

document.getElementById("toggle-button").onclick = () => toggleEnabled();

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  currentHost = new window.URL(tabs[0].url).host;
  updateToggleButton();
});

updateSpeedDisplay();
