if (!background) {
  var background = (function () {
    let tmp = {};
    /*  */
    chrome.runtime.onMessage.addListener(function (request) {
      for (let id in tmp) {
        if (tmp[id] && (typeof tmp[id] === "function")) {
          if (request.path === "background-to-page") {
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
          "path": "page-to-background"
        }, function () {
          return chrome.runtime.lastError;
        });
      }
    }
  })();
  /*  */
  var config = {
    "videos": [],
    "pipwindow": null, 
    "reset": function () {
      config.pipwindow = null;
    },
    "notifications": function (timeout, message) {
      window.setTimeout(function () {
        background.send("notifications", {
          "message": message,
          "top": window === window.top,
          "count": config.videos.length
        });
      }, timeout);
    },
    "render": async function (e) {
      if (e) {
        if (!e.modern) {
          if (config.pipwindow) {
            if ("close" in config.pipwindow) {
              config.pipwindow.close();
              delete config.pipwindow;
              return;
            }
          }
        }
        /*  */
        config.videos = [...document.querySelectorAll("video")];
        /*  */
        if (config.videos && config.videos.length) {
          for (let i = 0; i < config.videos.length; i++) {
            const video = config.videos[i];
            if (video) {
              if (video.offsetHeight) {
                const cond_1 = e.ready ? video.readyState === 4 : true;
                const cond_2 = e.playing ? video.paused === false : true;
                /*  */
                if (cond_1) {
                  if (cond_2) {
                    if (e.modern) {
                      if (video.requestPictureInPicture) {
                        if (!config.pipwindow || (!config.pipwindow.width && !config.pipwindow.height)) {
                          try {
                            config.pipwindow = await video.requestPictureInPicture();
                            config.notifications(300, "Video popout is active!");
                          } catch (e) {
                            config.notifications(300, "Video popout encountered an error! Please wait or re-load the page and try again.");
                          }
                        } else {
                          config.notifications(300, "The popout is already open! Please close the popout and try again!");
                        }
                      } else {
                        config.notifications(300, "Video popout is not supported in your browser!");
                      }
                    } else {
                      if (window.documentPictureInPicture) {
                        if (window.documentPictureInPicture.requestWindow) {
                          if (!config.pipwindow || ("closed" in config.pipwindow ? config.pipwindow.closed : true)) {
                            const width = video.clientWidth;
                            const height = video.clientHeight;
                            const stylesheets = [...document.styleSheets];
                            const inlinestyle = video.getAttribute("style");
                            const player = video.closest("ytd-player") || video;
                            const options = {"width": width, "height": height};
                            const container = player.parentNode;
                            /*  */
                            video.setAttribute("style", "width: 100vw; height: auto;");
                            try {
                              config.pipwindow = await window.documentPictureInPicture.requestWindow(options);
                              config.notifications(300, "Video popout is active!");
                            } catch (e) {
                              config.notifications(300, "Video popout encountered an error! Please wait or re-load the page and try again.");
                            }
                            /*  */
                            if (config.pipwindow) {
                              config.pipwindow.addEventListener("pagehide", function (e) {
                                if (e) {
                                  if (e.target) {
                                    const video = e.target.querySelector("video");
                                    const player = e.target.querySelector("ytd-player") || video;
                                    /*  */
                                    if (video) {
                                      video.setAttribute("style", inlinestyle);
                                    }
                                    /*  */
                                    if (player) {
                                      container.append(player);
                                      if (config.pipwindow) {
                                        if ("close" in config.pipwindow) {
                                          config.pipwindow.close();
                                          delete config.pipwindow;
                                        }
                                      }
                                    }
                                  }
                                }
                              });
                              /*  */
                              stylesheets.forEach(sheet => {
                                try {
                                  const style = document.createElement("style");
                                  const cssrules = [...sheet.cssRules].map((rule) => rule.cssText).join('');
                                  /*  */
                                  style.textContent = cssrules;
                                  config.pipwindow.document.head.appendChild(style);
                                } catch (e) {
                                  const link = document.createElement("link");
                                  /*  */
                                  link.type = sheet.type;
                                  link.href = sheet.href;
                                  link.rel = "stylesheet";
                                  link.media = sheet.media;
                                  config.pipwindow.document.head.appendChild(link);
                                }
                              });
                              /*  */
                              config.pipwindow.document.body.style.overflow = "hidden";
                              config.pipwindow.document.body.style.backgroundColor = "#000000";
                              config.pipwindow.document.documentElement.style.overflow = "hidden";
                              config.pipwindow.document.body.append(player);
                            }
                          } else {
                            if ("close" in config.pipwindow) {
                              config.pipwindow.close();
                              delete config.pipwindow;
                            } else {
                              config.notifications(300, "The popout is already open! Please close the popout and try again!");
                            }
                          }
                        } else {
                          config.notifications(300, "Video popout is not supported in your browser!");
                        }
                      } else {
                        config.notifications(300, "Video popout is not supported in your browser!");
                      }
                    }
                  } else {
                    config.notifications(300, "The video is paused! Please play the video and try again.");
                  }
                } else {
                  config.notifications(300, "The video is not loaded yet! Please wait or reload the page and try again.");
                }
                /*  */
                break;
              }
            }
          }
        } else {
          if (config.pipwindow) {
            if ("close" in config.pipwindow) {
              config.pipwindow.close();
              delete config.pipwindow;
            } else {
              config.notifications(300, "The popout is already open! Please close the popout and try again!");
            }
          } else {
            config.notifications(0, "No video found!");
          }
        }
      }
    }
  };
}

background.send("load");
background.receive("reset", config.reset);
background.receive("storage", config.render);
