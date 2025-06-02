// Process the contect menu clicks

const setContextMenu = () => {
  let contextMenuItem = {
    id: "root",
    title: "Breakout Rooms",
    contexts: ["all"],
    documentUrlPatterns: ["https://meet.google.com/*"],
  };
  let r111 = {
    id: "r111",
    parentId: "root",
    title: "This room: Talk with Camera",
    contexts: ["all"],
  };
  let r110 = {
    id: "r110",
    parentId: "root",
    title: "This room: Talk with no Camera",
    contexts: ["all"],
  };
  // **************
  let r101 = {
    id: "r101",
    parentId: "root",
    title: "This room: Listen with Camera",
    contexts: ["all"],
  };
  let r100 = {
    id: "r100",
    parentId: "root",
    title: "This room: Listen with no Camera",
    contexts: ["all"],
  };
  // **************
  let r000 = {
    id: "r000",
    parentId: "root",
    title: "This room: Everything off",
    contexts: ["all"],
  };
  // **************
  let g1__ = {
    id: "g1__",
    parentId: "root",
    title: "All rooms: Volume on",
    contexts: ["all"],
  };
  let g0__ = {
    id: "g0__",
    parentId: "root",
    title: "All rooms: Volume off",
    contexts: ["all"],
  };
  let g000 = {
    id: "g000",
    parentId: "root",
    title: "All rooms: Everything off",
    contexts: ["all"],
  };
  // **************
  // let g111 = {
  //   id: "g111",
  //   parentId: "root",
  //   title: "All rooms: Talk with Camera",
  //   contexts: ["all"],
  // };
  // let g110 = {
  //   id: "g110",
  //   parentId: "root",
  //   title: "All rooms: Talk with no Camera",
  //   contexts: ["all"],
  // };
  let g_11 = {
    id: "g_11",
    parentId: "root",
    title: "Broadcast: Talk with Camera",
    contexts: ["all"],
  };
  let g_10 = {
    id: "g_10",
    parentId: "root",
    title: "Broadcast: Talk with no Camera",
    contexts: ["all"],
  };
  // **************
  let g101 = {
    id: "g101",
    parentId: "root",
    title: "All rooms: Listen with Camera",
    contexts: ["all"],
  };
  let g100 = {
    id: "g100",
    parentId: "root",
    title: "All rooms: Listen with no Camera",
    contexts: ["all"],
  };
  // **************
  let frzt = {
    id: "frzt",
    parentId: "root",
    title: "Freeze Unfreeze this room",
    contexts: ["all"],
  };
  let frz0 = {
    id: "frz0",
    parentId: "root",
    title: "Unfreeze all rooms",
    contexts: ["all"],
  };
  let tbar = {
    id: "tbar",
    parentId: "root",
    title: "Update Toolbar Colors",
    contexts: ["all"],
  };
  let sync = {
    id: "sync",
    parentId: "root",
    title: "Sync GC Main room (updates this URL in Rooms Tab/Main)",
    contexts: ["all"],
  };
  let remP = {
    id: "remP",
    parentId: "root",
    title: "Remove all participants",
    contexts: ["all"],
  };
  let clos = {
    id: "clos",
    parentId: "root",
    title: "Close the room",
    contexts: ["all"],
  };
  let mute = {
    id: "mute",
    parentId: "root",
    title: "Mute all participants",
    contexts: ["all"],
  };
  // Separators
  let sub1 = {
    id: "sub1",
    parentId: "root",
    type: "separator",
    contexts: ["all"],
  };
  let sub2 = {
    id: "sub2",
    parentId: "root",
    type: "separator",
    contexts: ["all"],
  };
  let sub3 = {
    id: "sub3",
    parentId: "root",
    type: "separator",
    contexts: ["all"],
  };
  let sub4 = {
    id: "sub4",
    parentId: "root",
    type: "separator",
    contexts: ["all"],
  };
  let sub5 = {
    id: "sub5",
    parentId: "root",
    type: "separator",
    contexts: ["all"],
  };
  let sub6 = {
    id: "sub6",
    parentId: "root",
    type: "separator",
    contexts: ["all"],
  };
  let sub7 = {
    id: "sub7",
    parentId: "root",
    type: "separator",
    contexts: ["all"],
  };
  let sub8 = {
    id: "sub8",
    parentId: "root",
    type: "separator",
    contexts: ["all"],
  };
  // let r1__ = {
  //   id: "r1__",
  //   parentId: "root",
  //   title: "This room: Volume on",
  //   contexts: ["all"],
  // };
  // let r0__ = {
  //   id: "r0__",
  //   parentId: "root",
  //   title: "This room: Volume off",
  //   contexts: ["all"],
  // };
  // let r_1_ = {
  //   id: "r1__",
  //   parentId: "root",
  //   title: "This room: Mic on",
  //   contexts: ["all"],
  // };
  // let r_0_ = {
  //   id: "r_0_",
  //   parentId: "root",
  //   title: "This room: Mic off",
  //   contexts: ["all"],
  // };
  // let r__1 = {
  //   id: "r__1",
  //   parentId: "root",
  //   title: "This room: Cam on",
  //   contexts: ["all"],
  // };
  // let r__0 = {
  //   id: "r__0",
  //   parentId: "root",
  //   title: "This room: Cam off",
  //   contexts: ["all"],
  // };

  chrome.contextMenus.removeAll();
  // chrome.contextMenus.create(contextMenuItem, () => chrome.runtime.lastError);

  // // This room talk with camera on/off
  // chrome.contextMenus.create(r111, () => chrome.runtime.lastError);
  // chrome.contextMenus.create(r110, () => chrome.runtime.lastError);
  // chrome.contextMenus.create(sub1, () => chrome.runtime.lastError);

  // // This room  listen with camera on/off
  // chrome.contextMenus.create(r101, () => chrome.runtime.lastError);
  // chrome.contextMenus.create(r100, () => chrome.runtime.lastError);
  // chrome.contextMenus.create(r000, () => chrome.runtime.lastError);
  // chrome.contextMenus.create(sub2, () => chrome.runtime.lastError);

  // // All rooms talk with camera on/off
  // chrome.contextMenus.create(g_11, () => chrome.runtime.lastError);
  // chrome.contextMenus.create(g_10, () => chrome.runtime.lastError);
  // chrome.contextMenus.create(sub5, () => chrome.runtime.lastError);

  // // All rooms listen with camera on/off
  // chrome.contextMenus.create(g101, () => chrome.runtime.lastError);
  // chrome.contextMenus.create(g100, () => chrome.runtime.lastError);
  // chrome.contextMenus.create(sub6, () => chrome.runtime.lastError);

  // // All rooms volume on/off
  // chrome.contextMenus.create(sub4, () => chrome.runtime.lastError);
  // chrome.contextMenus.create(g1__, () => chrome.runtime.lastError);
  // chrome.contextMenus.create(g0__, () => chrome.runtime.lastError);
  // chrome.contextMenus.create(g000, () => chrome.runtime.lastError);
  // chrome.contextMenus.create(sub3, () => chrome.runtime.lastError);

  // // Freeze
  // chrome.contextMenus.create(frzt, () => chrome.runtime.lastError);
  // chrome.contextMenus.create(frz0, () => chrome.runtime.lastError);
  // chrome.contextMenus.create(sub7, () => chrome.runtime.lastError);

  // chrome.contextMenus.create(sync, () => chrome.runtime.lastError);
  // chrome.contextMenus.create(mute, () => chrome.runtime.lastError);
  // chrome.contextMenus.create(remP, () => chrome.runtime.lastError);
  // chrome.contextMenus.create(clos, () => chrome.runtime.lastError);
  // chrome.contextMenus.create(tbar, () => chrome.runtime.lastError);
};
