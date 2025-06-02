// popup created
let gt_popup = [];
let g_availWidth = 0;
let g_availHeight = 0;
let gt_ids = [];

try {
  const getGtPopup = () => {
    return gt_popup;
  };

  const setGtPopup = (lt_popup) => {
    gt_popup = [...lt_popup];
  };

  // import
  self.importScripts("js/utilCore.js", "js/utilHelper.js", "js/utilDb.js", "background/bgContext.js", "background/bgWinTab.js", "background/bgEvents.js");

  // browser action
  chrome.action.onClicked.addListener((tab) => {
    console.log("icon clicked");
    (async () => {
      try {
        let rooms = [];
        let win = await chromeWindowsGetAll();
        let bk = await chromeStorageLocalGet("breakout");
        let lt_popup = [];

        for (let i = 0; i < win.length; i++) {
          let tabs = await chromeTabsQuery({ windowId: win[i].id });

          for (let j = 0; j < tabs.length; j++) {
            rooms.push({
              tabId: tabs[j].id,
              winId: tabs[j].windowId,
              url: tabs[j].url,
              title: tabs[j].title,
            });
          }
        }

        // List of all tabs by window
        let gt_popup = getGtPopup();

        //If there is NOT something here, then this window CANNOT control the stray meets so shut them all down
        for (let i = 0; i < rooms.length; i++) {
          if (rooms[i].url && rooms[i].url.startsWith("https://meet.google.com/")) {
            if (gt_popup.length < 1) {
              if (bk && bk.breakout && bk.breakout.settings && bk.breakout.settings.allowSimult) {
                console.log("Experimental allow simultaneous non-extension rooms");
              } else {
                // Update 7/23/2020 comment out the remove
                console.log("Previously removed the room.  Now keep it");
                // chrome.tabs.remove(rooms[i].tabId);
              }
            }
          }
        }

        // make sure that previous popup (if any) is still active
        rooms.forEach((el) => {
          for (let i = 0; i < gt_popup.length; i++) {
            const el2 = gt_popup[i];

            if (el.tabId == el2.tabId) {
              lt_popup.push({ winId: el.winId, tabId: el.tabId });
            }
          }
        });

        gt_popup = [...lt_popup];

        let pingPopupObj;

        try {
          pingPopupObj = await chromeRuntimeSendMessage({
            action: "pingPopup",
          });
          console.log(pingPopupObj);
        } catch (error) {
          console.log("Control Panel Popup is not open because no response to runtime message 'pingPopup'");
        }

        // If does not exist, then create it
        // if (gt_popup.length == 0) {
        if (pingPopupObj === undefined) {
          const CONTROL_PANEL = "popup.html";

          let myUrl = chrome.runtime.getURL("popup.html");

          let payload = {
            url: myUrl,
            focused: true,
            state: "normal",
            width: 530,
            height: 1000,

            top: 0,
            left: win[0].width - 530,
          };

          console.log(`left: window.screen.availLeft`);

          g_availHeight = payload.height;
          g_availWidth = payload.width;

          let tabsNew = await chromeWindowsCreate(payload);

          // Used to be 1000, 09/14/2024
          await sleep(5);

          await chromeWindowsUpdate2(tabsNew.id, {
            state: "normal",
            drawAttention: true,
            focused: true,
          });

          gt_popup.push({ winId: tabsNew.id, tabId: tabsNew.tabs[0].id });
          setGtPopup(gt_popup);

          await sleep(500);

          // Send popup a message to focus on slider
          let obj = await chromeRuntimeSendMessage({
            action: "updateSliderFocus",
            newPopup: true,
          });

          // Otherwise focus on it
        } else {
          let tabId = gt_popup[0].tabId;
          let winId = gt_popup[0].winId;

          // let tabs2 = await chromeTabsQuery({ windowId: winId })
          let win2 = await chromeWindowsGetAll();

          win2 = win2.filter((el) => el.id == winId);

          boolActive = true;
          chrome.tabs.update(tabId, { active: boolActive });

          boolFocused = true;
          boolAttention = false;

          chrome.windows.update(winId, {
            focused: boolFocused,
            drawAttention: boolAttention,
          });

          await sleep(500);

          // Send popup to focus on slider
          let obj = await chromeRuntimeSendMessage({
            action: "updateSliderFocus",
            newPopup: false,
          });
        }
      } catch (err) {}
    })();

    return true;
  });
} catch (error) {
  console.log(error);
}
