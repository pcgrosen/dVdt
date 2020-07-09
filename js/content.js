let HR = null;
let originalSpeeds = new Map();

function setSpeed(elms) {
  if (HR === null || !HR.enabled) {
    return;
  }
  if (!Array.isArray(elms)) {
    elms = [elms];
  }
  for (let elm of elms) {
    elm.playbackRate = HR.playbackRate;
  }
}

function registerElement(elms) {
  if (!Array.isArray(elms)) {
    elms = [elms];
  }
  for (let elm of elms) {
    originalSpeeds.set(elm, elm.playbackRate);
    elm.addEventListener("ratechange", function() {
      if (elm.playbackRate !== HR.playbackRate) {
        originalSpeeds.set(elm, elm.playbackRate);
      }
      if (HR === null || !HR.enabled || !HR.blockUpdates) {
        return;
      }
      if (elm.playbackRate !== HR.playbackRate) {
        elm.playbackRate = HR.playbackRate;
      }
    });
  }
}

function updateSpeeds() {
  if (HR === null || !HR.enabled) {
    return;
  }
  setSpeed(Array.from(document.getElementsByTagName("video")));
}

let obs = new window.MutationObserver(function(mutations, observer) {
  for (let i = 0; i < mutations.length; i++) {
    for (let j = 0; j < mutations[i].addedNodes.length; j++) {
      let found = [];
      if (mutations[i].addedNodes[j].nodeName === "VIDEO") {
        found.push(mutations[i].addedNodes[j]);
      } else {
        let elms = mutations[i].addedNodes[j].getElementsByTagName("video");
        found.push(...Array.from(elms));
      }
      found.forEach(function(elm) {
        registerElement(elm);
        if (!(HR === null || !HR.enabled)) {
          setSpeed(elm);
        }
      });
    }
  }
});

obs.observe(document.body, {
  subtree: true,
  childList: true
});

HostRecord.fromHost(document.location.host).then(function(hr) {
  HR = hr;
  HR.addCallback(function(key, changes) {
    if (HR.enabled) {
      updateSpeeds();
    } else if ("enabled" in changes) {
      originalSpeeds.forEach((v, k) => k.playbackRate = v);
    }
  });
  registerElement(Array.from(document.getElementsByTagName("video")));
  updateSpeeds();
});
