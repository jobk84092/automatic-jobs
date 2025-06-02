const handleContextMenuClickCallback = async (evt, tabs) => {
  return new Promise((resolve, reject) => {
    // chrome.tabs.getCurrent((tab) => resolve(tab));
    handleContextMenuClick(evt, tabs, (obj) => resolve(obj));
  });
};

const handleContextMenuClick = (evt, tabs, callback = null) => {
  let evtClick = {
    winId: tabs.windowId,
    tabId: tabs.id,
    // spkIsMuted: tabs.mutedInfo.muted,
    url: evt.pageUrl,
    menuItemId: evt.menuItemId,
  };

  (async () => {
    let list = [];

    let rooms = await chromeAllOpenRooms();
    rooms = filterExtensionRooms(rooms);
    rooms = sortRoomsTabOrder(rooms);

    for (let i = 0; i < rooms.length; i++) {
      const el = rooms[i];
      el.commands = "";
      el.commands.boolSpk = false;
      el.commands.boolMic = false;
      el.commands.boolVid = false;
      el.commands.boolFrzt = false;
      el.commands.boolFrz0 = false;
    }

    switch (evtClick.menuItemId) {
      case "this111":
        rooms.forEach((el) => {
          if (evtClick.tabId == el.id) {
            el.commands = {
              muteSpk: false,
              muteMic: false,
              muteVid: false,
              boolSpk: true,
              boolMic: true,
              boolVid: true,
            };
          } else {
            el.commands = {
              muteSpk: true,
              muteMic: true,
              muteVid: true,
              boolSpk: true,
              boolMic: true,
              boolVid: true,
            };
          }
        });
        break;
      case "this110":
        rooms.forEach((el) => {
          if (evtClick.tabId == el.id) {
            el.commands = {
              muteSpk: false,
              muteMic: false,
              muteVid: true,
              boolSpk: true,
              boolMic: true,
              boolVid: true,
            };
          } else {
            el.commands = {
              muteSpk: true,
              muteMic: true,
              muteVid: true,
              boolSpk: true,
              boolMic: true,
              boolVid: true,
            };
          }
        });
        break;
      case "this101":
        rooms.forEach((el) => {
          if (evtClick.tabId == el.id) {
            el.commands = {
              muteSpk: false,
              muteMic: true,
              muteVid: false,
              boolSpk: true,
              boolMic: true,
              boolVid: true,
            };
          } else {
            el.commands = {
              muteSpk: true,
              muteMic: true,
              muteVid: true,
              boolSpk: true,
              boolMic: true,
              boolVid: true,
            };
          }
        });
        break;
      case "this100":
        rooms.forEach((el) => {
          if (evtClick.tabId == el.id) {
            el.commands = {
              muteSpk: false,
              muteMic: true,
              muteVid: true,
              boolSpk: true,
              boolMic: true,
              boolVid: true,
            };
          } else {
            el.commands = {
              muteSpk: true,
              muteMic: true,
              muteVid: true,
              boolSpk: true,
              boolMic: true,
              boolVid: true,
            };
          }
        });
        break;
      case "this011":
        rooms.forEach((el) => {
          if (evtClick.tabId == el.id) {
            el.commands = {
              muteSpk: true,
              muteMic: false,
              muteVid: false,
              boolSpk: true,
              boolMic: true,
              boolVid: true,
            };
          } else {
            el.commands = {
              muteSpk: true,
              muteMic: true,
              muteVid: true,
              boolSpk: true,
              boolMic: true,
              boolVid: true,
            };
          }
        });
        break;
      case "this010":
        rooms.forEach((el) => {
          if (evtClick.tabId == el.id) {
            el.commands = {
              muteSpk: true,
              muteMic: false,
              muteVid: true,
              boolSpk: true,
              boolMic: true,
              boolVid: true,
            };
          } else {
            el.commands = {
              muteSpk: true,
              muteMic: true,
              muteVid: true,
              boolSpk: true,
              boolMic: true,
              boolVid: true,
            };
          }
        });
        break;
      case "this001":
        rooms.forEach((el) => {
          if (evtClick.tabId == el.id) {
            el.commands = {
              muteSpk: true,
              muteMic: true,
              muteVid: false,
              boolSpk: true,
              boolMic: true,
              boolVid: true,
            };
          } else {
            el.commands = {
              muteSpk: true,
              muteMic: true,
              muteVid: true,
              boolSpk: true,
              boolMic: true,
              boolVid: true,
            };
          }
        });
        break;
      case "this000":
        rooms.forEach((el) => {
          if (evtClick.tabId == el.id) {
            el.commands = {
              muteSpk: true,
              muteMic: true,
              muteVid: true,
              boolSpk: true,
              boolMic: true,
              boolVid: true,
            };
          } else {
            el.commands = {
              muteSpk: true,
              muteMic: true,
              muteVid: true,
              boolSpk: true,
              boolMic: true,
              boolVid: true,
            };
          }
        });
        break;

      case "that111":
        rooms.forEach((el) => {
          if (evtClick.tabId == el.id) {
            el.commands = {
              boolSpk: false,
              boolMic: false,
              boolVid: false,
            };
          } else {
            el.commands = {
              muteSpk: false,
              muteMic: false,
              muteVid: false,
              boolSpk: true,
              boolMic: true,
              boolVid: true,
            };
          }
        });
        break;
      case "that110":
        rooms.forEach((el) => {
          if (evtClick.tabId == el.id) {
            el.commands = {
              boolSpk: false,
              boolMic: false,
              boolVid: false,
            };
          } else {
            el.commands = {
              muteSpk: false,
              muteMic: false,
              muteVid: true,
              boolSpk: true,
              boolMic: true,
              boolVid: true,
            };
          }
        });
        break;
      case "that101":
        rooms.forEach((el) => {
          if (evtClick.tabId == el.id) {
            el.commands = {
              boolSpk: false,
              boolMic: false,
              boolVid: false,
            };
          } else {
            el.commands = {
              muteSpk: false,
              muteMic: true,
              muteVid: false,
              boolSpk: true,
              boolMic: true,
              boolVid: true,
            };
          }
        });
        break;
      case "that100":
        rooms.forEach((el) => {
          if (evtClick.tabId == el.id) {
            el.commands = {
              boolSpk: false,
              boolMic: false,
              boolVid: false,
            };
          } else {
            el.commands = {
              muteSpk: false,
              muteMic: true,
              muteVid: true,
              boolSpk: true,
              boolMic: true,
              boolVid: true,
            };
          }
        });
        break;
      case "that011":
        rooms.forEach((el) => {
          if (evtClick.tabId == el.id) {
            el.commands = {
              boolSpk: false,
              boolMic: false,
              boolVid: false,
            };
          } else {
            el.commands = {
              muteSpk: true,
              muteMic: false,
              muteVid: false,
              boolSpk: true,
              boolMic: true,
              boolVid: true,
            };
          }
        });
        break;
      case "that010":
        rooms.forEach((el) => {
          if (evtClick.tabId == el.id) {
            el.commands = {
              boolSpk: false,
              boolMic: false,
              boolVid: false,
            };
          } else {
            el.commands = {
              muteSpk: true,
              muteMic: false,
              muteVid: true,
              boolSpk: true,
              boolMic: true,
              boolVid: true,
            };
          }
        });
        break;
      case "that001":
        rooms.forEach((el) => {
          if (evtClick.tabId == el.id) {
            el.commands = {
              boolSpk: false,
              boolMic: false,
              boolVid: false,
            };
          } else {
            el.commands = {
              muteSpk: true,
              muteMic: true,
              muteVid: false,
              boolSpk: true,
              boolMic: true,
              boolVid: true,
            };
          }
        });
        break;
      case "that000":
        rooms.forEach((el) => {
          if (evtClick.tabId == el.id) {
            el.commands = {
              boolSpk: false,
              boolMic: false,
              boolVid: false,
            };
          } else {
            el.commands = {
              muteSpk: true,
              muteMic: true,
              muteVid: true,
              boolSpk: true,
              boolMic: true,
              boolVid: true,
            };
          }
        });
        break;

      case "r111":
        rooms.forEach((el) => {
          if (evtClick.tabId == el.id) {
            el.commands = {
              muteSpk: false,
              muteMic: false,
              muteVid: false,
              boolSpk: true,
              boolMic: true,
              boolVid: true,
            };
          } else {
            el.commands = {
              muteSpk: true,
              muteMic: true,
              muteVid: true,
              boolSpk: true,
              boolMic: true,
              boolVid: true,
            };
          }
        });
        break;
      case "r110":
        rooms.forEach((el) => {
          if (evtClick.tabId == el.id) {
            el.commands = {
              muteSpk: false,
              muteMic: false,
              muteVid: true,
              boolSpk: true,
              boolMic: true,
              boolVid: true,
            };
          } else {
            el.commands = {
              muteMic: true,
              muteVid: true,
              muteSpk: true,
              boolSpk: true,
              boolMic: true,
              boolVid: true,
            };
          }
        });
        break;
      case "r101":
        rooms.forEach((el) => {
          if (evtClick.tabId == el.id) {
            el.commands = {
              muteSpk: false,
              muteMic: true,
              muteVid: false,
              boolSpk: true,
              boolMic: true,
              boolVid: true,
            };
          } else {
            el.commands = {
              muteSpk: true,
              muteMic: true,
              muteVid: true,
              boolSpk: true,
              boolMic: true,
              boolVid: true,
            };
          }
        });
        break;
      case "r100":
        rooms.forEach((el) => {
          if (evtClick.tabId == el.id) {
            el.commands = {
              muteSpk: false,
              muteMic: true,
              muteVid: true,
              boolSpk: true,
              boolMic: true,
              boolVid: true,
            };
          } else {
            el.commands = {
              muteSpk: true,
              muteMic: true,
              muteVid: true,
              boolSpk: true,
              boolMic: true,
              boolVid: true,
            };
          }
        });
        break;
      case "r000":
        rooms.forEach((el) => {
          if (evtClick.tabId == el.id) {
            el.commands = {
              muteSpk: true,
              muteMic: true,
              muteVid: true,
              boolSpk: true,
              boolMic: true,
              boolVid: true,
            };
          } else {
            el.commands = {
              // muteSpk: true,
              // muteMic: true,
              // muteVid: true,
              boolSpk: false,
              boolMic: false,
              boolVid: false,
            };
          }
        });
        break;
      case "r1__":
        rooms.forEach((el) => {
          if (evtClick.tabId == el.id) {
            el.commands = {
              muteSpk: false,
              boolSpk: true,
              boolMic: false,
              boolVid: false,
            };
          } else {
            el.commands = {
              boolSpk: false,
              boolMic: false,
              boolVid: false,
            };
          }
        });
        break;
      case "r0__":
        rooms.forEach((el) => {
          if (evtClick.tabId == el.id) {
            el.commands = {
              muteSpk: true,
              boolSpk: true,
              boolMic: false,
              boolVid: false,
            };
          } else {
            el.commands = {
              boolSpk: false,
              boolMic: false,
              boolVid: false,
            };
          }
        });
        break;
      case "r_1_":
        rooms.forEach((el) => {
          if (evtClick.tabId == el.id) {
            el.commands = {
              muteMic: false,
              boolSpk: false,
              boolMic: true,
              boolVid: false,
            };
          } else {
            el.commands = {
              boolSpk: false,
              boolMic: false,
              boolVid: false,
            };
          }
        });
        break;
      case "r_0_":
        rooms.forEach((el) => {
          if (evtClick.tabId == el.id) {
            el.commands = {
              muteMic: true,
              boolSpk: false,
              boolMic: true,
              boolVid: false,
            };
          } else {
            el.commands = {
              boolSpk: false,
              boolMic: false,
              boolVid: false,
            };
          }
        });
        break;
      case "r__1":
        rooms.forEach((el) => {
          if (evtClick.tabId == el.id) {
            el.commands = {
              muteVid: false,
              boolSpk: false,
              boolMic: false,
              boolVid: true,
            };
          } else {
            el.commands = {
              boolSpk: false,
              boolMic: false,
              boolVid: false,
            };
          }
        });
        break;
      case "r__0":
        rooms.forEach((el) => {
          if (evtClick.tabId == el.id) {
            el.commands = {
              muteVid: true,
              boolSpk: false,
              boolMic: false,
              boolVid: true,
            };
          } else {
            el.commands = {
              boolSpk: false,
              boolMic: false,
              boolVid: false,
            };
          }
        });
        break;
      case "g1__":
        rooms.forEach((el) => {
          el.commands = {
            muteSpk: false,
            boolSpk: true,
            boolMic: false,
            boolVid: false,
          };
        });
        break;
      case "g0__":
        rooms.forEach((el) => {
          el.commands = {
            muteSpk: true,
            boolSpk: true,
            boolMic: false,
            boolVid: false,
          };
        });
        break;
      case "x1__":
        rooms.forEach((el) => {
          if (evtClick.tabId == el.id) {
            el.commands = {
              boolSpk: false,
              boolMic: false,
              boolVid: false,
            };
          } else {
            el.commands = {
              muteSpk: false,
              boolSpk: true,
              boolMic: false,
              boolVid: false,
            };
          }
        });
        break;
      case "x0__":
        rooms.forEach((el) => {
          if (evtClick.tabId == el.id) {
            el.commands = {
              boolSpk: false,
              boolMic: false,
              boolVid: false,
            };
          } else {
            el.commands = {
              muteSpk: true,
              boolSpk: true,
              boolMic: false,
              boolVid: false,
            };
          }
        });
        break;
      case "x_1_":
        rooms.forEach((el) => {
          if (evtClick.tabId == el.id) {
            el.commands = {
              boolSpk: false,
              boolMic: false,
              boolVid: false,
            };
          } else {
            el.commands = {
              muteMic: false,
              boolSpk: false,
              boolMic: true,
              boolVid: false,
            };
          }
        });
        break;
      case "x_0_":
        rooms.forEach((el) => {
          if (evtClick.tabId == el.id) {
            el.commands = {
              boolSpk: false,
              boolMic: false,
              boolVid: false,
            };
          } else {
            el.commands = {
              muteMic: true,
              boolSpk: false,
              boolMic: true,
              boolVid: false,
            };
          }
        });
        break;
      case "x__1":
        rooms.forEach((el) => {
          if (evtClick.tabId == el.id) {
            el.commands = {
              boolSpk: false,
              boolMic: false,
              boolVid: false,
            };
          } else {
            el.commands = {
              muteVid: false,
              boolSpk: false,
              boolMic: false,
              boolVid: true,
            };
          }
        });
        break;
      case "x__0":
        rooms.forEach((el) => {
          if (evtClick.tabId == el.id) {
            el.commands = {
              boolSpk: false,
              boolMic: false,
              boolVid: false,
            };
          } else {
            el.commands = {
              muteVid: true,
              boolSpk: false,
              boolMic: false,
              boolVid: true,
            };
          }
        });
        break;
      case "g1__":
        rooms.forEach((el) => {
          el.commands = {
            muteSpk: false,
            boolSpk: true,
            boolMic: false,
            boolVid: false,
          };
        });
        break;
      case "g0__":
        rooms.forEach((el) => {
          el.commands = {
            muteSpk: true,
            boolSpk: true,
            boolMic: false,
            boolVid: false,
          };
        });
        break;
      case "g01_":
        rooms.forEach((el) => {
          el.commands = {
            muteSpk: true,
            muteMic: false,
            boolSpk: true,
            boolMic: true,
            boolVid: false,
          };
        });
        break;
      case "g_1_":
        rooms.forEach((el) => {
          el.commands = {
            muteMic: false,
            boolSpk: false,
            boolMic: true,
            boolVid: false,
          };
        });
        break;
      case "g_0_":
        rooms.forEach((el) => {
          el.commands = {
            muteMic: true,
            boolSpk: false,
            boolMic: true,
            boolVid: false,
          };
        });
        break;
      case "g__1":
        rooms.forEach((el) => {
          el.commands = {
            muteVid: false,
            boolSpk: false,
            boolMic: false,
            boolVid: true,
          };
        });
        break;
      case "g__0":
        rooms.forEach((el) => {
          el.commands = {
            muteVid: true,
            boolSpk: false,
            boolMic: false,
            boolVid: true,
          };
        });
        break;
      case "g000":
        rooms.forEach((el) => {
          el.commands = {
            muteSpk: true,
            muteMic: true,
            muteVid: true,
            boolSpk: true,
            boolMic: true,
            boolVid: true,
          };
        });
        break;
      case "g111":
        rooms.forEach((el) => {
          el.commands = {
            muteSpk: false,
            muteMic: false,
            muteVid: false,
            boolSpk: true,
            boolMic: true,
            boolVid: true,
          };
        });
        break;
      case "g110":
        rooms.forEach((el) => {
          el.commands = {
            muteSpk: false,
            muteMic: false,
            muteVid: true,
            boolSpk: true,
            boolMic: true,
            boolVid: true,
          };
        });
        break;
      case "g_11":
        rooms.forEach((el) => {
          el.commands = {
            muteMic: false,
            muteVid: false,
            boolSpk: false,
            boolMic: true,
            boolVid: true,
          };
        });
        break;
      case "g_10":
        rooms.forEach((el) => {
          el.commands = {
            muteMic: false,
            muteVid: true,
            boolSpk: false,
            boolMic: true,
            boolVid: true,
          };
        });
        break;
      case "g101":
        rooms.forEach((el) => {
          el.commands = {
            muteSpk: false,
            muteMic: true,
            muteVid: false,
            boolSpk: true,
            boolMic: true,
            boolVid: true,
          };
        });
        break;
      case "g100":
        rooms.forEach((el) => {
          el.commands = {
            muteSpk: false,
            muteMic: true,
            muteVid: true,
            boolSpk: true,
            boolMic: true,
            boolVid: true,
          };
        });
        break;
      case "frzt":
        rooms.forEach((el) => {
          el.commands = {
            boolFrzt: true,
          };
        });
        break;
      case "frz0":
        rooms.forEach((el) => {
          el.commands = {
            boolFrz0: true,
          };
        });
        break;
      case "tbar":
        return chrome.tabs.sendMessage(evtClick.tabId, {
          action: "updateToolbarColors",
        });
        break;
      case "remP":
        return chrome.tabs.sendMessage(evtClick.tabId, {
          action: "removeAll",
        });
      case "clos":
        return chrome.tabs.sendMessage(evtClick.tabId, {
          action: "closeRoom",
        });
      case "mute":
        return chrome.tabs.sendMessage(evtClick.tabId, {
          action: "muteAll",
        });
      case "sync":
        return chrome.tabs.sendMessage(evtClick.tabId, {
          action: "syncGC",
        });

      default:
        break;
    }

    // console.log(`list is ${JSON.stringify(list)}`);

    for (let i = 0; i < rooms.length; i++) {
      payload = {
        action: "muting",
        tabId: rooms[i].id,
        boolSpk: rooms[i].commands.boolSpk,
        boolMic: rooms[i].commands.boolMic,
        boolVid: rooms[i].commands.boolVid,
        boolFrzt: rooms[i].commands.boolFrzt,
        boolFrz0: rooms[i].commands.boolFrz0,
        commands: rooms[i].commands,
        menuId: evtClick.menuItemId,
        tabId2: evtClick.tabId,
      };

      // chrome.tabs.sendMessage(list[i].tab.tabId, payload);
      // let msg = await chromeTabsSendMessage(rooms[i].id, payload);
      // chrome.tabs.sendMessage(rooms[i].id, payload);
      let obj = await chromeTabsSendMessage(rooms[i].id, payload);
      await sleep(1);
    }
  })();

  return true;
};

const updateOpenButtons = () => {
  if (myBreakout.settings.lowMemoryFlag) {
    document.querySelector("#this-av").classList.add("d-none");
    document.querySelector("#broadcast-section").classList.add("d-none");
    document.querySelector("#status-students").classList.add("d-none");
    document.querySelector("#status-rooms").classList.add("d-none");
    document.querySelector("#open-breakouts").classList.add("d-none");
    document.querySelector("#open-both").classList.add("d-none");
    document.querySelector("#open-main i").innerText = "Open/Sync One Window for Main and Breakout Rooms, Use Slider to Move Through the Rooms";
    intlMsg("btn-open-main", "btnRam", "&nbsp");
    document.querySelector("#open-main").classList.remove("col-3");
    document.querySelector("#open-main").classList.add("col-12");
  } else {
    document.querySelector("#this-av").classList.remove("d-none");
    document.querySelector("#broadcast-section").classList.remove("d-none");
    document.querySelector("#open-breakouts").classList.remove("d-none");
    document.querySelector("#status-students").classList.remove("d-none");
    document.querySelector("#status-rooms").classList.remove("d-none");
    document.querySelector("#open-both").classList.remove("d-none");
    document.querySelector("#open-main i").innerHTML = "Main Room";
    intlMsg("btn-open-main", "btnOpenMain", "&nbsp");
    document.querySelector("#open-main").classList.add("col-3");
    document.querySelector("#open-main").classList.remove("col-12");
  }
};
