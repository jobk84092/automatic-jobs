const clickMeetClass = async (nameKey) => {
  let hook = document.querySelector("#dropdown-meet-class-hook");
  let children = [...hook.childNodes].filter((el) => el.nodeName != "#text");

  children.forEach((el) => {
    if (el.dataset.classNameKey == nameKey) {
      el.classList.add("active");
      selectedClass = el;
    } else {
      el.classList.remove("active");
    }
  });

  selectedClass.click();
};

const clickRoomsClass = async (nameKey) => {
  let hook = document.querySelector("#dropdown-rooms-class-hook");
  let children = [...hook.childNodes].filter((el) => el.nodeName != "#text");

  children.forEach((el) => {
    if (el.dataset.classNameKey == nameKey) {
      el.classList.add("active");
      selectedClass = el;
    } else {
      el.classList.remove("active");
    }
  });

  selectedClass.click();
};

const clickClassesClass = async (nameKey) => {
  let hook = document.querySelector("#list-classes-hook");
  let children = [...hook.childNodes].filter((el) => el.nodeName != "#text");

  children.forEach((el) => {
    if (el.dataset.classNameKey == nameKey) {
      el.classList.add("active");
      selectedClass = el;
    } else {
      el.classList.remove("active");
    }
  });

  selectedClass.click();
};

const updateDropdownsLists = async () => {
  // await chrome.storage.local.remove("breakout");
  // await sleep(5000);
  // debugger;

  myBreakout2 = await initDatabase();
  myBreakout = Object.create(breakoutObject);
  myBreakout.classes = [...myBreakout2.classes];
  myBreakout.settings = { ...myBreakout2.settings };
  myBreakout.assign = { ...myBreakout2.assign };

  if (myBreakout.settings.themeId == undefined) {
    myBreakout.settings.themeId = "classic-light";
  }

  updateThemeDisplay(myBreakout.settings.themeId);

  if (myBreakout.classes.length < 1) {
    myBreakout.classes = [];
    let msgText = chrome.i18n.getMessage("myCourse");
    let myCourse = msgText ? msgText : "My Course";
    let msgText2 = chrome.i18n.getMessage("myCourseDesc");
    let myCourseDesc = msgText2 ? msgText2 : "My Own Course";

    myBreakout.classes[0] = { name: myCourse, desc: myCourseDesc };
  }

  updateToolBarColorSettings();

  // Fix the slider title
  // try {
  // let sliderTitle = document.querySelector("#slider-title");
  // let sliderRooms = [...document.querySelectorAll("[data-goto]")];
  // sliderName = sliderRooms.filter(
  //   (el) => el.dataset.link == sliderTitle.dataset.link
  // );

  // if (sliderName.length > 0) {
  //   sliderTitle.innerText = sliderName[0].innerText.trim();
  // } else {
  //   sliderTitle.innerText = "Breakout Rooms";
  // }
  // } catch (err) {}

  let {
    maxTabs,
    themeId,
    tile,
    newMute,
    autoEnter,
    autoJoinMain,
    autoJoinBreakouts,
    autoRefreshMain,
    autoRefreshBreakouts,
    allowSimult,
    meetClassName,
    meetNumRooms,
    toolbarSolid,
    lowMemoryFlag,
    sliderBg,
    broadcastBg,
  } = myBreakout.settings;

  //Set the google account
  let accountName = await getDefaultAccount();

  let msg = chrome.i18n.getMessage("defaultAccount");
  document.querySelector("[data-span-meet-account-name]").innerText = "";

  if (msg) {
    document.querySelector("[data-msg-default-account]").innerHTML = `&nbsp ${msg} <span data-span-meet-account-name>${accountName}</span>`;
  }

  // if (msg) {
  //   document.querySelector("[data-msg-default-account]").innerHTML = `&nbsp ${msg} <span data-span-meet-account-name>${accountName}</span>`;
  //   document.querySelector("[data-span-meet-account-name]").innerText = '';
  // } else {
  //   document.querySelector("[data-span-meet-account-name]").innerText = accountName;
  // }

  // document.querySelector(
  //   "[data-span-rooms-account-name]"
  // ).innerText = accountName;

  // Set the general tab-tile selection
  updateSliderBG();
  updateBroadcastBG();

  // document.querySelector("#slider-bg-position") = sliderBg.position;
  // document.querySelector("#slider-bg-size") = sliderBg.size;
  // document.querySelector("#slider-bg-fgcolor") = sliderBg.fgcolor;
  // document.querySelector("#slider-bg-bgcolor") = sliderBg.bgcolor;

  document.querySelector("#low-memory-option").checked = lowMemoryFlag;
  document.querySelector("#auto-enter").checked = autoEnter;
  document.querySelector("#new-mute").checked = newMute;
  document.querySelector("#auto-join-main").checked = autoJoinMain;
  document.querySelector("#auto-join-breakouts").checked = autoJoinBreakouts;
  document.querySelector("#auto-refresh-main").checked = autoRefreshMain;
  document.querySelector("#auto-refresh-breakouts").checked = autoRefreshBreakouts;
  document.querySelector("#allow-simult").checked = allowSimult;

  if (tile) {
    document.querySelector("#breakout-tiles").checked = true;
    document.querySelector("#breakout-tabs").checked = false;
  } else {
    document.querySelector("#breakout-tiles").checked = false;
    document.querySelector("#breakout-tabs").checked = true;
  }

  // maxtabs
  [...document.querySelectorAll("a[data-general-maxtabs]")].map((el) => {
    el.dataset.generalMaxtabs == maxTabs ? el.classList.add("active") : el.classList.remove("active");
  });

  let textSel = maxTabs == "0" ? "No Limit" : `${maxTabs} Tabs`;
  document.querySelector("#general-maxtabs-text").innerText = textSel;

  // theme
  [...document.querySelectorAll("a[data-general-theme-id]")].map((el) => {
    el.dataset.generalThemeId == themeId ? el.classList.add("active") : el.classList.remove("active");
  });

  themeName = document.querySelector(`a[data-general-theme-id=${themeId}]`)?.innerText;

  document.querySelector("#general-predefined-theme-sel").innerText = themeName;
  document.querySelector("#general-predefined-theme-sel").dataset.generalThemeIdSel = themeId;

  // Colors radio buttons
  if (toolbarSolid) {
    document.querySelector("#toolbar-solid").checked = true;
    document.querySelector("#toolbar-grad").checked = false;
  } else {
    document.querySelector("#toolbar-solid").checked = false;
    document.querySelector("#toolbar-grad").checked = true;
  }

  // Read classes
  let classes = myBreakout.classes;

  if (classes.filter((el) => el.name == meetClassName)[0]) {
    name = classes.filter((el) => el.name == meetClassName)[0].name;
  } else {
    meetClassName = classes[0].name;
  }

  // Read rooms for the meetClassName
  myBreakout.readRooms(meetClassName);
  let rooms = myBreakout.myRooms;

  if (parseInt(meetNumRooms) > 0 && parseInt(meetNumRooms) <= rooms.length) {
    numRooms = parseInt(meetNumRooms);
  } else {
    numRooms = 0;
  }

  // The first room is the main room, not the breakout
  // if (numRooms >= rooms.length) {
  //   numRooms = numRooms - 1;
  // }

  // meetNumRooms = numRooms;

  // Populate meet class dropdowns
  buildMeetClassDropdown(meetClassName, classes);

  // Populate meet room dropdowns
  let selectedCourse = document.querySelector('#meet2 [data-class-id="0"]').innerText;
  let pairings = myBreakout.settings.pairings;
  let numBreakouts = numRooms;

  if (pairings.length > 0) {
    pairings = pairings.filter((el) => el.course == selectedCourse);
    if (pairings.length > 0) {
      numBreakouts = pairings[0].num;
    }
  }

  buildMeetNumRoomsDropdown(numBreakouts, rooms);

  // buildMeetNumRoomsDropdown(meetNumRooms, rooms);

  // Populate rooms class dropdown
  buildRoomsClassDropdown(meetClassName, classes);

  buildMeetRoomList(numBreakouts, rooms);

  // Populate rooms list
  buildRoomsRoomList(rooms);

  // Populate classes list
  buildClassesClassList(classes);

  updateOpenButtons();

  // update slider
  await buildSlider();

  // Set room-open classes on buttons
  await updateMeetButtonOpenClass();

  updateSpanCourseNum();

  updateChooseCourseLabel(selectedCourse, numBreakouts);
};

// Alert Message
const alertMessage = (text, classType, id, category = "rooms", waitTime = 2000) => {
  document.querySelector(id).classList.remove("alert-danger", "alert-warning", "alert-success", "alert-progress", "alert-info");
  // document.querySelector(id).classList.add("d-none");
  document.querySelector(id).innerHTML = `${text}`;
  document.querySelector(id).classList.add(classType);

  if (category == "classes") {
    textMsg = chrome.i18n.getMessage("enterCourses") ? chrome.i18n.getMessage("enterCourses") : "Enter the list of your courses";
  } else {
    textMsg = chrome.i18n.getMessage("firstRoomMain") ? chrome.i18n.getMessage("firstRoomMain") : `The first room is your Main room, the rest are Breakouts`;
  }

  setTimeout(
    () => {
      document.querySelector(id).classList.remove(classType);
      document.querySelector(id).classList.add("alert-info");
      document.querySelector(id).innerHTML = textMsg;
    },
    waitTime,
    textMsg
  );
};

// Sort plugin
let listRoomsHook = document.querySelector("#list-rooms-hook");

Sortable.create(listRoomsHook, {
  sort: "true",
  animation: 150,
});

let listClassesHook = document.querySelector("#list-classes-hook");

Sortable.create(listClassesHook, {
  sort: "true",
  animation: 150,
});

const closeOpenMeetsAccordian = (event) => {
  const accordian = document.querySelector("#meet-open-accordian");
  accordian.click();
};
