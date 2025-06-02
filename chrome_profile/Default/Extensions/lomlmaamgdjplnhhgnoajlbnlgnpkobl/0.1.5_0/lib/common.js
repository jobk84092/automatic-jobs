var core = {
  "start": function () {
    core.load();
  },
  "install": function () {
    core.load();
  },
  "load": function () {
    /*  */
  },
  "update": {
    "metrics": function (e) {
      if (e) {
        config.metrics[e.id] = e.value;
        if (e.id === "modern") app.page.send("reset");
      }
    },
    "page": function (e) {
      app.page.send("storage", {
        "ready": config.metrics.ready,
        "modern": config.metrics.modern,
        "playing": config.metrics.playing
      }, (e ? e.tabId : null), (e ? e.frameId : null));
    },
    "options": function () {
      app.options.send("storage", {
        "ready": config.metrics.ready,
        "modern": config.metrics.modern,
        "playing": config.metrics.playing,
        "notifications": config.metrics.notifications
      });
    }
  },
  "action": {
    "storage": function (changes, namespace) {
      /*  */
    },
    "notifications": function (e) {
      if (e.count || e.top) {
        if (config.metrics.notifications) {
          app.notifications.create({
            "message": e.message,
            "title": "Video Popout"
          });
        }
      }
    },
    "button": function (tab) {
      if (tab) {
        app.tab.inject.js({
          "target": {
            "tabId": tab.id,
            "allFrames": true
          },
          "files": [
            "data/content_script/inject.js"
          ]
        }, app.error);
      }
    }
  }
};

app.button.on.clicked(core.action.button);

app.page.receive("load", core.update.page);
app.page.receive("notifications", core.action.notifications);

app.options.receive("load", core.update.options);
app.options.receive("store", core.update.metrics);
app.options.receive("support", function () {app.tab.open(app.homepage())});
app.options.receive("donation", function () {app.tab.open(app.homepage() + "?reason=support")});

app.on.startup(core.start);
app.on.installed(core.install);
app.on.storage(core.action.storage);
