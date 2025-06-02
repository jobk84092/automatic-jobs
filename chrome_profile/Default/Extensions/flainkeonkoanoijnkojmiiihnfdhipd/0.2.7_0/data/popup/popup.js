var background = {
  "port": null,
  "message": {},
  "receive": function (id, callback) {
    if (id) {
      background.message[id] = callback;
    }
  },
  "send": function (id, data) {
    if (id) {
      chrome.runtime.sendMessage({
        "method": id,
        "data": data,
        "path": "popup-to-background"
      }, function () {
        return chrome.runtime.lastError;
      });
    }
  },
  "connect": function (port) {
    chrome.runtime.onMessage.addListener(background.listener); 
    /*  */
    if (port) {
      background.port = port;
      background.port.onMessage.addListener(background.listener);
      background.port.onDisconnect.addListener(function () {
        background.port = null;
      });
    }
  },
  "post": function (id, data) {
    if (id) {
      if (background.port) {
        background.port.postMessage({
          "method": id,
          "data": data,
          "path": "popup-to-background",
          "port": background.port.name
        });
      }
    }
  },
  "listener": function (e) {
    if (e) {
      for (let id in background.message) {
        if (background.message[id]) {
          if ((typeof background.message[id]) === "function") {
            if (e.path === "background-to-popup") {
              if (e.method === id) {
                background.message[id](e.data);
              }
            }
          }
        }
      }
    }
  }
};

var config = {
  "global": {
    "storage": {},
    "metadata": {},
    "message": {
      'a': "Audio Downloader Prime is disabled! To continue, please click on - ADP is Disabled - button in order to enable the addon.",
      'b': "No Audios to Download! To continue, please refresh the page or try other audios within the page. Please note: Audio Downloader Prime addon may not work properly on all websites."
    }
  },
  "load": function () {
    const theme = document.getElementById("theme");
    const joiner = document.getElementById("audio-joiner");
    const support = document.getElementById("open-support");
    const disable = document.getElementById("disable-addon");
    const donation = document.getElementById("make-donation");
    const clear = document.getElementById("clear-audio-list");
    const settings = document.getElementById("open-settings");
    const convert = document.getElementById("convert-to-mp3");
    /*  */
    joiner.addEventListener("click", function () {background.send("audio-joiner")});
    support.addEventListener("click", function () {background.send("open-support")});
    settings.addEventListener("click", function () {background.send("open-options")});
    donation.addEventListener("click", function () {background.send("make-donation")});
    convert.addEventListener("click", function () {background.send("convert-to-mp3")});
    disable.addEventListener("click", function () {background.send("disable-addon", config.global.storage)});
    /*  */
    clear.addEventListener("click", function () {
      if (config.global.storage) {
        background.send("clear-audio-list", config.global.storage);
      }
    });
    /*  */
    theme.addEventListener("click", function () {
      let attribute = document.documentElement.getAttribute("theme");
      attribute = attribute === "dark" ? "light" : "dark";
      /*  */
      document.documentElement.setAttribute("theme", attribute);
      background.send("theme", attribute);
    }, false);
    /*  */
    if (navigator.userAgent.indexOf("Edg") !== -1) {
      document.getElementById("explore").style.display = "none";
    }
    /*  */
    background.send("load");
    window.removeEventListener("load", config.load, false);
  },
  "render": function (obj) {
    config.global.metadata = obj.metadata;
    const disable = document.getElementById("disable-addon");
    const table = document.getElementById("audio-list-table");
    /*  */
    table.textContent = '';
    document.documentElement.setAttribute("theme", obj.theme !== undefined ? obj.theme : "light");
    /*  */
    if (obj.list && obj.list.length && obj.state === "active") {
      config.global.storage = obj;
      background.send("active", obj.list.length);
      /*  */
      const generatefilename = function (index, url, title, pagetitle, ext) {
        let match = '', filename1 = '', filename2 = '', filename3 = '';
        if (ext) {
          ext = ext.ext;
          if (ext) ext = ext.replace("_", ".");
        }
        /*  */
        match = /\=\"(.+)\"/.exec(title || '');
        if (match && match.length) filename1 = match[1];
        match = url.match(/([^\/]+)(?=\.\w+$)(\.\w+)+/);
        if (match && match.length) filename2 = match[0];
        filename3 = "ADP-captured-audio-" + index + (ext || ".mp3");
        /*  */
        if (pagetitle) return pagetitle + (ext || ".mp3");
        else return filename1 ? filename1 : (filename2 ? filename2 : filename3);
      };
      /*  */
      const truncate = function (str, len) {
        if (str.length <= len) return str;
        const frontChars = Math.ceil((len - 3) / 2), backChars = Math.floor((len - 3) / 2);
        return str.slice(0, frontChars) + "..." + str.slice(str.length - backChars);
      };
      /*  */
      const addline = function (table, i, index) {
        const addcolumn = function (tr, url, rule, title, filename, originalaudiosize) {
          const td = document.createElement("td");
          td.setAttribute("rule", rule);
          if (filename) {
            const a = document.createElement("a");
            a.setAttribute("href", url);
            a.setAttribute("download", filename);
            a.textContent = truncate(filename, 70);
            a.addEventListener("click", function (e) {
              if (e.preventDefault) e.preventDefault();
              background.send("download", {
                "url": url,
                "filename": filename,
                "ext": obj.list[i].ext || ".mp3"
              });
            });
            /*  */
            td.appendChild(a);
          } else td.textContent = url;
          /*  */
          if (rule === "copy") {
            td.addEventListener("click", function (e) {
              const a = e.target.parentNode.querySelector("a");
              window.prompt("Copy to clipboard: Ctrl C + Enter", a.getAttribute("href"));
            });
          }
          /*  */
          if (rule === "download") {
            td.addEventListener("click", function (e) {
              const a = e.target.parentNode.querySelector("a");
              if (a) a.click();
            });
          }
          /*  */
          if (rule === "delete") {
            td.addEventListener("click", function (e) {
              const tmp = e.target.parentNode.getAttribute("index");
              obj.list.splice(tmp, 1);
              background.send("popup-update", obj);
            });
          }
          /*  */
          if (rule === "resolution") {
            const tmp = config.global.metadata[title];
            document.getElementById("resolution").style.display = "table-cell";
            if (tmp) td.textContent = tmp.kbps ? (tmp.kbps + " Kbps") : tmp.duration;
            else {
              try {
                const audio = document.createElement("audio");
                const source = document.createElement("source");
                audio.setAttribute("preload", "metadata");
                source.setAttribute("type", "audio/mpeg");
                audio.onerror = function (e) {e.target.parentNode.textContent = "? Kbps"};
                source.onerror = function (e) {e.target.parentNode.parentNode.textContent = "? Kbps"};
                audio.addEventListener("loadedmetadata", function (e) {
                  const date = new Date(null);
                  /*  */
                  let duration = e.target.duration || 0;
                  date.setSeconds(duration);
                  duration = date.toISOString().slice(11, 19);
                  const size = parseInt(originalaudiosize || "0");
                  const kbit = size / 128; // convert bytes to kbit
                  const kbps = Math.ceil(Math.round(kbit / e.target.duration) / 16) * 16;
                  config.global.metadata[e.target.firstChild.src] = {"duration": duration, "kbps": kbps};
                  background.send("metadata", config.global.metadata);
                  e.target.firstChild.src = "about:blank";
                  e.target.parentNode.textContent = kbps ? (kbps + " Kbps") : duration;
                }, false);
                /*  */
                audio.appendChild(source);
                td.appendChild(audio);
                source.src = title;
              } catch (e) {
                td.textContent = "? Kbps";
              }
            }
          }
          /*  */
          td.setAttribute("title", title);
          tr.appendChild(td);
        };
        /*  */
        const filename = generatefilename(index, obj.list[i].url, obj.list[i].title || '', obj.list[i].pagetitle || '', obj.list[i].ext || '');
        filenames.push(filename);
        count++;
        /*  */
        const tr = document.createElement("tr");
        addcolumn(tr, index, "index", '');
        addcolumn(tr, obj.list[i].url, "url", obj.list[i].url, filename);
        if (obj.showResolution) addcolumn(tr, "————————————", "resolution", obj.list[i].url, '', obj.list[i].osize);
        addcolumn(tr, obj.list[i].size, "size", '');
        addcolumn(tr, "✂", "copy", "Copy the link to the clipboard");
        addcolumn(tr, "⭳", "download", "Click to download the audio");
        addcolumn(tr, "✕", "delete", "Click to delete the audio");
        tr.setAttribute("index", i);
        table.appendChild(tr);
      };
      /*  */
      let count = 1;
      const filenames = [];
      for (let i = obj.list.length - 1; i > -1; i--) addline(table, i, count);
      disable.textContent = "Disable ADP";
      disable.setAttribute("state", obj.state);
    } else {
      background.send("inactive");
      /*  */
      const p = document.createElement("p");
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      const logo = document.createElement("td");
      /*  */
      td.appendChild(p);
      tr.appendChild(logo);
      tr.appendChild(td);
      table.appendChild(tr);
      logo.setAttribute("class", "logo");
      disable.textContent = "Disable ADP";
      p.textContent = config.global.message.b;
      disable.setAttribute("state", obj.state);
      /*  */
      if (obj.state === "inactive") {
        p.textContent = config.global.message.a;
        disable.textContent = "ADP is Disabled";
      }
    }
  }
};

background.receive("storage", config.render);
background.connect(chrome.runtime.connect({"name": "popup"}));

window.addEventListener("load", config.load, false);
