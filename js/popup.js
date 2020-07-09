const TOGGLE_LANG = ["Disable", "Enable"];
const DEFAULT_NAME = "all sites";

var HR = null;
var currentHost = null;

function updateSpeedDisplay() {
  document.getElementById("current-speed").innerText = HR.playbackRate.toString() + "x";
}

function updateToggleButton() {
  document.getElementById("enabled-state").innerText = TOGGLE_LANG[0 + !HR.enabled];

  var host = HR.hasEnabled ? currentHost : DEFAULT_NAME;
  document.getElementById("enabled-host").innerText = host;
}

function checkDefaults(def) {
  if (!def.hasEnabled) {
    def.enabled = false;
  }
  if (!def.hasPlaybackRate) {
    def.playbackRate = 2;
  }
  if (!def.hasBlockUpdates) {
    def.blockUpdates = true;
  }
}

document.getElementById("minus-speed").onclick = () => HR.addSpeed(-0.25);
document.getElementById("plus-speed").onclick  = () => HR.addSpeed( 0.25);

document.getElementById("enabled-button").onclick = () => HR.toggleEnabled();

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  currentHost = new window.URL(tabs[0].url).host;
  HostRecord.fromHost(currentHost).then(function(hr) {
    HR = hr;
    checkDefaults(HR.fallback);
    HR.addCallback(function(key, changes) {
      console.log(key, changes);
      if ("enabled" in changes) {
        updateToggleButton();
      }
      if ("playbackRate" in changes) {
        updateSpeedDisplay();
      }
    });
    updateToggleButton();
    updateSpeedDisplay();
  });
});
