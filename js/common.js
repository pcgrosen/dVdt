const PREFIX = "host!";
const DEFAULT_KEY = "default";
const LOWER_BOUND =  0;
const UPPER_BOUND = 10;

let recordCache = new Map();

function isValid(v) {
  return v !== null && v !== undefined;
}

class HostRecord {
  constructor(key, json, fallback) {
    this.callbacks = [];
    this.key = key;
    this.updateFromJSON(json);
    this.fallback = fallback;
    if (isValid(this.fallback)) {
      this.fallback.addCallback((function(key, changes) {
        let res = {};
        for (let change in changes) {
          if (!isValid(this["_" + change])) {
            res[change] = changes[change];
          }
        }
        if (Object.keys(res).length) {
          this.runCallbacks(res);
        }
      }).bind(this));
    }
    chrome.storage.onChanged.addListener((function(changes, namespace) {
      for (let key in changes) {
        if (key == this.key) {
          this.updateFromJSON(changes[key].newValue);
        }
      }
    }).bind(this));
  }

  updateFromJSON(json) {
    let obj;
    try {
      obj = JSON.parse(json);
    } catch (e) {
      obj = {};
    }
    let res = {};
    let checkAndUpdate = (function(name) {
      if (this["_" + name] !== obj[name]) {
        res[name] = obj[name];
      }
      this["_" + name] = obj[name];
    }).bind(this);

    checkAndUpdate("enabled");
    checkAndUpdate("playbackRate");
    checkAndUpdate("blockUpdates");

    if (Object.keys(res).length) {
      this.runCallbacks(res);
    }
  }

  runCallbacks(changes) {
    this.callbacks.forEach((callback) => callback(this.key, changes));
  }

  toJSON() {
    return JSON.stringify({enabled: this._enabled,
                           playbackRate: this._playbackRate,
                           blockUpdates: this._blockUpdates});
  }

  sync() {
    let updates = {};
    updates[this.key] = this.toJSON();
    chrome.storage.sync.set(updates);
  }

  addCallback(callback) {
    this.callbacks.push(callback);
  }

  // enabled

  get enabled() {
    return this.hasEnabled ? this._enabled : this.fallback.enabled;
  }

  get hasEnabled() {
    return isValid(this._enabled);
  }

  set enabled(value) {
    this._enabled = value;
    this.runCallbacks({enabled: value});
    this.sync();
  }

  toggleEnabled() {
    if (this.hasEnabled) {
      this.enabled = !this.enabled;
    } else {
      this.fallback.enabled = !this.enabled;
    }
  }

  // playbackRate

  get playbackRate() {
    return this.hasPlaybackRate ? this._playbackRate : this.fallback.playbackRate;
  }

  get hasPlaybackRate() {
    return isValid(this._playbackRate);
  }

  set playbackRate(value) {
    this._playbackRate = value;
    this.runCallbacks({playbackRate: value});
    this.sync();
  }

  addSpeed(a) {
    let newSpeed = a + this.playbackRate;
    if (newSpeed < LOWER_BOUND) {
      newSpeed = LOWER_BOUND;
    }
    if (newSpeed > UPPER_BOUND) {
      newSpeed = UPPER_BOUND;
    }
    if (this.hasPlaybackRate) {
      this.playbackRate = newSpeed;
    } else {
      this.fallback.playbackRate = newSpeed;
    }
  }

  // blockUpdates

  get blockUpdates() {
    return this.hasBlockUpdates ? this._blockUpdates : this.fallback.blockUpdates;
  }

  get hasBlockUpdates() {
    return isValid(this._blockUpdates);
  }

  set blockUpdates(value) {
    this._blockUpdates = value;
    this.runCallbacks({blockUpdates: value});
    this.sync();
  }

  // Statics

  static makeKey(host) {
    return PREFIX + host;
  }

  static fromKey(key, fallback) {
    if (recordCache.has(key)) {
      return recordCache.get(key);
    }
    return new Promise(function(resolve) {
      chrome.storage.sync.get([key], function(values) {
        let hr = new HostRecord(key, values[key], fallback);
        recordCache.set(key, hr);
        resolve(hr);
      });
    });
  }

  static async fromHost(host) {
    let def = await HostRecord.fromKey(DEFAULT_KEY, null);
    return await HostRecord.fromKey(HostRecord.makeKey(host), def);
  }
}
