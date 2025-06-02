var core = {
  "start": function () {
    core.load();
  },
  "install": function () {
    core.load();
  },
  "load": function () {
    core.update.addon();
  },
  "update": {
    "popup": function (e) {
      app.popup.send("storage", {
        "state": config.addon.state,
        "theme": config.addon.theme,
        "top": config.session.top.url,
        "metadata": config.session.global.metadata,
        "list": e ? e[config.session.top.url] : [],
        "showResolution": config.audio.show.resolution
      });
    },
    "options": function () {
      app.options.send("storage", {
        "ext": config.audio.ext,
        "state": config.audio.state,
        "openWPage": config.welcome.open,
        "downloadpath": config.download.path,
        "description": config.audio.description,
        "capturedListUseURL": config.audio.use.url,
        "maxAudioSize": config.url.get.audio.max.size,
        "showResolution": config.audio.show.resolution
      });
    },
    "addon": function () {
      app.tab.query.active(function (tab) {
        if (tab && tab.url) {
          config.session.top.url = config.audio.use.url ? tab.url : config.item.extract.domain(tab.url);
          /*  */
          const list = config.audio.list;
          const flag = list[config.session.top.url] && list[config.session.top.url].length;
          flag ? core.action.state("active", list[config.session.top.url].length) : core.action.state("inactive");
          /*  */
          core.update.popup(list);
        } else {
          core.action.state("inactive");
        }
      });
    }
  },
  "action": {
    "storage": function (changes, namespace) {
      /*  */
    },
    "load": function () {
      app.webrequest.on.headers.received.callback(core.action.webrequest);
      app.webrequest.on.headers.received.add({"urls": ["*://*/*"]});
    },
    "store": function (o) {
      config.audio.ext = o.ext;
      config.audio.state = o.state;
      config.welcome.open = o.openWPage;
      config.audio.description = o.description;
      config.url.get.audio.max.size = o.maxAudioSize;
      config.audio.use.url = "capturedListUseURL" in o ? o.capturedListUseURL : false;
      config.audio.show.resolution = "showResolution" in o ? o.showResolution : false;
    },
    "state": function (state, number) {
      const flag = config.addon.state === "active";
      if (flag) {
        app.button.icon(null, state);
        app.button.badge.text(null, state === "inactive" ? '' : number);
        app.button.title(null, state === "inactive" ? "No Audios Found!" : number + " Audio(s) Found!");
      } else {
        app.button.badge.text(null, '');
        app.button.icon(null, "inactive");
        app.button.title(null, "ADP is Disabled");
      }
    },
    "tab": {
      "activated": function (tab) {
        core.update.addon(tab);
      },
      "removed": function (tabId) {
        delete config.session.stack.top[tabId];
      },
      "updated": function (tab) {
        const tmp = config.session.stack.url;
        //
        if (tmp[tab.id] !== tab.url) {
          tmp[tab.id] = tab.url;
          config.session.stack.url = tmp;
          /*  */
          core.update.addon();
        }
      }
    },
    "popup": {
      "theme": function (e) {
        config.addon.theme = e;
      },
      "download": function (e) {
        app.downloads.start({
          "url": e.url, 
          "filename": e.filename.replace(/[^a-zA-Z0-9.() ]/g, '').trim().replace(/ /g, '-')
        });
      },
      "update": function (e) {
        const tmp = config.audio.list;
        tmp[config.session.top.url] = e.list;
        config.audio.list = tmp;
        core.update.popup(config.audio.list);
      },
      "clear": function () {
        const tmp = config.audio.list;
        tmp[config.session.top.url] = [];
        config.audio.list = tmp;
        core.update.popup(null);
      },
      "disable": function () {
        if (config.addon.state === "active") {
          config.addon.state = "inactive";
          core.update.popup(null);
          core.action.state(config.addon.state);
        } else {
          config.addon.state = "active";
          core.update.popup(config.audio.list);
          core.action.state(config.addon.state, 0);
        }
      }
    },
    "webrequest": function (info) {
      const url = info.url;
      const id = info.tabId;
      const context = info.type;
      const headers = info.responseHeaders;
      /*  */
      if (id > -1) {
        if (context === "main_frame") {
          const tmp = config.session.stack.top;
          tmp[id] = url;
          config.session.stack.top = tmp;
        }
        /*  */
        if (config.addon.state === "active") {
          if (config.download.permission(config.session.stack.top[id], url)) {
            const flag = {};
            const requesttype = context || '';
            const tag = config.item.query.header(headers, "x-dm-tg");
            const time = config.item.query.header(headers, "x-timestamp");
            const type = config.item.query.header(headers, "content-type");
            const size = config.item.query.header(headers, "content-length");
            const title = config.item.query.header(headers, "content-disposition");
            /*  */
            const current = config.url.get.audio.ext(url, type);
            if (current.state === "inactive") return; /* return, if the state is inactive */
            /*  */
            flag.a = current.ext;
            flag.b = tag.indexOf("audio") !== -1;
            flag.c = type.indexOf("audio") !== -1;
            flag.d = requesttype.indexOf("audio") !== -1;
            /*  */
            if (flag.a || flag.b || flag.c || flag.d) {
              if (!size || parseInt(size) > config.url.get.audio.max.size) {
                const originalsize = size || '0';
                const duration = config.url.get.audio.duration(time);
                const audiosize = config.url.get.audio.size(parseInt(originalsize)) || '?';
                /*  */
                if (config.item.is.valid(config.session.stack.top[id], url, audiosize)) {
                  app.tab.get(id, function (tab) {
                    const tabtitle = (tab.title && tab.title.indexOf("://") === -1 && tab.title.indexOf("www.") === -1) ? tab.title : '';
                    //
                    config.item.add(config.session.stack.top[id], {
                      "url": url,
                      "title": title,
                      "size": audiosize,
                      "ext": current.ext,
                      "duration": duration,
                      "osize": originalsize,
                      "pagetitle": tabtitle,
                    });
                    /*  */
                    setTimeout(core.update.addon, 0);
                  });
                }
              }
            }
          }
        }
      }
    }
  }
};

app.storage.load(core.action.load);

app.tab.on.removed(core.action.tab.removed);
app.tab.on.updated(core.action.tab.updated);
app.tab.on.activated(core.action.tab.activated);

app.options.receive("store", core.action.store);
app.options.receive("load", core.update.options);

app.popup.receive("theme", core.action.popup.theme);
app.popup.receive("download", core.action.popup.download);
app.popup.receive("popup-update", core.action.popup.update);
app.popup.receive("disable-addon", core.action.popup.disable);
app.popup.receive("clear-audio-list", core.action.popup.clear);
app.popup.receive("open-options", function () {app.tab.options()});
app.popup.receive("active", function (e) {core.action.state("active", e)});
app.popup.receive("inactive", function () {core.action.state("inactive")});
app.popup.receive("load", function () {core.update.popup(config.audio.list)});
app.popup.receive("open-support", function () {app.tab.open(app.homepage())});
app.popup.receive("metadata", function (e) {config.session.global.metadata = e});
app.popup.receive("audio-joiner", function () {app.tab.open(config.page["audio-joiner"])});
app.popup.receive("convert-to-mp3", function () {app.tab.open(config.page["convert-to-mp3"])});
app.popup.receive("make-donation", function () {app.tab.open(app.homepage() + "?reason=support")});

app.on.startup(core.start);
app.on.installed(core.install);
app.on.storage(core.action.storage);
