function runOnCurrent(callback) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    let currentHost = new window.URL(tabs[0].url).host;
    HostRecord.fromHost(currentHost).then(function(hr) {
      callback(hr);
    });
  });
}

chrome.commands.onCommand.addListener(function(command) {
  function setSpeed(s) {
    return function(hr) {
      if (hr.hasPlaybackRate) {
        hr.playbackRate = s;
      } else {
        hr.fallback.playbackRate = s;
      }
    };
  }
  switch (command) {
  case "toggle-enabled":
    runOnCurrent(hr => hr.toggleEnabled());
    break;
  case "preset-1":
    runOnCurrent(setSpeed(1));
    break;
  case "preset-2":
    runOnCurrent(setSpeed(2));
    break;
  case "preset-3":
    runOnCurrent(setSpeed(3));
    break;
  case "increment-speed":
    runOnCurrent(hr => hr.addSpeed(0.25));
    break;
  case "decrement-speed":
    runOnCurrent(hr => hr.addSpeed(-0.25));
    break;
  }
});
