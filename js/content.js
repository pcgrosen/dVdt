let PREFIX = "enabled!";
let ISWHITELIST = "isWhitelist";
let PLAYBACKRATE = "playbackRate";
let TRIGGERS = [ISWHITELIST, PLAYBACKRATE];

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

function setSpeed(elms) {
  if (!Array.isArray(elms)) {
    elms = [elms];
  }
  var hostKey = makeKey(document.location.host);
  chrome.storage.sync.get([ISWHITELIST, hostKey, PLAYBACKRATE], function (values) {
    var state;
    if (values[hostKey] !== undefined) {
      state = values[hostKey];
    } else {
      state = !values[ISWHITELIST];
    }
    var rate = state ? values[PLAYBACKRATE] || 1 : 1;
    for (var i in elms) {
      var elm = elms[i];
      elm.playbackRate = rate;
    }
  });
}

function updateSpeeds() {
  setSpeed(Array.from(document.getElementsByTagName("video")));
}


var obs = new window.MutationObserver(function(mutations, observer) {
  for (var i = 0; i < mutations.length; i++) {
    for (var j = 0; j < mutations[i].addedNodes.length; j++) {
      if (mutations[i].addedNodes[j].nodeName === "VIDEO") {
        setSpeed(mutations[i].addedNodes[j]);
      }
    }
  }
});

obs.observe(document.body, {
  childList: true
});


chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (var key in changes) {
    if (TRIGGERS.indexOf(key) !== -1 || isHostKey(key)) {
      updateSpeeds();
    }
  }
});

updateSpeeds();
