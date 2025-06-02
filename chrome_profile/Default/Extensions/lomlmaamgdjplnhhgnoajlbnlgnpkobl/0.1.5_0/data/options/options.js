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
  "render": function (data) {
    for (let id in data) {
      const target = document.getElementById(id);
      if (target) {
        target.checked = data[id];
      }
    }
  },
  "handle": {
    "checkbox": function (e) {
      const value = e.target.checked;
      const id = e.target.getAttribute("id");
      /*  */
      background.send("store", {
        "id": id, 
        "value": value
      });
    }
  },
  "load": function () {
    const reload = document.getElementById("reload");
    const support = document.getElementById("support");
    const donation = document.getElementById("donation");
    const checkbox = [...document.querySelectorAll("input[type='checkbox']")];
    /*  */
    checkbox.map(e => e.addEventListener("change", config.handle.checkbox));
    reload.addEventListener("click", function () {document.location.reload()}, false);
    support.addEventListener("click", function () {background.send("support")}, false);
    donation.addEventListener("click", function () {background.send("donation")}, false);
    /*  */
    background.send("load");
    window.removeEventListener("load", config.load, false);
  }
};

background.receive("storage", config.render);
window.addEventListener("load", config.load, false);
