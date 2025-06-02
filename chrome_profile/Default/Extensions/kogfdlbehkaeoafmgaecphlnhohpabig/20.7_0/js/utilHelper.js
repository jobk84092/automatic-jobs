let myBreakout;
let myPpt = {};

const getMainName = () => {
  let mainName;
  try {
    mainName = myBreakout.myRooms[0].name ? myBreakout.myRooms[0].name : "Main";
  } catch (err) {
    mainName = "Main";
  }

  return mainName;
};

const updateChooseCourseLabel = (meetClassName = "", numRooms = "") => {
  try {
    let selectedCourse, numBreakouts;

    if (meetClassName) {
      selectedCourse = meetClassName;
    } else {
      selectedCourse = document.querySelector('#meet2 [data-class-id="0"]')?.innerText;
    }

    if (document.querySelector("#meet-room-number")) {
      if (document.querySelector("#meet-room-number").innerText == "") {
        document.querySelector("#meet-room-number").innerText = "0";
      }
      numBreakouts = document.querySelector("#meet-room-number")?.innerText;
    }
    // if (numRooms) {
    //   numBreakouts = numRooms;
    // } else {
    //   numBreakouts = document.querySelector("#meet-room-number").innerText;
    //   numBreakouts = "0";
    // }

    document.querySelector("#course-num-breakouts").innerText = `\u00A0 Choose Course (${selectedCourse} and ${numBreakouts} Breakouts)`;
  } catch (err) {}
};

const updateSpanCourseNum = () => {
  let selectedCourse = document.querySelector('#meet2 [data-class-id="0"]').innerText;
  let numBreakouts = document.querySelector("#meet-room-number").innerText;
  document.querySelector("#meet-start-google").querySelector("#span-course").innerText = selectedCourse;
  // document
  //   .querySelector("#meet-start-google")
  //   .querySelector("#span-num").innerText = numBreakouts;
  document.querySelector("#meet-start-google").querySelector("#span-num2").innerText = numBreakouts;
};

const saveCourseNumPair = async () => {
  let selectedCourse = document.querySelector('#meet2 [data-class-id="0"]').innerText;
  let numBreakouts = document.querySelector("#meet-room-number").innerText;

  let pairings;
  // let temp = myBreakout.settings.pairings;
  if (myBreakout.settings.pairings && myBreakout.settings.pairings.length > 0) {
    pairings = [...myBreakout.settings.pairings];
  } else {
    pairings = [];
  }

  // filter out this course if exist because will add later
  pairings = pairings.filter((el) => el.course !== selectedCourse);

  pairings = [...pairings, { course: selectedCourse, num: numBreakouts }];

  myBreakout.settings.pairings = pairings;

  await myBreakout.saveBreakout();
};

const chromeGetReportPopup = async (reportSuffix) => {
  try {
    let rooms = [];
    let win = await chromeWindowsGetAll({ windowTypes: ["popup"] });

    for (let i = 0; i < win.length; i++) {
      let tabs = await chromeTabsQuery({ windowId: win[i].id });

      for (let j = 0; j < tabs.length; j++) {
        if (tabs[j].url.endsWith(`${reportSuffix}`)) {
          rooms.push({
            id: tabs[j].id,
            windowId: tabs[j].windowId,
            muted: tabs[j].mutedInfo.muted,
            url: tabs[j].url,
            title: tabs[j].title,
          });
        }
      }
    }

    return rooms;
  } catch (err) {}
};

// Function to show the overlay with smooth transition
const showOverlay = () => {
  const overlay = document.getElementById("fullscreen-overlay");
  overlay.classList.remove("no-display");
  setTimeout(() => {
    overlay.classList.add("visible");
  }, 10); // Delay to ensure the transition works
};

// Function to hide the overlay with smooth transition
const hideOverlay = () => {
  const overlay = document.getElementById("fullscreen-overlay");
  overlay.classList.remove("visible");
  overlay.classList.add("no-display");
  overlay.addEventListener(
    "transitionend",
    () => {
      overlay.classList.add("no-display");
    },
    { once: true }
  ); // Ensure 'no-display' is added after the transition
};

const chromeAllOpenRooms = async (boolOpen = false, tabId = 0, boolFilter = true, boolGetReferrer = false, boolExpand = false) => {
  // if (document.querySelector("#assign-ppts").ariaExpanded == "true") {
  // return;
  // }

  try {
    // new stuff
    boolExpand ? showOverlay() : null;

    let rooms = [];
    let win = await chromeWindowsGetAll({ windowTypes: ["normal"] });
    // let win = await chromeWindowsGetAll({ windowTypes: ["normal"] });
    let tabCurrent = await chromeTabsGetCurrent();
    // console.log(`tabCurrent `, tabCurrent);

    for (let i = 0; i < win.length; i++) {
      let tabs = await chromeTabsQuery({ windowId: win[i].id });

      for (let j = 0; j < tabs.length; j++) {
        rooms.push({
          id: tabs[j].id,
          windowId: tabs[j].windowId,
          muted: tabs[j].mutedInfo.muted,
          url: tabs[j].url,
          title: tabs[j].title,
        });
      }
    }

    if (boolFilter) {
      rooms = rooms.filter((el) => el.url && el.url.startsWith("https://meet.google.com"));
    } else {
      // alert("getTableofTabs");
      console.log("getTableofTabs");

      let gt_tabs = await chromeRuntimeSendMessage({
        action: "getTableOfTabs",
      });

      for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].url == undefined) {
          for (let j = 0; j < gt_tabs.length; j++) {
            if (gt_tabs[j].tabId == rooms[i].id) {
              rooms[i].url = gt_tabs[j].url;
            }
          }
        }
      }
      rooms = rooms.filter((el) => el.url && el.url.startsWith("http"));
    }

    // disable
    boolOpen = false;

    const getWindowProperties = async (windowId) => {
      return new Promise((resolve, reject) => {
        chrome.windows.get(windowId, { populate: true }, (window) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(window);
          }
        });
      });
    };

    const updateRoomsInParallel = async () => {
      const promises = rooms.map(async (room) => {
        if (room.url && room.url.startsWith("https://meet.google.com")) {
          let windowProperties;

          if (boolExpand) {
            windowProperties = await getWindowProperties(room.windowId);
            console.log(`chromeAllOpenRooms`, windowProperties);
            await chrome.windows.update(room.windowId, {
              state: "maximized",
            });
            await sleep(3000);
          }

          let { ppt } = await chromeTabsSendMessage(room.id, {
            action: "getPpt",
          });

          room.ppt = ppt;

          if (boolExpand) {
            // const window = await chromeWindowsUpdate2(tabCurrent.windowId, { focused: true });

            const { width, height, top, left, id } = windowProperties;
            await chrome.windows.update(room.windowId, {
              state: "normal",
              width: width,
              height: height,
              top: top,
              left: left,
              drawAttention: false,
              focused: false,
            });
          }
        }
      });

      // Wait for all the promises to resolve
      await Promise.all(promises);
    };

    // Run the function
    await updateRoomsInParallel();

    // new stuff
    if (boolExpand) {
      await chromeTabsUpdate2(rooms[0].id, { active: true });
      await sleep(1000);
      const window = await chromeWindowsUpdate2(tabCurrent.windowId, { focused: true });
      await sleep(1000);
      await chromeTabsUpdate2(tabCurrent.id, { active: true });
    }

    boolExpand ? hideOverlay() : null;

    return rooms;
  } catch (error) {
    console.log("Inside chromeAllOpenRooms Error handling room:", error);
  }
};

const roomsOptions = {
  muteSwitchFromMain: {
    speaker: true,
    mic: true,
    video: true,
  },
  muteSwitchFromRooms: {
    speaker: true,
    mic: true,
    video: true,
  },
  muteSwitchToRoom: {
    speaker: false,
    mic: true,
    video: true,
  },
  class: "default",
  autoEnter: true,
};

// Screen
const calcRoomParams = (numRooms, roomNum, availWidth = window.screen.availWidth, availHeight = window.screen.availHeight) => {
  const roomWindows = {
    1: { rows: 1, cols: 1 },
    2: { rows: 1, cols: 2 },
    3: { rows: 2, cols: 2 },
    4: { rows: 2, cols: 2 },
    5: { rows: 2, cols: 3 },
    6: { rows: 2, cols: 3 },
    7: { rows: 3, cols: 4 },
    8: { rows: 3, cols: 4 },
    9: { rows: 3, cols: 4 },
    10: { rows: 3, cols: 4 },
    11: { rows: 3, cols: 4 },
    12: { rows: 3, cols: 4 },
    13: { rows: 4, cols: 4 },
    14: { rows: 4, cols: 4 },
    15: { rows: 4, cols: 4 },
    16: { rows: 4, cols: 4 },
    17: { rows: 4, cols: 5 },
    18: { rows: 4, cols: 5 },
    19: { rows: 4, cols: 5 },
    20: { rows: 4, cols: 5 },
    21: { rows: 4, cols: 6 },
    22: { rows: 4, cols: 6 },
    23: { rows: 4, cols: 6 },
    24: { rows: 4, cols: 6 },
    25: { rows: 5, cols: 6 },
    26: { rows: 5, cols: 6 },
    27: { rows: 5, cols: 6 },
    28: { rows: 5, cols: 6 },
    29: { rows: 5, cols: 6 },
    30: { rows: 5, cols: 6 },
  };

  // let scrW = window.screen.availWidth;
  let scrW = availWidth;
  let scrH = availHeight;

  console.log(`availWidth: ${scrW}`);
  console.log(`availHeight: ${scrH}`);

  // let scrT = window.screen.availTop;
  // let scrL = window.screen.availLeft;

  let minW = 500;
  let minH = 500;

  // let scrXOff = 5;
  let scrYOff = 20;

  nRows = roomWindows[numRooms].rows;
  nCols = roomWindows[numRooms].cols;

  rowW = scrW / nCols > minW ? parseInt(scrW / nCols) : minW;
  colH = scrH / nRows > minH ? parseInt(scrH / nRows) : minH;

  xTotal = (roomNum - 1) * scrW;
  yTotal = (roomNum - 1) * scrH;

  let num = 0;

  // Special case for 1 room, 80%
  if (numRooms == 1) {
    return {
      top: 0,
      left: parseInt(rowW * 0),
      // left: parseInt(rowW * 0.5),
      width: parseInt(rowW * 0.5),
      height: parseInt(colH * 1),
    };
  }

  // Typical case for multiple windows
  for (let row = 0; row < nRows; row++) {
    for (let col = 0; col < nCols; col++) {
      if (num === roomNum) {
        return {
          top: row * colH + (row - 0) * scrYOff,
          left: col * rowW,
          width: rowW,
          height: colH,
        };
      }
      num++;
    }
  }
};

// ***********************
const dynamicSort2 = (property) => {
  let sortOrder = 1;

  if (property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  }

  return (a, b) => {
    if (sortOrder == -1) {
      return b["value"][property].localeCompare(a["value"][property]);
    } else {
      return a["value"][property].localeCompare(b["value"][property]);
    }
  };
};

const dynamicSort = (property) => {
  let sortOrder = 1;

  if (property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  }

  return (a, b) => {
    if (sortOrder == -1) {
      return b[property].localeCompare(a[property]);
    } else {
      return a[property].localeCompare(b[property]);
    }
  };
};

let colorList = [
  "AliceBlue",
  "AntiqueWhite",
  "Aqua",
  "Aquamarine",
  "AustinGray",
  "AustinOrange",
  "AustinWhite",
  "Azure",
  "Beige",
  "Bisque",
  "Black",
  "Black_Dracula",
  "BlanchedAlmond",
  "Blue",
  "BlueViolet",
  "Brown",
  "BurlyWood",
  "BurntOrange",
  "CadetBlue",
  "Chartreuse",
  "Chocolate",
  "CollegeStation",
  "Coral",
  "CornflowerBlue",
  "Cornsilk",
  "CowboyBlue",
  "CowboySilver",
  "Crimson",
  "Cyan",
  "DarkBlue",
  "DarkBlue_Dracula",
  "DarkCyan",
  "DarkGoldenRod",
  "DarkGrey",
  "DarkGreen",
  "DarkKhaki",
  "DarkMagenta",
  "DarkOliveGreen",
  "DarkOrange",
  "DarkOrchid",
  "DarkRed",
  "DarkSalmon",
  "DarkSeaGreen",
  "DarkSlateBlue",
  "DarkSlateGrey",
  "DarkTurquoise",
  "DarkViolet",
  "DeepPink",
  "DeepSkyBlue",
  "DimGrey",
  "DodgerBlue",
  "FireBrick",
  "FloralWhite",
  "ForestGreen",
  "Fuchsia",
  "Gainsboro",
  "GhostWhite",
  "Gold",
  "GoldenRod",
  "Grey",
  "Green",
  "Green_Dracula",
  "GreenYellow",
  "HoneyDew",
  "HotPink",
  "IndianRed",
  "Indigo",
  "Ivory",
  "Khaki",
  "Lavender",
  "LavenderBush",
  "LawnGreen",
  "LemonChiffon",
  "LightBlue",
  "LightBlue_Dracula",
  "LightCoral",
  "LightCyan",
  "LightGoldenRodYellow",
  "LightGrey",
  "LightGreen",
  "LightPink",
  "LightSalmon",
  "LightSeaGreen",
  "LightSkyBlue",
  "LightSlateGrey",
  "LightSteelBlue",
  "LightYellow",
  "Lime",
  "LimeGreen",
  "Linen",
  "Magenta",
  "Maroon",
  "MediumAquaMarine",
  "MediumBlue",
  "MediumOrchid",
  "MediumPurple",
  "MediumSeaGreen",
  "MediumSlateBlue",
  "MediumSpringGreen",
  "MediumTurquoise",
  "MediumVioletRed",
  "MidnightBlue",
  "MintCream",
  "MistyRose",
  "Moccasin",
  "MustangBlue",
  "MustangRed",
  "NavajoWhite",
  "Navy",
  "NormanCreme",
  "NormanCrimson",
  "OldLace",
  "Olive",
  "OliveDrab",
  "Orange",
  "Orange_Dracula",
  "OrangeRed",
  "Orchid",
  "PaleGoldenRod",
  "PaleGreen",
  "PaleTurquoise",
  "PaleVioletRed",
  "PapayaWhip",
  "PeachPuff",
  "Peru",
  "Pink",
  "Pink_Dracula",
  "Plum",
  "PowderBlue",
  "Purple",
  "Purple_Dracula",
  "Rainbow",
  "RebeccaPurple",
  "Red",
  "Red_Dracula",
  "RosyBrown",
  "RoyalBlue",
  "SaddleBrown",
  "Salmon",
  "SandyBrown",
  "SeaGreen",
  "SeaShell",
  "Sienna",
  "Silver",
  "SkyBlue",
  "SlateBlue",
  "SlateGrey",
  "Snow",
  "SpringGreen",
  "SteelBlue",
  "Tan",
  "Teal",
  "Thistle",
  "Tomato",
  "Turquoise",
  "Violet",
  "Wheat",
  "White",
  "WhiteSmoke",
  "Yellow",
  "Yellow_Dracula",
  "YellowGreen",
];

const getColorRgb = (myColor) => {
  let extras = {
    AustinOrange: "rgb(204,85,0)",
    AustinGray: "rgb(51,63,72)",
    AustinWhite: "rgb(255,255,255)",
    BurntOrange: "rgb(204,85,0)",
    CollegeStation: "rgb(80,0,0)",
    CowboyBlue: "rgb(0,53,148)",
    CowboySilver: "rgb(134,147,151)",
    Rainbow: "linear-gradient(to right, red,orange,yellow,green,blue,indigo,violet)",
    MustangBlue: "rgb(53,76,161)",
    MustangRed: "rgb(204,0,0)",
    NormanCreme: "rgb(221,203,164)",
    NormanCrimson: "rgb(133,22,23)",
    Black_Dracula: "#44475a",
    DarkBlue_Dracula: "#6272a4",
    LightBlue_Dracula: "#8be9fd",
    Green_Dracula: "#50fa7b",
    Orange_Dracula: "#ffb86c",
    Pink_Dracula: "#ff79c6",
    Purple_Dracula: "#bd93f9",
    Red_Dracula: "#ff5555",
    Yellow_Dracula: "#f1fa8c",
  };

  let extrasKeys = Object.keys(extras);

  let testColor = extrasKeys.filter((el) => el == myColor);

  if (testColor.length > 0) {
    return `${extras[myColor]}`;
  } else {
    return `${myColor}`;
  }
};

const setMeetBannerMessage = () => {
  let manifest = chrome.runtime.getManifest();
  // document.querySelector('#meet-tab-message').innerText = document.querySelector('#meet-tab-message').innerText + `, click <a> here </a> for v ${manifest.version} notes`;
  let hrefNotes = `https://www.hudektech.com/projects/breakout/notes#v-${manifest.version}`;
  let headline1a = chrome.i18n.getMessage("headline1a"); // 免費使用，不外出私人資料
  let headline1b = chrome.i18n.getMessage("headline1b"); // 胡浩洋用
  let headline1c = chrome.i18n.getMessage("headline1c"); // 用
  let headline1d = chrome.i18n.getMessage("headline1d"); // 製作的，版本
  let headline1e = chrome.i18n.getMessage("headline1e"); // 注釋

  headline1a = "";

  let myName = "Robert Hudek";
  if (headline1b == "胡浩洋") {
    myName = headline1b;
  }

  document.querySelector("#meet-tab-message").outerHTML = `<p id="meet-tab-message" class="mb-0 d-none" style="color: black" > 
Built with<span style="color: red; font-size: 12px">&nbsp❤️&nbsp</span>by <a target="_blank" rel="noopener noreferrer"
href="https://www.hudektech.com" style="color: black"> ${myName}</a>, click <a style="color: mediumblue;" target="_blank" rel="noopener noreferrer"
href=${hrefNotes}>here</a> for v ${manifest.version} notes`;

  //   if (chrome.i18n.getUILanguage().substring(0, 2) == "zh") {
  //     document.querySelector(
  //       "#meet-tab-message"
  //     ).outerHTML = `<p id="meet-tab-message" class="mb-0" style="color: black" >
  // 用了胡浩洋的<span style="color: red; font-size: 12px">&nbsp❤️&nbsp</span>by <a target="_blank" rel="noopener noreferrer"
  // href="https://www.hudektech.com" style="color: black"> Robert Hudek</a>, click <a style="color: mediumblue;" target="_blank" rel="noopener noreferrer"
  // href=${hrefNotes}>here</a> for v ${manifest.version} notes`;

  //     return;
  //   }

  if (headline1a && headline1b && headline1c && headline1d && headline1e) {
    document.querySelector("#meet-tab-message").outerHTML = `<p id="meet-tab-message" class="mb-0" style="color: black" > 
${headline1a}<a target="_blank" rel="noopener noreferrer"
href="https://www.hudektech.com" style="color: black">${headline1b} </a> ${headline1c}<span style="color: red; font-size: 12px">&nbsp❤️&nbsp</span> ${headline1d} <a style="color: black;" target="_blank" rel="noopener noreferrer"
href=${hrefNotes}>${manifest.version} ${headline1e}</a> `;
  }
};

const refreshControlPanel = async () => {
  let win = await chromeWindowsGetCurrent({});

  await chromeWindowsUpdate2(win.id, {
    state: "normal",
    drawAttention: true,
    focused: true,
    width: 530,
    // height: 420,
    height: window.screen.availHeight,
    top: 0,
    left: window.screen.availWidth - 530,
  });

  window.location.reload();
  // location.reload(true);
};

const popupResize = async (currentTarget) => {
  let win = await chromeWindowsGetCurrent({});
  let tabs = await chromeTabsGetCurrent({});

  let boolMin;
  let myTop;
  let sliderSection = document.querySelector(".slider-section").getBoundingClientRect();
  let broadcastSection = document.querySelector(".broadcast-section").getBoundingClientRect();

  let heightMin = Math.ceil(broadcastSection.top + 100);
  heightMin = Math.ceil(sliderSection.bottom + 50);
  heightMin = heightMin + 50;

  // heightMin = 423;
  // let heightMax = window.screen.availHeight;

  // getAvailWidthHeight;
  let objWidthHeight = await chromeRuntimeSendMessage({
    action: "getAvailWidthHeight",
  });

  // let heightMax = objWidthHeight.height;
  // let heightMax = 2000;
  let heightMax = 1000;

  // heightMax = win.height;
  console.log(`heightMax = ${heightMax}`);

  let myHeight = 100;

  // Make it small
  if (currentTarget.classList.contains("toggle-compress")) {
    currentTarget.classList.remove("toggle-compress");
    currentTarget.classList.add("toggle-expand");
    currentTarget.querySelector("i").classList.remove("fa-angle-down");
    currentTarget.querySelector("i").classList.add("fa-angle-up");

    myHeight = heightMin;

    myHeight += 10;

    // window.scroll(0, 150);
    boolMin = true;

    // Make it big
  } else {
    currentTarget.classList.remove("toggle-expand");
    currentTarget.classList.add("toggle-compress");
    currentTarget.querySelector("i").classList.remove("fa-angle-up");
    currentTarget.querySelector("i").classList.add("fa-angle-down");

    myHeight = heightMax;
    myTop = 0;

    boolMin = false;
  }

  await chromeWindowsUpdate2(win.id, {
    state: "normal",
    drawAttention: true,
    focused: true,
    width: 530,
    height: myHeight,
    // top: myTop,
    // left: window.screen.availWidth - 530,
  });

  if (boolMin) {
    // window.scroll(0, 167);
    window.scroll(0, 145);
  }
  // window.location.reload();
  // let win = await chromeWindowsGetCurrent({});

  // chrome.windows.update(win.id, {
  //   state: "minimized",
  // });
};

const popupRetileTabs = async (currentTarget, currentTab) => {
  async function organizeTabs(tabsArray, focusTabId = null) {
    // Get screen information for window placement
    const screenWidth = window.screen.availWidth;
    const screenHeight = window.screen.availHeight;

    // Create or get a window with 50% width and aligned to the left
    const newWindow = await chrome.windows.create({
      left: 0,
      top: 0,
      width: Math.floor(screenWidth / 2),
      height: screenHeight,
      state: "normal",
      focused: true,
      tabId: tabsArray[0].id, // Move the first tab in the array into the new window
    });

    const windowId = newWindow.id;

    // Move the remaining tabs into the new window and arrange them in the correct order
    for (let i = 1; i < tabsArray.length; i++) {
      await chrome.tabs.move(tabsArray[i].id, { windowId, index: i });
    }

    // Optionally focus on the specified tabId
    if (focusTabId) {
      await chrome.tabs.update(focusTabId, { active: true });
    } else {
      // Focus on the first tab by default
      await chrome.tabs.update(tabsArray[0].id, { active: true });
    }
  }

  let openRooms2 = await chromeAllOpenRooms();
  openRooms2 = filterHashRooms(openRooms2);
  openRooms2 = sortRoomsTabOrder(openRooms2);
  openRooms2 = filterExtensionRooms(openRooms2);
  let currentTabId = parseInt(document.querySelector("#slider-title").dataset.tabId, 10);

  organizeTabs(openRooms2, currentTabId);
};

const popupRetile = async (currentTarget) => {
  try {
    // Get the control panel window id
    let currentTab = await chromeTabsQuery({
      active: true,
      currentWindow: true,
    });

    // let saveTabId = currentTab[0].id;
    let saveWinId = currentTab[0].windowId;

    // Get the low memory option
    let lowMemoryFlag = document.querySelector("#low-memory-option").checked;

    // Get the radio button
    let tilesRadio = document.querySelector('[data-general-type="tiles"] input').checked;

    // Override based on low memory flag
    tilesRadio = lowMemoryFlag ? true : tilesRadio;

    // Make sure that tile option is selectedCourse
    if (!tilesRadio) {
      return popupRetileTabs(currentTarget, currentTab);
      // return alert("Re-Tile is only available for Tiled breakouts. Tabs breakout rooms option is selected in the Settings.");
    }
    // Get all the rooms
    let rooms = await chromeAllOpenRooms((boolOpen = false), (tabId = 0), (boolFilter = false), (boolGetReferrer = false), (boolExpand = false));

    rooms = filterHashRooms(rooms);
    rooms = filterExtensionRooms(rooms);
    rooms = sortRoomsTabOrder(rooms);

    // Read the number of requested breakouts
    let numRooms = parseInt(document.querySelector("#meet-room-number").innerText);

    // Add one for the main room to get the total number of rooms
    numRooms++;

    // Override based on low memory flag
    numRooms = lowMemoryFlag ? 1 : numRooms;

    // Check to see if they are all separate window, if not then first create window then move to window
    let wins = [];
    for (let i = 0; i < rooms.length; i++) {
      let dupes = wins.filter((el) => el == rooms[i].windowId);
      wins.push(rooms[i].windowId);

      if (dupes.length > 0) {
        // remove it

        // create it
        let obj = await chromeWindowsCreate({
          url: "https://google.com",
          width: 500,
          height: 500,
          top: 0,
          left: 0,
        });

        await chromeTabsMove(rooms[i].id, {
          windowId: obj.tabs[0].windowId,
          index: 0,
        });

        chrome.tabs.remove(obj.tabs[0].id);

        // await sleep(2000);

        let tabId = obj.tabs[0].id;
        // Tell the content to update title
        chrome.tabs.sendMessage(parseInt(tabId), {
          action: "updateTabTitle",
        });
      }
    }

    // Get the revised rooms
    // rooms = await chromeAllOpenRooms((boolOpen = false), (tabId = 0), (boolFilter = false));

    rooms = await chromeAllOpenRooms((boolOpen = false), (tabId = 0), (boolFilter = false), (boolGetReferrer = false), (boolExpand = false));

    rooms = filterHashRooms(rooms);
    rooms = filterExtensionRooms(rooms);

    // Sort the rooms
    rooms = sortRoomsTabOrder(rooms);

    // Re-Tile them

    for (let i = 0; i < rooms.length; i++) {
      let params = await calcRoomParamsRetile(numRooms, i);

      let obj = {
        winId: rooms[i].windowId,
        url: rooms[i].linkFetchedUrl,
        width: params.width,
        height: params.height,
        top: params.top,
        left: params.left,
      };

      await chromeWindowsUpdate2(obj.winId, {
        state: "normal",
        drawAttention: true,
        focused: true,
        width: obj.width,
        height: obj.height,
        top: obj.top,
        left: obj.left,
      });

      await chromeTabsUpdate2(rooms[i].id, { active: true });

      // await sleep(500);
    }

    await sleep(100);

    obj = await chromeWindowsUpdate2(saveWinId, {
      focused: true,
    });

    // window.location.reload();
  } catch (err) {}
};

const filterHashRooms = (rooms) => {
  rooms = rooms.filter((room) => !room.url.includes("#breakout_testing"));
  return rooms;
};

const sortRoomsTabOrder = (rooms) => {
  try {
    if (rooms.length < 0) {
      return;
    }
    // Read the number of requested breakouts
    let numRooms = parseInt(document.querySelector("#meet-room-number").innerText);

    // Add one for the main room to get the total number of rooms
    numRooms++;

    let elems = [...document.querySelectorAll("#list-rooms-hook [data-room-id]")];
    elems = elems.filter((el, i) => i < numRooms); // zero index but Main plus breakouts

    let list = elems.map((el) => {
      return {
        name: el.querySelector('[data-type="name"]').value,
        url: el.querySelector('[data-type="link"]').dataset.linkFetchedUrl,
      };
    });
    // list = list.map((el) => el.toLowerCase());

    let rooms2 = [];

    for (let i = 0; i < list.length; i++) {
      let room = rooms.filter((el) => getMeetUrlBase(el.url) == getMeetUrlBase(list[i].url));

      if (room.length > 0) {
        rooms2.push(room[0]);
      }
    }

    return rooms2;
  } catch (err) {
    return rooms;
  }
};

const calcRoomParamsRetile = async (numRooms, roomNum) => {
  const roomWindows = {
    1: { rows: 1, cols: 1 },
    2: { rows: 1, cols: 2 },
    3: { rows: 2, cols: 2 },
    4: { rows: 2, cols: 2 },
    5: { rows: 2, cols: 3 },
    6: { rows: 2, cols: 3 },
    7: { rows: 3, cols: 4 },
    8: { rows: 3, cols: 4 },
    9: { rows: 3, cols: 4 },
    10: { rows: 3, cols: 4 },
    11: { rows: 3, cols: 4 },
    12: { rows: 3, cols: 4 },
    13: { rows: 4, cols: 4 },
    14: { rows: 4, cols: 4 },
    15: { rows: 4, cols: 4 },
    16: { rows: 4, cols: 4 },
    17: { rows: 4, cols: 5 },
    18: { rows: 4, cols: 5 },
    19: { rows: 4, cols: 5 },
    20: { rows: 4, cols: 5 },
    21: { rows: 4, cols: 6 },
    22: { rows: 4, cols: 6 },
    23: { rows: 4, cols: 6 },
    24: { rows: 4, cols: 6 },
    25: { rows: 5, cols: 6 },
    26: { rows: 5, cols: 6 },
    27: { rows: 5, cols: 6 },
    28: { rows: 5, cols: 6 },
    29: { rows: 5, cols: 6 },
    30: { rows: 5, cols: 6 },
  };

  let objWidthHeight = await chromeRuntimeSendMessage({
    action: "getAvailWidthHeight",
  });

  let scrW, scrH;

  if (objWidthHeight.height && objWidthHeight.width) {
    scrW = parseInt(objWidthHeight.width);
    scrW = parseInt(window.screen.availWidth);
    scrH = parseInt(objWidthHeight.height) + 23;
  } else {
    scrW = window.screen.availWidth;
    scrH = window.screen.availHeight;
  }

  // Not sure why not working, so keep the old way for retile
  scrW = window.screen.availWidth;
  scrH = window.screen.availHeight + 23;

  console.log(`availWidth: ${scrW}`);
  console.log(`availHeight: ${scrH}`);

  // let scrT = window.screen.availTop;
  // let scrL = window.screen.availLeft;

  let minW = 500;
  let minH = 500;

  // let scrXOff = 5;
  let scrYOff = 20;

  nRows = roomWindows[numRooms].rows;
  nCols = roomWindows[numRooms].cols;

  rowW = scrW / nCols > minW ? parseInt(scrW / nCols) : minW;
  colH = scrH / nRows > minH ? parseInt(scrH / nRows) : minH;

  xTotal = (roomNum - 1) * scrW;
  yTotal = (roomNum - 1) * scrH;

  let num = 0;
  let top, left, width, height;

  // Special case for 1 room, 80%
  if (numRooms == 1) {
    return {
      top: 0,
      left: parseInt(rowW * 0) + parseInt(window.screen.availLeft),
      // left: parseInt(rowW * 0.5),
      width: parseInt(rowW * 0.5),
      height: parseInt(colH * 1),
    };
  }

  // Typical case for multiple windows
  for (let row = 0; row < nRows; row++) {
    for (let col = 0; col < nCols; col++) {
      if (num === roomNum) {
        top = row * colH + (row - 0) * scrYOff;
        left = col * rowW;
        width = rowW;
        height = colH;

        if (left + width > scrW) left = scrW - width;
        if (top + height > scrH) top = scrH - height;

        return {
          top: top,
          left: left + parseInt(window.screen.availLeft),
          width: width,
          height: height,
        };
      }
      num++;
    }
  }
};

const syncGC = async (events) => {
  try {
    let mainLinkOld = document.querySelector('[data-room-id="0"] [type="url"]').value;

    let rooms = [];
    let className = document.querySelector("#meet-room-class").innerText;
    let boolSynced = false;
    let messageFail = `Information message:  Nothing was synced.  No Meet was found that was opened either through Google Classroom or via a code, therefore, nothing was synced.  This is not an error, but rather an information message that nothing was synced`;

    let messageSuccess;

    // rooms = chromeAllOpenRooms((boolGetReferrer = true));
    rooms = await chromeAllOpenRooms();
    // (boolOpen = false),
    // (tabId = 0),
    // (boolFilter = true),
    // (boolGetReferrer = true)

    if (!rooms || rooms.length < 1) {
      throw messageFail;
    }

    rooms = rooms.filter((el) => el.url != undefined);

    for (let i = 0; i < rooms.length; i++) {
      let obj = await chromeTabsSendMessage(rooms[i].id, {
        action: "getReferrer",
      });

      if (obj.referrer.startsWith("https://classroom.google.com/") || obj.referrer == "https://meet.google.com/") {
        document.querySelector('[data-room-id="0"] [type="url"]').value = rooms[i].url;

        let rooms2 = [...myBreakout.myRooms];
        rooms2[0].link = rooms[i].url;
        myBreakout.overwriteRooms(className, rooms2);

        await myBreakout.saveBreakout();

        // update slider
        await buildSlider();

        // update tab name;
        await chromeTabsSendMessage(rooms[i].id, {
          action: "updateTabTitle",
        });

        boolSynced = true;

        messageSuccess = `Success! The meet below was synced as your main room\n ${rooms[i].url}\n\nIf this is not correct, you can always copy and paste the URL of your meet main room into the Rooms tab/main room link field and then click save`;
      }
    }

    if (boolSynced) {
      updateDropdownsLists();
      throw messageSuccess;
    } else {
      throw messageFail;
    }
  } catch (err) {
    alert(err);
  }
};

const getNickFromLookup = (link) => {
  let nick = "";

  if (link.startsWith("https://meet.google.com/lookup/")) {
    let split = link.split("https://meet.google.com/lookup/");
    if (split && split[1]) {
      nick = split[1];
    }
  }

  return nick;
};

const getNicknameLinks = async (rooms, className) => {
  let boolNick = true;
  myBreakout.readClass(className);
  let classes = myBreakout.myClass;

  // Use a promise all (autoCreateLink with array version)
  // for (let i = 0; i < rooms.length; i++) {
  //   switch (rooms[i].linkType) {
  //     case "nick":
  //       rooms[i].linkFetchedUrl = await autoCreateLink((nick = rooms[i].link));
  //       break;

  //     case "nickGC":
  //       let myNick = getNickFromLookup(rooms[i].link);
  //       rooms[i].linkFetchedUrl = await autoCreateLink((nick = myNick));
  //       break;

  //     case "code":
  //       rooms[i].linkFetchedUrl = "https://meet.google.com/" + rooms[i].link;
  //       break;

  //     case "url":
  //       rooms[i].linkFetchedUrl = rooms[i].link;
  //       break;

  //     default:
  //       break;
  //   }
  // }

  let list = await autoCreateLinkArr(rooms);

  if (list && list.length > 0) {
    for (let i = 0; i < rooms.length; i++) {
      console.log(`list.name = ${list[i].name}, list.linkFetchedUrl = ${list[i].linkFetchedUrl}`);

      let item = list.filter((el) => el.name == rooms[i].name);

      if (item && item.length > 0) {
        rooms[i].linkFetchedUrl = item[0].linkFetchedUrl;
      }
    }
  }

  // Update breakout
  if (boolNick) {
    let rooms2 = myBreakout.myRooms.map((el) => {
      for (let i = 0; i < rooms.length; i++) {
        if (el.name == rooms[i].name) {
          el.link = rooms[i].link;
          el.linkFetchedUrl = rooms[i].linkFetchedUrl;
        }
      }
      return el;
    });

    myBreakout.overwriteRooms(classes.name, rooms2);
    myBreakout.myRooms = rooms2;
    myBreakout.myClass.rooms = rooms2;
    await myBreakout.saveBreakout();
    await updateDropdownsLists();
  }

  return rooms;
};

const getRefreshLinks = async (rooms, className) => {
  let refreshMain = [];
  let refreshBreakouts = [];
  myBreakout.readClass(className);
  let classes = myBreakout.myClass;

  // These are the rooms that need to be opened.
  // If a refreshed link is requested then first refresh them.
  if (myBreakout.settings.autoRefreshMain) {
    refreshMain = rooms.filter((el) => {
      if (el.linkType == "url" && el.link == classes.rooms[0].link) {
        el.link = "";
        return true;
      } else {
        return false;
      }
    });
  }

  if (myBreakout.settings.autoRefreshBreakouts) {
    refreshBreakouts = rooms.filter((el) => {
      if (el.linkType == "url" && el.link != classes.rooms[0].link) {
        el.link = "";
        return true;
      } else {
        return false;
      }
    });
  }

  let refresh = [];
  refreshMain.map((el) => refresh.push(el));
  refreshBreakouts.map((el) => refresh.push(el));

  refresh = [...new Set(refresh)];

  if (refresh.length > 0) {
    // let rooms = classes.rooms;
    // for (let i = 0; i < rooms.length; i++) {
    //   let test = refresh.filter((el) => el.link == rooms[i].link);

    //   if (test.length > 0) {
    //     rooms[i].link = await autoCreateLink(rooms[i].code);
    //   }
    // }

    refresh = await autoCreateLinkArr(refresh);

    // Update rooms with new refresh
    // rooms = classes.rooms;

    for (let i = 0; i < rooms.length; i++) {
      let test = refresh.filter((el) => el.name == rooms[i].name);

      if (test.length > 0) {
        rooms[i].link = test[0].linkFetchedUrl;
        rooms[i].linkFetchedUrl = test[0].linkFetchedUrl;
      }
    }

    // Update breakout
    let rooms2 = myBreakout.myRooms.map((el) => {
      for (let i = 0; i < rooms.length; i++) {
        if (el.name == rooms[i].name) {
          el.link = rooms[i].link;
          el.linkFetchedUrl = rooms[i].linkFetchedUrl;
        }
      }
      return el;
    });
    myBreakout.overwriteRooms(classes.name, rooms2);
    myBreakout.myRooms = rooms2;
    myBreakout.myClass.rooms = rooms2;
    await myBreakout.saveBreakout();
    await updateDropdownsLists();
  }
  return rooms;
};

const setSpinners = (bool) => {
  let spinners = document.querySelectorAll('[role="status"]');

  // Turn on spinner
  if (bool) {
    for (let i = 0; i < spinners.length; i++) {
      spinners[i].classList.remove("d-none");
    }

    // Turn off spinner
  } else {
    for (let i = 0; i < spinners.length; i++) {
      spinners[i].classList.add("d-none");
    }
  }
};

const getMeetUrlBase = (url) => {
  let urlBase = url;

  let regexMask = /https:\/\/meet.google.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}/;
  let regexSplit = regexMask.exec(url);

  if (regexSplit && regexSplit.length > 0) {
    urlBase = regexSplit[0];
  }

  return urlBase;
};

// Write Lines in Report
const reportWriteLine = async (tabId, str) => {
  let payload = {};
  payload.code = `document.writeln(\`${str}\`)`;

  // 2023-08-30
  await chromeTabsExecuteScript(tabId, payload);
};

// Write Lines in Report
const reportWrite = async (tabId, reportTitle, strArr) => {
  await sleep(2000);

  let arr = [reportTitle, ...strArr];
  // await chromeStorageLocalSet({ breakoutReport: arr });
  // let { breakoutReport: strArr2 } = await chromeStorageLocalGet("breakoutReport");

  let writeReportLines = async (strArr) => {
    // Get the Array
    // let { breakoutReport: strArr } = await chromeStorageLocalGet("breakoutReport");
    // Print the Array
    document.title = strArr[0];
    for (let i = 1; i < strArr.length; i++) {
      document.writeln(`${strArr[i]}`);
    }
  };

  // 2023-08-30 comment out because of v3 violation?
  // chrome.scripting.executeScript(
  //   {
  //     target: { tabId: tabId },
  //     function: writeReportLines,
  //     args: [arr],
  //   },
  //   () => {}
  // );

  payload = {
    target: { tabId: tabId },
    function: writeReportLines,
    args: [arr],
  };

  await chromeTabsExecuteScriptFunction(payload);
};

// Breakout Rooms Status Report
const handleStatusRooms = async (evt) => {
  // 2023-08-30

  let listAssigned = [];
  let listActual = [];
  let strArr = [];

  // Get the assigned list of rooms
  await buildMeetMainPptListing();

  let assignedRaw = getAssignPptGroup("a", "b", false);

  if (assignedRaw.list && assignedRaw.list.length > 0) {
    listAssigned = assignedRaw.list;
  }

  // Get the actual list of rooms
  let rooms = await chromeAllOpenRooms();
  rooms = filterExtensionRooms(rooms);
  rooms = sortRoomsTabOrder(rooms);

  let pptMe = [];

  for (let i = 0; i < rooms.length; i++) {
    let { ppt } = await chromeTabsSendMessage(rooms[i].id, {
      action: "getPpt",
    });

    // ppt = ppt.filter((el) => el.me != true);
    pptMe = ppt.filter((el) => el.me == true);
    ppt = ppt.filter((el) => el.me != true);

    listActual.push({ roomName: rooms[i].title, list: ppt });
  }

  // Filter out the me
  for (let i = 0; i < listActual.length; i++) {
    if (listActual[i].list) {
      listActual[i].list = listActual[i].list.filter((el) => {
        let bool = true;
        for (let j = 0; j < pptMe.length; j++) {
          if (el.url == pptMe[j].url) {
            bool = false;
          }
        }

        return bool;
      });
    }
  }

  // *** Translation added *** 12/2020
  let mainName = getMainName();
  listActual = listActual.filter((el) => el.roomName != mainName);
  // listActual = listActual.filter((el) => el.roomName != "Main");

  let report = [];

  for (let i = 0; i < listActual.length; i++) {
    let students = [];
    for (let j = 0; j < listActual[i].list.length; j++) {
      students.push(listActual[i].list[j].name);
    }
    report.push({
      actualRoom: listActual[i].roomName,
      actualStudents: students,
    });
  }

  for (let i = 0; i < report.length; i++) {
    let row = listAssigned.filter((el) => el.roomName == report[i].actualRoom);

    report[i].assignedStudents = [];

    if (row.length > 0) {
      for (let j = 0; j < row[0].ppt.length; j++) {
        report[i].assignedStudents.push(row[0].ppt[j].name);
      }
    }
  }

  for (let i = 0; i < report.length; i++) {
    report[i].actualStudents.sort();
    report[i].assignedStudents.sort();
  }

  //Create a new one if already exists (close old one)
  let reportsOld = await chromeGetReportPopup("#status-rooms");

  if (reportsOld) {
    for (let i = 0; i < reportsOld.length; i++) {
      chrome.tabs.remove(reportsOld[i].id);
    }
  }

  // Create the report popup
  let obj2 = await chromeWindowsCreate({
    url: "https://meet.google.com/#status-rooms",
    width: parseInt(screen.width / 4),
    left: parseInt(screen.width / 4),
    // url: `javascript:document.write("<h1>hi</h1>")`,
    type: "popup",
  });

  tabId = obj2.tabs[0].id;

  // Build the report head
  str = ` 
        <html lang='en'>

        <head>
          <meta charset='UTF-8'>
          <meta name='viewport' content='width=device-width' initial-scale='1.0'>
          <meta http-equiv='X-UA-Compatible' content='ie=edge'>
          <link rel='stylesheet' href='https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css'
            integrity='sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T' crossorigin='anonymous'>
          <title></title>
        </head>

        <body class="mt-2" >`;

  strArr.push(str);
  // await reportWriteLine(tabId, str);

  // Window title
  let rptTitleBRSR = chrome.i18n.getMessage("rptTitleBRSR");
  let rptBreakoutRoom = chrome.i18n.getMessage("rptBreakoutRoom");
  let rptActualStudent = chrome.i18n.getMessage("rptActualStudent");
  let rptAssignStudent = chrome.i18n.getMessage("rptAssignStudent");

  rptTitleBRSR = rptTitleBRSR ? rptTitleBRSR : "Breakout Rooms Status Report";
  rptBreakoutRoom = rptBreakoutRoom ? rptBreakoutRoom : "Breakout Room";
  rptActualStudent = rptActualStudent ? rptActualStudent : "Actual Student";
  rptAssignStudent = rptAssignStudent ? rptAssignStudent : "Assigned Student";

  let reportTitle = document.querySelector("#meet-room-class").innerText + " " + rptTitleBRSR;

  // await chromeTabsExecuteScript(tabId, {
  //   code: `document.title = \`${reportTitle}\``,
  // });

  // Header stuff
  let reportDate = new Date();

  str = `<table class="table table-striped table-responsive-sm  ">
          <h2 class='text-center mb-4'>${reportTitle}</h2>
          <h4 class='text-center mb-4'>${reportDate.toLocaleString()}</h4>
          <thead class="thead-dark">
            <tr>
              <th scope="col">#</th>
              <th scope="col" class="text-center">${rptBreakoutRoom}</th>
              <th scope="col" class="text-center" >${rptActualStudent}</th>
              <th scope="col" class="text-center">${rptAssignStudent}</th>
            </tr>
          </thead>
          <tbody>`;

  strArr.push(str);
  // await reportWriteLine(tabId, str);

  // Build the report

  i = 0;
  rowCounter = 0;
  try {
    do {
      j = 0;
      if (!report[i].actualStudents) {
        // if (report[i].actualStudents.length < 0) {
        report[i].actualStudents = [];
      }

      do {
        // Get the actual student entry
        let actualStudent = report[i].actualStudents[j] ? report[i].actualStudents[j] : "";

        // If no assigned then create blank array
        if (!report[i].assignedStudents.length) {
          // if (report[i].assignedStudents.length < 0) {
          report[i].assignedStudents = [];
        }

        // Look for a match, if none then ''
        let assignedStudent = "";
        for (let n = 0; n < report[i].assignedStudents.length; n++) {
          if (actualStudent == report[i].assignedStudents[n]) {
            assignedStudent = report[i].assignedStudents[n];
            break;
          }
        }

        // Filter out this entry
        report[i].assignedStudents = report[i].assignedStudents.filter((el) => el != actualStudent);

        // Write the row entry
        let rowColor = "";
        if (actualStudent != assignedStudent) {
          rowColor = "table-danger";
        }
        rowCounter++;

        str = `<tr class='${rowColor}'>
                <th scope="row">${rowCounter}</th>
                <td class="text-center">${report[i].actualRoom}</td>
                <td class="text-center">${actualStudent}</td>
                <td class="text-center">${assignedStudent}</td>
               </tr>`;

        if (!(actualStudent == "" && assignedStudent == "")) {
          strArr.push(str);
          // await reportWriteLine(tabId, str);
        }

        j++;
      } while (j < report[i].actualStudents.length);

      for (let k = 0; k < report[i].assignedStudents.length; k++) {
        let rowColor = "table-danger";
        rowCounter++;

        str = `<tr class='${rowColor}'>
                  <th scope="row">${rowCounter}</th>
                  <td class="text-center">${report[i].actualRoom}</td>
                  <td class="text-center"></td>
                  <td class="text-center">${report[i].assignedStudents[k]}</td>
                </tr>`;

        if (report[i].assignedStudents[k] != "") {
          strArr.push(str);
          // await reportWriteLine(tabId, str);
        }
      }

      i++;
    } while (i < report.length);
  } catch (err) {}

  str = `</tbody>
         </table>        
         </body>
        </html>`;

  strArr.push(str);
  // await reportWriteLine(tabId, str);
  await reportWrite(tabId, reportTitle, strArr);
};

// Student Status Report
const handleStatusStudents = async (evt) => {
  // 2023-08-30

  let listAssigned = [];
  let listActual = [];
  let strArr = [];

  // Get the assigned list of rooms
  await buildMeetMainPptListing();

  let assignedRaw = getAssignPptGroup("a", "b", false);

  if (assignedRaw.list && assignedRaw.list.length > 0) {
    listAssigned = assignedRaw.list;
  }

  // Get the actual list of rooms
  let rooms = await chromeAllOpenRooms();
  rooms = filterExtensionRooms(rooms);
  rooms = sortRoomsTabOrder(rooms);

  let pptMe = [];

  for (let i = 0; i < rooms.length; i++) {
    let { ppt } = await chromeTabsSendMessage(rooms[i].id, {
      action: "getPpt",
    });

    // ppt = ppt.filter((el) => el.me != true);
    pptMe = ppt.filter((el) => el.me == true);

    ppt = ppt.filter((el) => el.me != true);

    listActual.push({ roomName: rooms[i].title, list: ppt });
  }

  // Filter out the me
  for (let i = 0; i < listActual.length; i++) {
    if (listActual[i].list) {
      listActual[i].list = listActual[i].list.filter((el) => {
        let bool = true;
        for (let j = 0; j < pptMe.length; j++) {
          if (el.url == pptMe[j].url) {
            bool = false;
          }
        }

        return bool;
      });
    }
  }

  let report = [];

  for (let i = 0; i < listActual.length; i++) {
    if (listActual[i].list) {
      for (let j = 0; j < listActual[i].list.length; j++) {
        el = listActual[i].list[j];
        report.push({ name: el.name });
      }
    }
  }

  for (let i = 0; i < listAssigned.length; i++) {
    if (listAssigned[i].ppt) {
      for (let j = 0; j < listAssigned[i].ppt.length; j++) {
        el = listAssigned[i].ppt[j];
        report.push({ name: el.name });
      }
    }
  }

  report = report.filter(
    (el, index, self) => index === self.findIndex((t) => t.name === el.name)
    // index === self.findIndex((t) => t.id === el.id && t.name === el.name)
  );

  const compare = (a, b) => {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  };

  report.sort(compare);

  for (let i = 0; i < report.length; i++) {
    // Actuals
    report[i].actual = [];

    for (let j = 0; j < listActual.length; j++) {
      for (let k = 0; k < listActual[j].list.length; k++) {
        if (listActual[j].list[k].name == report[i].name) {
          report[i].actual.push(listActual[j].roomName);
        }
      }
    }

    // Assigned
    report[i].assigned = [];

    for (let j = 0; j < listAssigned.length; j++) {
      if (listAssigned[j].ppt) {
        for (let k = 0; k < listAssigned[j].ppt.length; k++) {
          if (listAssigned[j].ppt[k].name == report[i].name) {
            report[i].assigned.push(listAssigned[j].roomName);
          }
        }
      }
    }
  }

  //Create a new one if already exists (close old one)
  let reportsOld = await chromeGetReportPopup("#status-students");

  if (reportsOld && reportsOld.length > 0) {
    for (let i = 0; i < reportsOld.length; i++) {
      chrome.tabs.remove(reportsOld[i].id);
    }
  }

  // Create the report popup
  let obj2 = await chromeWindowsCreate({
    url: "https://meet.google.com/#status-students",
    width: parseInt(screen.width / 4),
    left: 0,
    // url: `javascript:document.write("<h1>hi</h1>")`,
    type: "popup",
  });

  tabId = obj2.tabs[0].id;

  // Build the report head
  str = ` 
        <html lang='en'>

        <head>
          <meta charset='UTF-8'>
          <meta name='viewport' content='width=device-width' initial-scale='1.0'>
          <meta http-equiv='X-UA-Compatible' content='ie=edge'>
          <link rel='stylesheet' href='https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css'
            integrity='sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T' crossorigin='anonymous'>
          <title></title>
        </head>

        <body class="mt-2" >`;

  // Add it to strArr
  strArr.push(str);
  // await reportWriteLine(tabId, str);

  // Window title
  let rptTitleSSR = chrome.i18n.getMessage("rptTitleSSR");
  let rptStudent = chrome.i18n.getMessage("rptStudent");
  let rptMain = chrome.i18n.getMessage("rptMain");
  let rptActualRoom = chrome.i18n.getMessage("rptActualRoom");
  let rptAssignRoom = chrome.i18n.getMessage("rptAssignRoom");
  let rptYes = chrome.i18n.getMessage("rptYes");
  let rptNo = chrome.i18n.getMessage("rptNo");

  rptTitleSSR = rptTitleSSR ? rptTitleSSR : "Student Status Report";
  rptStudent = rptStudent ? rptStudent : "Student";
  rptMain = rptMain ? rptMain : "Main";
  rptActualRoom = rptActualRoom ? rptActualRoom : "Actual Breakout Room";
  rptAssignRoom = rptAssignRoom ? rptAssignRoom : "Assigned Breakout Room";
  rptYes = rptYes ? rptYes : "Y";
  rptNo = rptNo ? rptNo : "N";

  let reportTitle = document.querySelector("#meet-room-class").innerText + " " + rptTitleSSR;

  // await chromeTabsExecuteScript(tabId, {
  //   code: `document.title = \`${reportTitle}\``,
  // });

  // Header stuff
  let reportDate = new Date();

  str = `<table class="table table-striped">
          <h2 class='text-center mb-4'>${reportTitle}</h2>
          <h4 class='text-center mb-4'>${reportDate.toLocaleString()}</h4>
          <thead class="thead-dark">
            <tr>
              <th scope="col">#</th>
              <th scope="col">${rptStudent}</th>
              <th scope="col">${rptMain}</th>
              <th scope="col" class="text-center" >${rptActualRoom}</th>
              <th scope="col" class="text-center">${rptAssignRoom}</th>
            </tr>
          </thead>
          <tbody>`;

  strArr.push(str);
  // await reportWriteLine(tabId, str);

  // Filter out the main room
  let mainName = getMainName();

  for (let i = 0; i < report.length; i++) {
    // report[i].actual = report[i].actual.filter((el) => el != "Main");
    report[i].flagMain = "N";

    if (report[i].actual && report[i].actual.length > 0) {
      report[i].flagMain = report[i].actual.includes(mainName) ? rptYes : rptNo;
      report[i].actual = report[i].actual.filter((el) => el != mainName);
    }
  }

  // Build the report
  try {
    i = 0;
    do {
      j = 0;
      do {
        k = 0;
        let actualRoom = report[i].actual[j] ? report[i].actual[j] : "";
        // if (actualRoom != "Main") {
        do {
          let assignedRoom = report[i].assigned[k] ? report[i].assigned[k] : "";
          let rowColor = "";
          if (actualRoom != assignedRoom) {
            rowColor = "table-danger";
          }
          str = `<tr class='${rowColor}'>
                      <th scope="row">${i + 1}</th>
                      <td>${report[i].name}</td>
                      <td class="text-center">${report[i].flagMain}</td>
                      <td class="text-center">${actualRoom}</td>
                      <td class="text-center">${assignedRoom}</td>
                    </tr>`;
          strArr.push(str);
          // await reportWriteLine(tabId, str);
          k++;
        } while (k < report[i].assigned.length);
        // }
        j++;
      } while (j < report[i].actual.length);
      i++;
    } while (i < report.length);
  } catch (err) {}

  str = `</tbody>
         </table>        
         </body>
        </html>`;

  strArr.push(str);
  // await reportWriteLine(tabId, str);

  await reportWrite(tabId, reportTitle, strArr);
};
