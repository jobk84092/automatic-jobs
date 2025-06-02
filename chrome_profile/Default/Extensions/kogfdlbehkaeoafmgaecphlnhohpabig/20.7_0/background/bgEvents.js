chrome.runtime.onMessage.addListener((payload, sender, callback) => {
  (async () => {
    try {
      let tabs;

      switch (payload.action) {
        case "GETSPKSTATE":
          tabs = await chromeTabsQuery({ url: sender.tab.url });
          const boolMuted = tabs[0].mutedInfo.muted;
          callback({ boolMuted });
          break;

        case "SPKBTNCLICKED":
          {
            const tabId = sender.tab.id;
            const tab = await chromeTabsGet(tabId);
            const boolMuted = !tab.mutedInfo.muted;
            chrome.tabs.update(tabId, { muted: boolMuted }, () => {
              callback({ boolMuted });
            });
          }
          return true;

        case "tellContextToUpdateTabs":
          tabs = await chromeTabsQuery({});
          const meetTabs = tabs.filter((tab) => tab.url && tab.url.startsWith("https://meet.google.com/"));
          for (const meetTab of meetTabs) {
            console.log(`Updating tab with id ${meetTab.id}, url: ${meetTab.url}`);
            await chromeTabsSendMessage(meetTab.id, { action: "updateTabTitle" });
          }
          break;

        case "getTableOfTabs":
          callback(gt_ids);
          break;

        case "getAvailWidthHeight":
          callback({ width: g_availWidth, height: g_availHeight });
          break;

        case "closeRoomTab":
          const tabId = sender.tab.id;
          if (Number.isInteger(tabId)) {
            chrome.tabs.remove(tabId);
          }
          break;

        case "closeRoomTab2":
          const tabIdToRemove = payload.tabId;
          if (Number.isInteger(tabIdToRemove)) {
            chrome.tabs.remove(tabIdToRemove);
          }
          break;

        case "openWinMulti":
          await openWinMulti(payload);
          await sleep(1000);
          await chromeRuntimeSendMessage({ action: "updateSliderFocus" });
          callback({ msg: "Opened Windows" });
          break;

        case "openTabMulti":
          await openTabMulti(payload);
          await sleep(1000);
          await chromeRuntimeSendMessage({ action: "updateSliderFocus" });
          callback({ msg: "Opened Tabs" });
          break;

        case "getTabMuteStatus":
          try {
            const tabId = sender.tab.id;
            const tabInfo = await chromeTabsGet(tabId);
            callback(tabInfo);
          } catch (error) {
            console.error("Error retrieving tab info:", error);
            callback({ error: "Failed to retrieve tab info" });
          }
          return true;

        default:
          break;
      }
    } catch (error) {
      console.error("Error:", error);
    }
  })();

  return true; // Keep this to ensure Chrome handles the async response correctly
});
