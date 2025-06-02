var config = {};

config.welcome = {
  set lastupdate (val) {app.storage.write("lastupdate", val)},
  get lastupdate () {return app.storage.read("lastupdate") !== undefined ? app.storage.read("lastupdate") : 0}
};

config.metrics = {
  set ready (val) {app.storage.write("ready", val)},
  set modern (val) {app.storage.write("modern", val)},
  set playing (val) {app.storage.write("playing", val)},
  set notifications (val) {app.storage.write("notifications", val)},
  get ready () {return app.storage.read("ready") !== undefined ? app.storage.read("ready") : true},
  get modern () {return app.storage.read("modern") !== undefined ? app.storage.read("modern") : true},
  get playing () {return app.storage.read("playing") !== undefined ? app.storage.read("playing") : true},
  get notifications () {return app.storage.read("notifications") !== undefined ? app.storage.read("notifications") : true}
};
