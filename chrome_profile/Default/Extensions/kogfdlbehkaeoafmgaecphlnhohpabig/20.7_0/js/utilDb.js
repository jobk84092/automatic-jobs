//  Database util

const initDatabase = async () => {
  // breakout object
  // await sleep(5000);
  // debugger;
  let { breakout: test } = await chromeStorageLocalGet("breakout");

  // await sleep(5000);

  if (test == undefined) {
    let msgText = chrome.i18n.getMessage("myCourse");
    let myCourse = msgText ? msgText : "My Course";
    let msgText2 = chrome.i18n.getMessage("myCourseDesc");
    let myCourseDesc = msgText2 ? msgText2 : "My Own Course";
    let mainName = chrome.i18n.getMessage("mainName") ? chrome.i18n.getMessage("mainName") : "Main";

    test = {
      classes: [
        {
          name: myCourse,
          desc: myCourseDesc,
          rooms: [
            {
              name: mainName,
              link: "",
              linkType: "url", // nick, nickGC, code, url
              linkFetchedUrl: "",
            },
          ],
        },
      ],
      settings: {
        tile: true,
        maxTabs: 15,
        autoEnter: false,
        newMute: true,
        autoJoinMain: true,
        autoJoinBreakouts: true,
        autoRefreshMain: false,
        autoRefreshBreakouts: false,
        allowSimult: false,
        lowMemoryFlag: false,
        meetClassName: myCourse,
        meetNumRooms: 1,
        themeId: "dracula-white-dark",
        toolbarSolid: true,
        // toolbarSolidColor: "cornflowerblue",
        toolbarSolidColor: "DarkBlue_Dracula",
        toolbarGradLeftColor: "BurntOrange",
        toolbarGradRightColor: "White",
        pairings: [],
        sliderBg: {
          url: "",
          size: "Cover",
          position: "Center Center",
          fgcolor: "Black",
          bgcolor: "LightGreen",
        },
        broadcastBg: {
          url: "",
          size: "Cover",
          position: "Center Center",
          fgcolor: "Black",
          bgcolor: "LightBlue",
        },
      },
    };
  }

  // If no theme chosen, then use the 'classic-light'
  if (test.settings.themeId == "") {
    test.settings.themeId = "classic-light";
  }
  // Override to true for the new audio setting Feb 21, 2022
  test.settings.newMute = true;

  // Initialize new values
  for (let i = 0; i < test.classes; i++) {
    for (let j = 0; j < test.classes[i].rooms.length; j++) {
      if (test.classes[i].rooms[j].name == undefined) {
        test.classes[i].rooms[j].name = "";
      }
      if (test.classes[i].rooms[j].link == undefined) {
        test.classes[i].rooms[j].link = "";
      }
      if (test.classes[i].rooms[j].linkType == undefined) {
        test.classes[i].rooms[j].linkType = "";
      }
      if (test.classes[i].rooms[j].linkFetchedUrl == undefined) {
        test.classes[i].rooms[j].linkFetchedUrl = "";
      }
    }
  }
  if (test.settings.pairings == undefined) {
    test.settings.pairings = [];
  }
  if (test.settings.sliderBg == undefined || Array.isArray(test.settings.sliderBg)) {
    test.settings.sliderBg = {
      url: "",
      size: "Cover",
      position: "Center Center",
      fgcolor: "Black",
      bgcolor: "LightGreen",
    };
  }
  if (test.settings.broadcastBg == undefined || Array.isArray(test.settings.broadcastBg)) {
    test.settings.broadcastBg = {
      url: "",
      size: "Cover",
      position: "Center Center",
      fgcolor: "Black",
      bgcolor: "LightBlue",
    };
  }
  if (test.settings.autoJoinMain == undefined) {
    test.settings.autoJoinMain = true;
  }
  if (test.settings.autoJoinBreakouts == undefined) {
    test.settings.autoJoinBreakouts = true;
  }
  if (test.settings.autoRefreshMain == undefined) {
    test.settings.autoRefreshMain = false;
  }
  if (test.settings.autoRefreshBreakouts == undefined) {
    test.settings.autoRefreshBreakouts = false;
  }
  if (test.settings.lowMemoryFlag == undefined) {
    test.settings.lowMemoryFlag = false;
  }
  // new mute
  if (test.settings.newMute == undefined) {
    test.settings.newMute = true;
  }

  await chromeStorageLocalSet({ breakout: test });

  let { breakout: test2 } = await chromeStorageLocalGet("breakout");

  let tempBreakout = Object.create(breakoutObject);
  tempBreakout.classes = [...test2.classes];
  tempBreakout.settings = { ...test2.settings };
  tempBreakout.assign = { ...test2.assign };

  return tempBreakout;
};

// const sav
// ********************************

const breakoutObject = {
  classes: [],

  settings: [],

  readClass(className) {
    this.myClass = [];
    this.classes.forEach((el, i) => {
      if (el.name == className) {
        this.myClass = el;
      }
    });
  },

  updateClass(className, obj) {
    // Update existing record based on match with className
    this.classes.forEach((el, i) => {
      if (el.name == className) {
        this.classes[i] = { ...this.classes[i], ...obj };
      }
    });
  },

  overwriteClasses(classesArr) {
    classArrTemplate = [{ nameKey: "", class: "" }];
    let classesNew = [];
    classesArr.forEach((el, i) => {
      this.readClass(el.nameKey);
      newClassArrObj = [{ ...this.myClass, ...el.class }];
      classesNew = [...classesNew, ...newClassArrObj];
    });

    this.classes = classesNew;
  },

  readRooms(className) {
    let list = this.classes.filter((el) => el.name == className);
    if (list && list.length > 0) {
      this.myRooms = list[0].rooms;
    } else {
      this.myRooms = [];
    }

    if (!this.myRooms || this.myRooms.length < 1) {
      this.myRooms = [];
    }
    // this.myRooms = this.classes.filter((el) => el.name == className)[0].rooms;
  },

  overwriteRooms(className, roomsArr) {
    this.readClass(className);
    this.myClass.rooms = [...roomsArr];
    this.updateClass(className, this.myClass);
  },

  // this appears to be a problem...settings parameter is not used coz it is global
  overwriteSettings(settings) {
    this.settings = setttings;
  },

  readSettings() {
    return this.settings;
  },

  async saveBreakout() {
    await chromeStorageLocalSet({ breakout: this });
  },
};
