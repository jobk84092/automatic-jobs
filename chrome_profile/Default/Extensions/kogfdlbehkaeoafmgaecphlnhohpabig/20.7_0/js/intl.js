const getDefaultAccount = async () => {
  // return true;

  try {
    let doc = document.createElement("html");

    // doc.innerHTML = await myFetch2(
    //   "https://accounts.google.com/SignOutOptions"
    // );

    // doc.innerHTML = await fetch(`https://accounts.google.com/SignOutOptions`, {
    //   credentials: "include",
    //   headers: { "Content-Type": "application/text" },
    // }).then((response) => response.text());
    doc.innerHTML = await fetch(`https://accounts.google.com/SignOutOptions`).then((response) => response.text());

    let userAccounts = doc.querySelectorAll("#account-list [name='Email']");

    if (userAccounts && userAccounts.length > 0) {
      return userAccounts[0].value;
    } else {
      return "*** Not Logged In ***";
    }
  } catch (err) {
    return true;
  }
};

let intlMsg = (search, msg, addSpace = "") => {
  try {
    let string = `[data-msg-${search}]`;
    let msgText = chrome.i18n.getMessage(msg);
    document.querySelector(string).innerHTML = msgText ? `${addSpace} ${msgText}` : document.querySelector(string).innerText;
  } catch (error) {}
};

let intlMsgText = (search, msg, addSpace = "") => {
  try {
    let string = `[data-msg-${search}]`;
    let msgText = chrome.i18n.getMessage(msg);
    document.querySelector(string).innerText = msgText ? `${msgText}` : document.querySelector(string).innerText;
  } catch (error) {}
};
intlMsg("alert-rooms-enter", "firstRoomMain");

intlMsg("title", "title");
intlMsg("meet", "meet");
intlMsg("rooms", "rooms");
intlMsg("courses", "courses");
intlMsg("settings", "settings");
intlMsg("my-name", "myName");

intlMsg("default-account", "defaultAccount", "&nbsp");
intlMsg("default-account2", "defaultAccount", "&nbsp");

intlMsg("audio-headline", "audioHeadline");
intlMsg("audio-fix-title", "audioFixTitle");
intlMsg("audio-fix-intro", "audioFixIntro");
intlMsg("audio-fix-first", "audioFixFirst");

intlMsg("audio-fix-optin", "audioFixOptin");
intlMsg("audio-fix-optin1", "audioFixOptin1");
intlMsg("audio-fix-optin2", "audioFixOptin2");
intlMsg("audio-fix-optin3", "audioFixOptin3");

intlMsg("audio-fix-second", "audioFixSecond");
intlMsg("audio-fix-fallback", "audioFixFallback");
intlMsg("audio-fix-fallback1", "audioFixFallback1");
intlMsg("audio-fix-fallback2", "audioFixFallback2");
intlMsg("audio-fix-fallback3", "audioFixFallback3");
intlMsg("audio-fix-checkbox", "audioFixCheckbox");
intlMsg("audio-fix-recommend", "audioFixRecommend");

intlMsg("btn-students-report", "btnStudentsReport");
intlMsg("btn-rooms-report", "btnRoomsReport");
intlMsg("broadcast", "broadcast");
intlMsg("slider-default", "sliderDefault", "&nbsp");

intlMsg("start-class", "startClass", "&nbsp");
intlMsg("assign-breakouts-adhoc", "assignBreakoutsAdhoc", "&nbsp");
intlMsg("assign-breakouts-pre", "assignBreakoutsPre", "&nbsp");
intlMsg("mute-remove", "muteRemove", "&nbsp");
intlMsg("reports", "reports", "&nbsp");

intlMsg("dropdown-course", "dropdownCourse", "&nbsp");
intlMsg("dropdown-course2", "dropdownCourse", "&nbsp");
intlMsg("dropdown-breakouts", "dropdownBreakouts", "&nbsp");

intlMsg("btn-open-main", "btnOpenMain", "&nbsp");
intlMsg("btn-open-breakouts", "btnOpenBreakouts", "&nbsp");
intlMsg("btn-open-all", "btnOpenAll", "&nbsp");

intlMsg("check-ram", "checkRam", "&nbsp");
intlMsg("check-ram2", "checkRam2", "&nbsp");
intlMsg("ram-help", "ramHelp", "&nbsp");
intlMsg("btn-ram", "btnRam", "&nbsp");

intlMsg("default-main-1", "default1");
intlMsg("default-main-2", "default2");
intlMsg("default-main-3a", "default3a");
intlMsg("default-main-3b", "default3b");
intlMsg("default-main-3c", "default3c");
intlMsg("default-main-4", "default4");
intlMsg("default-main-5a", "default5a");
intlMsg("default-main-5b", "default5b");
intlMsg("default-main-5c", "default5c");
intlMsg("default-main-6", "default6");

intlMsg("reports-clipboard", "reportsClipboard");
intlMsg("reports-csv", "reportsCsv");
intlMsg("reports-links", "reportsLinks");
intlMsg("reports-attendance", "reportsAttendance");
intlMsg("reports-assignments", "reportsAssignments");
intlMsg("reports-groups", "reportsGroups");

intlMsg("default-room-1", "default1");
intlMsg("default-room-2", "default2");
intlMsg("default-room-3a", "default3a");
intlMsg("default-room-3b", "default3b");
intlMsg("default-room-3c", "default3c");
intlMsg("default-room-4", "default4");
intlMsg("default-room-5a", "default5a");
intlMsg("default-room-5b", "default5b");
intlMsg("default-room-5c", "default5c");
intlMsg("default-room-6", "default6");

intlMsg("adhoc-0", "adhoc0");
intlMsg("adhoc-1", "adhoc1");
intlMsg("adhoc-1a", "adhoc1a");
intlMsg("adhoc-1b", "adhoc1b");
intlMsg("adhoc-1c", "adhoc1c");
intlMsg("adhoc-1d", "adhoc1d");
intlMsg("adhoc-11a", "adhoc11a");
intlMsg("adhoc-11b", "adhoc11b");
intlMsg("adhoc-12a", "adhoc12a");
// intlMsg("adhoc-12b", "adhoc12b");
intlMsg("adhoc-13a", "adhoc13a");
intlMsg("adhoc-13b", "adhoc13b");

intlMsg("adhoc-2", "adhoc2");
intlMsg("adhoc-2a", "adhoc2a");
intlMsg("adhoc-2b", "adhoc2b");
intlMsg("adhoc-2c", "adhoc2c");
intlMsg("adhoc-autosend", "adhocAutosend");
intlMsg("btn-autosend", "btnAutosend");

// intlMsg("btn-random", "btnRandom");

intlMsg("pre-0", "adhoc0");
intlMsg("pre-1", "pre1");
intlMsg("pre-1a", "pre1a");
intlMsg("pre-1b", "pre1b");
intlMsg("pre-2", "pre2");
intlMsg("pre-2a", "pre2a");
intlMsg("pre-2b", "pre2b");
intlMsg("pre-2c", "pre2c");

intlMsg("nickname-helplink", "nicknameHelplink");
intlMsg("help-nickname", "helpNickname");
intlMsg("help-nickname1", "helpNickname1");
intlMsg("help-nickname1a", "helpNickname1a");
intlMsg("help-nickname1b", "helpNickname1b");
intlMsg("help-nickname1c", "helpNickname1c");
intlMsg("help-nickname1d", "helpNickname1d");

intlMsg("help-nickname2", "helpNickname2");
intlMsg("help-nickname2a", "helpNickname2a");
intlMsg("help-nickname3", "helpNickname3");

intlMsg("help-code", "helpCode");
intlMsg("help-code1a", "helpCode1a");
intlMsg("help-url", "helpUrl");
intlMsg("help-url1a", "helpUrl1a");

intlMsg("rooms-how-start", "roomsHowStart");
intlMsg("rooms-how-start1", "roomsHowStart1");
intlMsg("rooms-how-gc", "roomsHowGc");
intlMsg("rooms-how-gc1", "roomsHowGc1");
intlMsg("rooms-how-gc2", "roomsHowGc2");
intlMsg("rooms-how-gc3", "roomsHowGc3");
intlMsg("rooms-how-types", "roomsHowTypes");
intlMsg("rooms-how-types1", "roomsHowTypes1");

intlMsg("rooms-how-nick", "roomsHowNick");
intlMsg("rooms-how-nick1", "roomsHowNick1");
intlMsg("rooms-how-nick2", "roomsHowNick2");
intlMsg("rooms-how-nick3", "roomsHowNick3");
intlMsg("rooms-how-gcnick", "roomsHowGcnick");
intlMsg("rooms-how-gcnick1", "roomsHowGcnick1");
intlMsg("rooms-how-gcnick2", "roomsHowGcnick2");
intlMsg("rooms-how-gcnick3", "roomsHowGcnick3");
intlMsg("rooms-how-gcnick4", "roomsHowGcnick4");

intlMsg("rooms-how-code", "roomsHowCode");
intlMsg("rooms-how-code1", "roomsHowCode1");
intlMsg("rooms-how-code2", "roomsHowCode2");
intlMsg("rooms-how-code3", "roomsHowCode3");

intlMsg("rooms-how-url", "roomsHowUrl");
intlMsg("rooms-how-url1", "roomsHowUrl1");
intlMsg("rooms-how-url2", "roomsHowUrl2");
intlMsg("rooms-how-url3", "roomsHowUrl3");
intlMsg("rooms-how-url4", "roomsHowUrl4");
intlMsg("rooms-how-url5", "roomsHowUrl5");
intlMsg("rooms-how-url6", "roomsHowUrl6");
intlMsg("rooms-how-url7", "roomsHowUrl7");

intlMsg("rooms-expimp", "roomsExpimp");
intlMsg("rooms-expimp-warn", "roomsExpimpWarn");
intlMsg("rooms-exp1", "roomsExp1");
intlMsg("rooms-exp2", "roomsExp2");
intlMsg("rooms-exp3", "roomsExp3");
intlMsg("rooms-imp1", "roomsImp1");
intlMsg("rooms-imp2", "roomsImp2");
intlMsg("rooms-imp3", "roomsImp3");
intlMsg("rooms-built-with", "roomsBuiltWith");
intlMsg("rooms-popup-title", "roomsPopupTitle");

// intlMsg("pre2", "popupHelpAdhocNumwords2");
// intlMsg("pre2a", "popupHelpAdhocNumwords2a");
// intlMsg("pre2b", "popupHelpAdhocNumwords2b");
// intlMsg("pre2c", "popupHelpAdhocNumwords2c");
// intlMsg("pre2d", "popupHelpAdhocNumwords2d");

intlMsg("mute-all-main", "muteAllMain", "&nbsp");
intlMsg("mute-all-breakouts", "muteAllBreakouts", "&nbsp");
intlMsg("mute-all-rooms", "muteAllRooms", "&nbsp");
intlMsg("mute-all-this", "muteAllThis", "&nbsp");
intlMsg("remove-all-this", "removeAllThis", "&nbsp");
intlMsg("remove-breakouts", "removeBreakouts", "&nbsp");
intlMsg("hangup-breakouts", "hangupBreakouts", "&nbsp");
intlMsg("remove-main", "removeMain", "&nbsp");
intlMsg("hangup-main", "hangupMain", "&nbsp");

// Rooms
intlMsg("instruct-room-links", "instructRoomLinks", "&nbsp");
intlMsg("sub-heading-rooms", "subHeadingRooms", "&nbsp");
intlMsg("nickname", "nickname");
intlMsg("code", "code");
intlMsg("url", "url");

intlMsg("courses-expimp", "coursesExpimp");
intlMsg("courses-expimp-warn", "coursesExpimpWarn");
intlMsg("courses-exp1", "coursesExp1");
intlMsg("courses-exp2", "coursesExp2");
intlMsg("courses-exp3", "coursesExp3");
intlMsg("courses-imp1", "coursesImp1");
intlMsg("courses-imp2", "coursesImp2");
intlMsg("courses-imp3", "coursesImp3");
intlMsg("courses-built-with", "coursesBuiltWith");

// Course
intlMsg("enter-courses", "enterCourses");
intlMsg("course-enter", "courseEnter");
intlMsg("course-course", "courseCourse");
intlMsg("course-desc", "courseDesc");

// General
intlMsg("gen-display", "genDisplay");
intlMsg("gen-tiles", "genTiles");
intlMsg("gen-tabs", "genTabs");
intlMsg("gen-toolbar-color", "genToolbarColor");
intlMsg("gen-solid", "genSolid");
intlMsg("gen-grad", "genGrad");
intlMsg("gen-drop-solid", "genDropSolid");
intlMsg("gen-drop-end", "genDropEnd");
intlMsg("gen-drop-mid", "genDropMid");
intlMsg("gen-slider-img", "genSliderImg");
intlMsg("gen-slider-pos", "genSliderPos");
intlMsg("gen-slider-size", "genSliderSize");
intlMsg("gen-slider-text-color", "genSliderTextColor");
intlMsg("gen-slider-back-color", "genSliderBackColor");
intlMsg("gen-broad-img", "genBroadImg");
intlMsg("gen-broad-pos", "genBroadPos");
intlMsg("gen-broad-size", "genBroadSize");
intlMsg("gen-broad-text-color", "genBroadTextColor");
intlMsg("gen-broad-back-color", "genBroadBackColor");

intlMsg("gen-auto-enter", "genAutoEnter");
intlMsg("gen-auto-enter1", "genAutoEnter1");
intlMsg("gen-auto-enter2", "genAutoEnter2");
intlMsg("gen-auto-enter3", "genAutoEnter3");
intlMsg("gen-auto-join", "genAutoJoin");
intlMsg("gen-auto-join-main", "genAutoJoinMain");
intlMsg("gen-auto-join-break", "genAutoJoinBreak");
intlMsg("gen-auto-new-url", "genAutoNewUrl");
intlMsg("gen-auto-new-url1", "genAutoNewUrl1");
intlMsg("gen-auto-new-url2", "genAutoNewUrl2");
intlMsg("gen-auto-new-url3", "genAutoNewUrl3");
intlMsg("gen-auto-new-url-main", "genAutoNewUrlMain");
intlMsg("gen-auto-new-url-break", "genAutoNewUrlBreak");
intlMsg("warning-8-rooms", "warning8Rooms", "&nbsp");

intlMsg("sim-1", "sim1");
intlMsg("sim-2", "sim2");
intlMsg("sim-3", "sim3");
intlMsg("sim-4", "sim4");
intlMsg("sim-5", "sim5", "&nbsp");
intlMsg("sim-6", "sim6");
intlMsg("sim-7", "sim7");
intlMsg("sim-7a", "sim7a");
intlMsg("sim-8", "sim8");
intlMsg("sim-9", "sim9");
intlMsg("sim-10", "sim10");
intlMsg("sim-11", "sim11");
intlMsg("sim-12", "sim12");
intlMsg("sim-13", "sim13");
intlMsg("sim-14", "sim14");
intlMsg("sim-15", "sim15");
intlMsg("sim-16", "sim16");
intlMsg("sim-17", "sim17");
intlMsg("sim-18", "sim18");

let toolTipRetile = chrome.i18n.getMessage("toolTipRetile") ? chrome.i18n.getMessage("toolTipRetile") : "Re-Tile";
document.querySelector("#popup-retile").dataset.originalTitle = toolTipRetile;

let toolTipToolbar = chrome.i18n.getMessage("toolTipToolbar") ? chrome.i18n.getMessage("toolTipToolbar") : "Hide Meet Bottom Bar";
document.querySelector("#popup-hide-bar").dataset.originalTitle = toolTipToolbar;

let roomsNeedName = chrome.i18n.getMessage("roomsNeedName") ? chrome.i18n.getMessage("roomsNeedName") : "Cannot save: All rooms need a name";
let roomsDupe = chrome.i18n.getMessage("roomsDupe") ? chrome.i18n.getMessage("roomsDupe") : "Cannot save: Duplicate Room Names and/or Duplicate Links";
let roomsCreatingUrl = chrome.i18n.getMessage("roomsCreatingUrl") ? chrome.i18n.getMessage("roomsCreatingUrl") : "Creating automatic URL links and saving...";
let roomsSaved = chrome.i18n.getMessage("roomsSaved") ? chrome.i18n.getMessage("roomsSaved") : "Room links saved";
let roomsNotYetSaved = chrome.i18n.getMessage("roomsNotYetSaved") ? chrome.i18n.getMessage("roomsNotYetSaved") : "Reminder: Changes not yet saved";
let roomsUndo = chrome.i18n.getMessage("roomsUndo") ? chrome.i18n.getMessage("roomsUndo") : "Changes undone";
let mainName = chrome.i18n.getMessage("mainName") ? chrome.i18n.getMessage("mainName") : "Main";
let coursesDupe = chrome.i18n.getMessage("coursesDupe") ? chrome.i18n.getMessage("coursesDupe") : "Cannot save: Duplicate course names";
let coursesSaved = chrome.i18n.getMessage("coursesSaved") ? chrome.i18n.getMessage("coursesSaved") : "Courses saved";
let coursesNotYetSaved = chrome.i18n.getMessage("coursesNotYetSaved") ? chrome.i18n.getMessage("coursesNotYetSaved") : "Changes not yet saved";

// let defaultAccount = chrome.i18n.getMessage("defaultAccount") ? '&nbsp;22' + chrome.i18n.getMessage("defaultAccount") : "&npsp;Your Meet Account is ";
// let defaultAccount2 = chrome.i18n.getMessage("defaultAccount") ? '&nbsp;22' + chrome.i18n.getMessage("defaultAccount") : "&nbsp;Your Meet Account is ";

(async () => {
  let accountName = await getDefaultAccount();

  document.querySelector("[data-span-meet-account-name]").innerText = accountName;
  document.querySelector("[data-span-rooms-account-name2]").innerText = accountName;

  // intlMsg("default-account", "defaultAccount", "&nbsp");
  // intlMsg("default-account2", "defaultAccount", "&nbsp");

  // document.querySelector("[data-span-rooms-account-name]").innerText = accountName;

  // let msg = chrome.i18n.getMessage("defaultAccount");

  // if (msg) {
  //   document.querySelector("[data-msg-default-account]").innerHTML = `&nbsp;${msg} <span data-span-meet-account-name>${accountName}</span>`;
  //   document.querySelector("[data-msg-default-account2]").innerHTML = `&nbsp;${msg} <span data-span-meet-account-name>${accountName}</span>`;
  // }
})();
