const openWinMulti = async (payload) => {
  let rooms = payload.rooms;
  let numRooms = rooms.length;
  let lowMemoryFlag = payload.lowMemoryFlag;

  if (lowMemoryFlag) {
    if (rooms.length > 1) {
      numRooms = 2;
    }
  }

  for (let i = 0; i < numRooms; i++) {
    let params = calcRoomParams(numRooms, i, payload.availWidth, payload.availHeight);

    if (!rooms[i]) {
      alert(`Problem with openWinMulti`);
    }

    let obj = await chromeWindowsCreate({
      url: rooms[i].linkFetchedUrl,
      width: params.width,
      height: params.height,
      top: params.top,
      left: params.left + parseInt(payload.availLeft),
    });

    // October 18, 2020
    // Delete existing name from gt_ids
    gt_ids = gt_ids.filter((el) => el.title != rooms[i].name);

    gt_ids.push({
      tabId: obj.tabs[0].id,
      winId: obj.tabs[0].windowId,
      url: rooms[i].link,
      title: rooms[i].name,
    });

    await sleep(2000);
  }
};

const createWinSingle = async (payload, i, assign) => {
  let rooms = payload.rooms;

  let numRooms = assign[i].numWins;

  // let params = calcRoomParams(numRooms, i, payload.availWidth, payload.availHeight);
  let params = calcRoomParams(numRooms, assign[i].winNum, payload.availWidth, payload.availHeight);

  let obj = await chromeWindowsCreate({
    url: rooms[i].linkFetchedUrl,
    width: params.width,
    height: params.height,
    top: params.top,
    // left: params.left + parseInt(myScreen.availLeft),
    left: params.left + parseInt(payload.availLeft),
  });

  let tabId = obj.tabs[0].id;
  let winId = obj.tabs[0].windowId;

  await sleep(1000);

  return { tabId, winId };
};

const createWinSingle_old = async (payload, i, assign) => {
  let rooms = payload.rooms;
  // let myScreen = payload.myScreen;
  let numRooms = assign[i].numWins;
  // let roomNum = assign[i].winNum;

  // let params = calcRoomParams(numRooms, roomNum);
  let params = calcRoomParams(numRooms, i, payload.availWidth, payload.availHeight);

  let obj = await chromeWindowsCreate({
    url: rooms[i].linkFetchedUrl,
    width: params.width,
    height: params.height,
    top: params.top,
    // left: params.left + parseInt(myScreen.availLeft),
    left: params.left + parseInt(payload.availLeft),
  });

  let tabId = obj.tabs[0].id;
  let winId = obj.tabs[0].windowId;

  await sleep(1000);

  return { tabId, winId };
};

const createTabSingle = async (payload, i, winId) => {
  let rooms = payload.rooms;
  let obj = await chromeTabsCreate2({
    windowId: winId,
    url: rooms[i].linkFetchedUrl,
  });
  let current = await chromeWindowsGet(obj.windowId);

  await sleep(2000);
};

const openTabMulti = async (payload) => {
  let rooms = payload.rooms;
  let numRooms = rooms.length;
  let assign = await assignTabsToWins(rooms);
  let lowMemoryFlag = payload.lowMemoryFlag;
  let obj;

  let windowId = await getFirstWindowId();

  if (lowMemoryFlag) {
    if (rooms.length > 1) {
      numRooms = 2;
    }
  }

  for (let i = 0; i < numRooms; i++) {
    if (windowId) {
      await createTabSingle(payload, i, windowId);
    } else {
      if (assign[i].flagWin) {
        obj = await createWinSingle(payload, i, assign);
      } else {
        await createTabSingle(payload, i, obj.winId);
      }
    }
  }
};

const assignTabsToWins = async (rooms) => {
  // let mySettings = await readSettings2();

  let { breakout: test2 } = await chromeStorageLocalGet("breakout");
  let mySettings = test2.settings;

  let maxTabs = mySettings.maxTabs == undefined ? "5" : mySettings.maxTabs;

  maxTabs = maxTabs == "0" ? "999999" : maxTabs;

  let numRooms = rooms.length;
  let assign = [];

  let numWin = Math.ceil(numRooms / maxTabs);

  for (let i = 0; i < numRooms; i++) {
    let roomInd = i;
    let winNum = Math.floor(i / maxTabs);
    let tabNum = ((i - (winNum - 1) * maxTabs) % maxTabs) + 1;
    let flagWin = i % maxTabs === 0 ? true : false;

    assign.push({ flagWin, roomInd, winNum, tabNum });
    numWins = winNum;
  }

  assign.forEach((el) => {
    el.numWins = numWins + 1;
  });

  return assign;
};

const getFirstWindowId = async () => {
  let { breakout: test2 } = await chromeStorageLocalGet("breakout");
  let myRooms = test2.myRooms;
  let openRooms = await chromeAllOpenRooms();

  for (let i = 0; i < myRooms.length; i++) {
    for (let j = 0; j < openRooms.length; j++) {
      if (myRooms[i].linkFetchedUrl == getMeetUrlBase(openRooms[j].url)) {
        return openRooms[j].windowId;
      }
    }
  }

  return null;
};
