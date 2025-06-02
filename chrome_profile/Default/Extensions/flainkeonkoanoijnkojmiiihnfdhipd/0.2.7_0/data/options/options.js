var background = (function () {
  let tmp = {};
  chrome.runtime.onMessage.addListener(function (request) {
    for (let id in tmp) {
      if (tmp[id] && (typeof tmp[id] === "function")) {
        if (request.path === "background-to-options") {
          if (request.method === id) {
            tmp[id](request.data);
          }
        }
      }
    }
  });
  /*  */
  return {
    "receive": function (id, callback) {
      tmp[id] = callback;
    },
    "send": function (id, data) {
      chrome.runtime.sendMessage({
        "method": id, 
        "data": data,
        "path": "options-to-background"
      }, function () {
        return chrome.runtime.lastError;
      });
    }
  }
})();

var config = {
  "storage": {
    "global": {}
  },
  "store": function () {
    config.fill.table(config.storage.global);
    background.send("store", config.storage.global);
  },
  "add": {
    "item": function () {
      let input = document.getElementById("input-field");
      let ext = input.children[0].children[0];
      let description = input.children[1].children[0];
      /*  */
      for (let i = 0; i < config.storage.global.ext.length; i++) {
        if (config.storage.global.ext[i] === ext.value) {
          return;
        }
      }
      /*  */
      if (!ext.value) return;
      if (!description.value) return;
      config.storage.global.ext.push(ext.value);
      config.storage.global.state.push("active");
      config.storage.global.description.push(description.value);
      /*  */
      config.store();
    }
  },
  "fill": {
    "table": function (e) {
      let count = 1;
      let tbody = document.getElementById("ext-value-tbody");
      /*  */
      tbody.textContent = '';
      config.storage.global = e;
      /*  */
      for (let i = e.ext.length - 1; i >= 0; i--) {
        let ext = document.createElement("td");
        let close = document.createElement("td");
        let number = document.createElement("td");
        let toggle = document.createElement("td");
        let extItem = document.createElement("tr");
        let description = document.createElement("td");
        /*  */
        ext.setAttribute("type", "ext");
        close.setAttribute("type", "close");
        number.setAttribute("type", "number");
        toggle.setAttribute("type", "toggle");
        description.setAttribute("type", "description");
        /*  */
        close.textContent = "✕";
        number.textContent = count;
        ext.textContent = e.ext[i];
        toggle.textContent = e.state[i];
        toggle.setAttribute("state", e.state[i]);
        extItem.setAttribute("state", e.state[i]);
        description.textContent = e.description[i];
        /*  */
        extItem.appendChild(number);
        extItem.appendChild(ext);
        extItem.appendChild(description);
        extItem.appendChild(toggle);
        extItem.appendChild(close);
        tbody.appendChild(extItem);
        count++;
      }
      /*  */
      let support = document.getElementById("open-wpage");
      let size = document.getElementById("audio-max-size");
      let resolution = document.getElementById("show-resolution");
      let captured = document.getElementById("captured-list-use-url");
      /*  */
      size.value = e.maxAudioSize;
      support.checked = "openWPage" in e ? e.openWPage : true;
      resolution.checked = "showResolution" in e ? e.showResolution : false;
      captured.checked = "capturedListUseURL" in e ? e.capturedListUseURL : true;
    }
  },
  "load": function () {
    let field = document.getElementById("input-field");
    let support = document.getElementById("open-wpage");
    let add = document.getElementById("input-field-add");
    let size = document.getElementById("audio-max-size");
    let table = document.getElementById("ext-value-table");
    let resolution = document.getElementById("show-resolution");
    let captured = document.getElementById("captured-list-use-url");
    /*  */
    add.addEventListener("click", config.add.item);
    /*  */
    resolution.addEventListener("change", function (e) {
      config.storage.global.showResolution = e.target.checked;
      config.store();
    });
    /*  */
    support.addEventListener("change", function (e) {
      config.storage.global.openWPage = e.target.checked;
      config.store();
    });
    /*  */
    captured.addEventListener("change", function (e) {
      config.storage.global.capturedListUseURL = e.target.checked;
      config.store();
    });
    /*  */
    field.addEventListener("keypress", function (e) {
      if ((e.which || e.keyCode) === 13) {
        config.add.item();
      }
    });
    /*  */
    size.addEventListener("change", function (e) {
      let m = e.target.value;
      if (parseInt(m) > 0) {
        config.storage.global.maxAudioSize = m;
        config.store();
      } else e.target.value = '';
    });
    /*  */
    table.addEventListener("click", function (e) {
      let a = e.target.tagName.toLowerCase() === "td";
      let b = e.target.nodeName.toLowerCase() === "td";
      /*  */
      if (a || b) {
        let ext, description;
        let tr = e.target.parentNode;
        /*  */
        for (let i = 0; i < tr.children.length; i++) {
          let td = tr.children[i];
          let type = td.getAttribute("type");
          if (type == "ext") ext = tr.children[i].textContent;
          if (type == "description") description = tr.children[i].textContent;
        }
        /*  */
        if (e.target.getAttribute("type") === "close") {
          let index;
          if (config.storage.global.ext.length < 2) return;
          for (let i = 0; i < config.storage.global.ext.length; i++) {
            if (config.storage.global.ext[i] === ext) {
              index = i; 
              break;
            }
          }
          /*  */
          config.storage.global.ext.splice(index, 1);
          config.storage.global.state.splice(index, 1);
          config.storage.global.description.splice(index, 1);
        }
        /*  */
        if (e.target.getAttribute("type") === "toggle") {
          for (let k = 0; k < config.storage.global.state.length; k++) {
            let e = config.storage.global.ext[k];
            let s = config.storage.global.state[k];
            let d = config.storage.global.description[k];
            /*  */
            if (e === ext && d === description) {
              if (e.target.getAttribute("state") === "active") {
                e.target.setAttribute("state", "inactive");
                config.storage.global.state[k] = "inactive";
              } else {
                e.target.setAttribute("state", "active");
                config.storage.global.state[k] = "active";
              }
              /*  */
              break;
            }
          }
        }
        /*  */
        config.store();
      }
    });
    /*  */
    background.send("load");
    window.removeEventListener("load", config.load, false);
  }
};

background.receive("storage", config.fill.table);
window.addEventListener("load", config.load, false);
