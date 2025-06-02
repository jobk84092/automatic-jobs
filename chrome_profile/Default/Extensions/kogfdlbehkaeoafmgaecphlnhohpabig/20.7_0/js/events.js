(async () => {
  let lang = await chromeDetectLanguage();

  document.querySelectorAll(".href-help")?.forEach((el) => {
    if (lang == "zh-TW") {
      el.href = "https://hudektech.github.io/gmbr-help-zhTW/" + el.dataset.zhtwHref;
    }
  });
})();

// Set the version message
setMeetBannerMessage();

// Temporarily alert for dracula themes
const setThemeHeadline = () => {
  // Also in utilHelper/setMeetBannerMessage
  let manifest = chrome.runtime.getManifest();
  let hrefNotes = `https://www.hudektech.com/projects/breakout/notes#v-${manifest.version}`;
  let myName = chrome.i18n.getMessage("myName"); // 胡浩洋用
  let tryThemes = chrome.i18n.getMessage("headlineTryThemes"); // 胡浩洋用

  // myName = myName == "胡浩洋" ? myName : "Robert Hudek";

  if (myName == "胡浩洋") {
    myName = myName;
  } else if (myName == "Robert 'Alejandro' Hudek") {
    myName = myName;
  } else {
    myName = "Robert Hudek";
  }

  document.querySelector("#my-name").innerText = `by ${myName}`;

  let stub1 = document.querySelector("#try-themes-version");
  stub1.outerHTML = ` <a href=${hrefNotes} target="_blank" style="color:black">v${manifest.version}</a> &nbsp <span id="try-themes-click">Color Themes</span>`;

  document.querySelector("#try-themes-click").addEventListener("click", (event) => {
    let tab4 = document.querySelector("#four-tab");
    tab4.click();
  });
};

setThemeHeadline();

// Begin normal processing
g_flag = false;

$(function () {
  $('[data-toggle="tooltip"]').tooltip();
});

window.addEventListener("focus", async (e) => {
  await sleep(100);

  // console.log("focused");
});

if (chrome.i18n.getMessage("@@ui_locale") == "zh_TW") {
  document.querySelector("a#gmbr-help").href = "https://hudektech.github.io/gmbr-help-zhTW/";
  document.title = "分組控制面板";
}
document.querySelector("#status-students").addEventListener("click", handleStatusStudents);

document.querySelector("#status-rooms").addEventListener("click", handleStatusRooms);

//Easter egg test
document.querySelector("#speaker-section-test").addEventListener("click", async (event) => {
  let stringSpkr = "";
  let rooms = await chromeAllOpenRooms();
  rooms = filterExtensionRooms(rooms);
  rooms = sortRoomsTabOrder(rooms);

  for (let i = 0; i < rooms.length; i++) {
    stringSpkr += `Room: ${rooms[i].title}, Speaker Muted: ${rooms[i].muted}, Tab Id: ${rooms[i].id}\n`;
  }

  alert(stringSpkr);
});

// Low Memory Checkbox
document.querySelector("#low-memory-option").addEventListener("click", async (event) => {
  myBreakout.settings.lowMemoryFlag = document.querySelector("#low-memory-option").checked;
  await myBreakout.saveBreakout();

  updateOpenButtons();

  if (myBreakout.settings.lowMemoryFlag) {
    document.querySelector("#open-breakouts").classList.add("d-none");
    document.querySelector("#open-both").classList.add("d-none");
    document.querySelector("#open-main i").innerText = "Open/Sync One Window for Main and Breakout Rooms, Use Slider to Move Through the Rooms";
    intlMsg("btn-open-main", "btnRam", "&nbsp");
    document.querySelector("#open-main").classList.remove("col-3");
    document.querySelector("#open-main").classList.add("col-12");
  } else {
    document.querySelector("#open-breakouts").classList.remove("d-none");
    document.querySelector("#open-both").classList.remove("d-none");
    document.querySelector("#open-main i").innerHTML = "Main Room";
    intlMsg("btn-open-main", "btnOpenMain1", "&nbsp");
    document.querySelector("#open-main").classList.add("col-3");
    document.querySelector("#open-main").classList.remove("col-12");
  }
});

document.querySelector("#goto20").addEventListener("click", (event) => {
  document.querySelector("#my-help").style.display = "block";
  window.location.href = "#20";

  // When the user clicks on <span> (x), close the modal
  document.querySelector(".close-help").onclick = function () {
    document.querySelector("#my-help").style.display = "none";
    window.location.href = "#help-list";
  };
});

// Popup refresh
document.querySelector("#popup-refresh").addEventListener("click", async (event) => {
  await refreshControlPanel();
  // resize
  // let win = await chromeWindowsGetCurrent({});

  // await chromeWindowsUpdate2(win.id, {
  //   state: "normal",
  //   drawAttention: true,
  //   focused: true,
  //   width: 530,
  //   height: window.screen.availHeight,
  //   top: 0,
  //   left: window.screen.availWidth - 530,
  // });

  // window.location.reload();
});

document.querySelector("#popup-hide-bar").addEventListener("click", async (event) => {
  handleCopyClipboardButtons(event);
  let icon = event.currentTarget.querySelector("i");
  let myAction;

  if (event.currentTarget.dataset.hidden == "false") {
    myAction = "hideBar";
    icon.className = "fas fa-eye";
    event.currentTarget.dataset.hidden = "true";
    event.currentTarget.style.color = "white";
    event.currentTarget.style.backgroundColor = "cornflowerblue";
    event.currentTarget.dataset.originalTitle = "Unhide Meet Bottom Bar";
  } else {
    myAction = "unHideBar";
    icon.className = "fas fa-eye-slash";
    event.currentTarget.dataset.hidden = "false";
    event.currentTarget.style.color = "cornflowerblue";
    event.currentTarget.style.backgroundColor = "white";
    event.currentTarget.dataset.originalTitle = "Hide Meet Bottom Bar";
  }

  // Get all the tabIds
  let rooms = await chromeAllOpenRooms();
  rooms = filterExtensionRooms(rooms);
  rooms = sortRoomsTabOrder(rooms);

  for (let i = 0; i < rooms.length; i++) {
    chrome.tabs.sendMessage(rooms[i].id, {
      action: myAction,
    });
  }
});

document.querySelector("#popup-retile").addEventListener("click", async (event) => {
  handleCopyClipboardButtons(event);
  await popupRetile(event.currentTarget);
});

document.querySelector("#popup-resize").addEventListener("click", async (event) => {
  await popupResize(event.currentTarget);
  $('[data-toggle="tooltip"]').tooltip("hide");
});

document.querySelector("#popup-minimize").addEventListener("click", async (event) => {
  let win = await chromeWindowsGetCurrent({});

  chrome.windows.update(win.id, {
    state: "minimized",
  });
});

// Mute all in Main
document.querySelector("#mute-all-main").parentElement.addEventListener("click", async (event) => {
  try {
    handleCopyClipboardButtons({ currentTarget: event.currentTarget.querySelector("button") });
    let allRooms = await chromeAllOpenRooms();
    // allRooms = allrooms.filter((el) => el.link != "");
    let myRooms = myBreakout.myRooms;
    myRooms = myRooms.slice(0, 1);

    for (let i = 0; i < myRooms.length; i++) {
      // let tabId = allRooms.filter((el) => el.url == myRooms[i].link)[0].id;
      let tabId;

      let arr = allRooms.filter((el) => getMeetUrlBase(el.url) == myRooms[i].linkFetchedUrl);

      if (arr && arr.length > 0) {
        tabId = arr[0].id;

        chrome.tabs.sendMessage(tabId, {
          action: "muteAll",
        });
      }
    }
  } catch (err) {}
});
// Mute this tab
document.querySelector("#mute-all-this").parentElement.addEventListener("click", (event) => {
  try {
    handleCopyClipboardButtons({ currentTarget: event.currentTarget.querySelector("button") });
    let tabId = parseInt(document.querySelector("#slider-title").dataset.tabId);
    return chrome.tabs.sendMessage(tabId, {
      action: "muteAll",
    });
  } catch (err) {}
});
// Mute all in All Breakouts
document.querySelector("#mute-all-breakouts").parentElement.addEventListener("click", async (event) => {
  try {
    handleCopyClipboardButtons({ currentTarget: event.currentTarget.querySelector("button") });
    let allRooms = await chromeAllOpenRooms();
    // allRooms = allrooms.filter((el) => el.link != "");
    let myRooms = myBreakout.myRooms;
    myRooms = myRooms.slice(1);

    for (let i = 0; i < myRooms.length; i++) {
      // let tabId = allRooms.filter((el) => el.url == myRooms[i].link)[0].id;
      let tabId;

      let arr = allRooms.filter((el) => getMeetUrlBase(el.url) == myRooms[i].linkFetchedUrl);

      if (arr && arr.length > 0) {
        tabId = arr[0].id;

        chrome.tabs.sendMessage(tabId, {
          action: "muteAll",
        });
      }
    }
  } catch (err) {}
});

// Mute All Everywhere
document.querySelector("#mute-all-all").parentElement.addEventListener("click", async (event) => {
  try {
    handleCopyClipboardButtons({ currentTarget: event.currentTarget.querySelector("button") });
    let allRooms = await chromeAllOpenRooms();
    // allRooms = allrooms.filter((el) => el.link != "");
    let myRooms = myBreakout.myRooms;
    // myRooms = myRooms.slice(1);

    for (let i = 0; i < myRooms.length; i++) {
      // let tabId = allRooms.filter((el) => el.url == myRooms[i].link)[0].id;
      let tabId;

      let arr = allRooms.filter((el) => getMeetUrlBase(el.url) == myRooms[i].linkFetchedUrl);

      if (arr && arr.length > 0) {
        tabId = arr[0].id;

        chrome.tabs.sendMessage(tabId, {
          action: "muteAll",
        });
      }
    }
  } catch (err) {}
});

// Mute allmain
// Mute allbreakouts

document.querySelector("#remove-all-this").parentElement.addEventListener("click", (event) => {
  try {
    handleCopyClipboardButtons({ currentTarget: event.currentTarget.querySelector("button") });
    let tabId = parseInt(document.querySelector("#slider-title").dataset.tabId);
    return chrome.tabs.sendMessage(tabId, {
      action: "removeAll",
    });
  } catch (err) {}
});

document.querySelector("#remove-all-breakouts").parentElement.addEventListener("click", async (event) => {
  try {
    handleCopyClipboardButtons({ currentTarget: event.currentTarget.querySelector("button") });
    let allRooms = await chromeAllOpenRooms();
    // allRooms = allrooms.filter((el) => el.link != "");
    let myRooms = myBreakout.myRooms;
    myRooms = myRooms.slice(1);

    for (let i = 0; i < myRooms.length; i++) {
      // let tabId = allRooms.filter((el) => el.url == myRooms[i].link)[0].id;
      let tabId;

      let arr = allRooms.filter((el) => getMeetUrlBase(el.url) == myRooms[i].linkFetchedUrl);

      if (arr && arr.length > 0) {
        tabId = arr[0].id;

        chrome.tabs.sendMessage(tabId, {
          action: "removeAll",
        });
      }
    }
  } catch (err) {}
});

document.querySelector("#remove-all-main").parentElement.addEventListener("click", async (event) => {
  try {
    handleCopyClipboardButtons({ currentTarget: event.currentTarget.querySelector("button") });
    let allRooms = await chromeAllOpenRooms();
    // allRooms = allrooms.filter((el) => el.link != "");
    let myRooms = myBreakout.myRooms;
    myRooms = myRooms.slice(0, 1);

    for (let i = 0; i < myRooms.length; i++) {
      // let tabId = allRooms.filter((el) => el.url == myRooms[i].link)[0].id;
      let tabId;

      let arr = allRooms.filter((el) => getMeetUrlBase(el.url) == myRooms[i].linkFetchedUrl);

      if (arr && arr.length > 0) {
        tabId = arr[0].id;

        chrome.tabs.sendMessage(tabId, {
          action: "removeAll",
        });
      }
    }
  } catch (err) {}
});

document.querySelector("#hangup-all-breakouts").parentElement.addEventListener("click", async (event) => {
  try {
    handleCopyClipboardButtons({ currentTarget: event.currentTarget.querySelector("button") });
    let allRooms = await chromeAllOpenRooms();

    let myRooms = myBreakout.myRooms;
    myRooms = myRooms.slice(1);

    for (let i = 0; i < myRooms.length; i++) {
      // let tabId = allRooms.filter((el) => el.url == myRooms[i].link)[0].id;
      let tabId;

      let arr = allRooms.filter((el) => getMeetUrlBase(el.url) == myRooms[i].linkFetchedUrl);

      if (arr && arr.length > 0) {
        tabId = arr[0].id;

        chrome.tabs.sendMessage(tabId, {
          action: "hangup",
        });

        // await chromeTabsSendMessage(tabId, {
        //   action: "hangup",
        // });

        // await chromeRuntimeSendMessage({
        //   tabId: tabId,
        //   action: "closeRoomTab2",
        // });
      }
    }
  } catch (err) {}
});

document.querySelector("#hangup-main").parentElement.addEventListener("click", async (event) => {
  try {
    handleCopyClipboardButtons({ currentTarget: event.currentTarget.querySelector("button") });
    let allRooms = await chromeAllOpenRooms();
    // allRooms = allrooms.filter((el) => el.link != "");
    let myRooms = myBreakout.myRooms;
    myRooms = myRooms.slice(0, 1);

    for (let i = 0; i < myRooms.length; i++) {
      // let tabId = allRooms.filter((el) => el.url == myRooms[i].link)[0].id;
      let tabId;

      let arr = allRooms.filter((el) => getMeetUrlBase(el.url) == myRooms[i].linkFetchedUrl);

      if (arr && arr.length > 0) {
        tabId = arr[0].id;

        chrome.tabs.sendMessage(tabId, {
          action: "hangup",
        });

        // await chromeTabsSendMessage(tabId, {
        //   action: "hangup",
        // });

        // await chromeRuntimeSendMessage({
        //   tabId: tabId,
        //   action: "closeRoomTab2",
        // });
      }
    }
  } catch (err) {}
});

document.querySelector("#close-room").parentElement.addEventListener("click", async (event) => {
  try {
    handleCopyClipboardButtons({ currentTarget: event.currentTarget.querySelector("button") });
    let tabId = parseInt(document.querySelector("#slider-title").dataset.tabId);
    let winId = parseInt(document.querySelector("#slider-title").dataset.winId);
    let link = document.querySelector("#slider-title").dataset.link;

    chrome.tabs.sendMessage(tabId, {
      action: "closeRoom",
      winId: winId,
      tabId: tabId,
    });

    let toBeRemoved = document.querySelector(`[data-goto][data-link="${link}"]`);

    if (toBeRemoved) {
      toBeRemoved.parentElement.removeChild(toBeRemoved);
    } else {
      alert(`${link} not found`);
    }

    // July 21 change from 2 to normal
    // await buildSlider2();
    await buildSlider();

    document.querySelector("#slider-right").click();
    document.querySelector("#slider-left").click();
  } catch (err) {}
});

// 2024.10.02
const updateSimulateStudentsDropdownList = () => {
  const dropdown = document.getElementById("student-count");

  // Populate the dropdown with student count options from 1 to 24
  for (let i = 1; i <= 24; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.text = i;
    dropdown.appendChild(option);
  }

  // Retrieve the saved student count from local storage, if available
  chrome.storage.local.get(["savedStudentCount"], (result) => {
    const savedStudentCount = result.savedStudentCount || 6; // Default to 6 if not found
    dropdown.value = savedStudentCount;
  });
};

// 2024.10.02 Function to map student numbers to letters (A, B, C, ..., Z)
function getStudentLetter(num) {
  return String.fromCharCode(64 + num); // 65 is 'A', 66 is 'B', and so on
}

// Event listener on start up
document.addEventListener("DOMContentLoaded", (event) => {
  updateDropdownsLists();

  // 2024.10.02
  updateSimulateStudentsDropdownList();
});

// 2024.10.02
async function isStudentTabOpen(studentName) {
  // Search for tabs with URLs from meet.google.com across all windows
  const tabs = await chrome.tabs.query({
    url: "*://meet.google.com/*",
  });

  // Manually check if any of the tabs contain the specific student name and breakout_testing hash
  return tabs.some((tab) => tab.url.includes(`?student=${studentName}`) && tab.url.includes("#breakout_testing"));
}

// 2024.10.02 Event listener for adding simulated students
// 2024.10.02 Event listener for adding simulated students
document.getElementById("btn-simulate-students").addEventListener("click", async function () {
  const studentCount = parseInt(document.getElementById("student-count").value);

  // Save the selected number of students to local storage
  chrome.storage.local.set({ savedStudentCount: studentCount });

  try {
    // Check for "Main" Meet tab by URL and title (adjust query as needed)
    const [mainTab] = await chrome.tabs.query({ title: "Main", url: "*://meet.google.com/*" });

    if (!mainTab) {
      alert('The "Main" room is not opened yet.');
      return;
    }

    if (mainTab.length > 1) {
      alert('There are more than one "Main" tabs open.');
      return;
    }

    // Extract the Meet URL for the "Main" room
    const mainRoomUrl = mainTab.url;

    // Get the screen dimensions
    const screenWidth = window.screen.availWidth;
    const screenHeight = window.screen.availHeight;

    // Calculate the window position and size
    const windowWidth = Math.floor(screenWidth / 2); // Half the screen width
    const windowHeight = screenHeight; // Full height
    const leftPosition = screenWidth - windowWidth; // Right justify

    // Loop through the student count and create tabs only if they aren't already open
    const urlsToOpen = [];

    for (let i = 1; i <= studentCount; i++) {
      const studentLetter = getStudentLetter(i); // Get the letter corresponding to the student number
      const studentUrl = `${mainRoomUrl}?student=${studentLetter}#breakout_testing`;

      // Check if the tab for the student is already open
      const isOpen = await isStudentTabOpen(studentLetter);
      if (!isOpen) {
        urlsToOpen.push(studentUrl); // Add to the list of URLs to be opened
      } else {
        console.log(`Tab for ${studentLetter} is already open.`);
      }
    }

    // If there are URLs to open, create the incognito window with new tabs
    if (urlsToOpen.length > 0) {
      chrome.windows.create(
        {
          url: urlsToOpen,
          incognito: true,
          width: windowWidth,
          height: windowHeight,
          left: leftPosition, // Position it on the right side
          top: 0, // Start from the top of the screen
        },
        function (window) {
          console.log(`${urlsToOpen.length} new student tabs added to the Main room.`);
        }
      );

      let btnMeet = document.querySelector("#one-tab");
      if (btnMeet) {
        btnMeet.click();
      }
    } else {
      console.log("No new student tabs were added.");
    }
  } catch (error) {
    alert("An error occurred while processing your request.");
    console.error(error);
  }
});

document.querySelector("#dropdown-meet-class-hook").addEventListener("click", handleMeetChooseClass);

document.querySelector("#dropdown-meet-room-hook").addEventListener("click", handleMeetChooseNumber);

document.querySelector("#assign-ppts").addEventListener("click", buildMeetMainPptListing);

document.querySelector("#meet-rooms-hook").addEventListener("click", handleMeetRoomsHook);

// August 2 disable refresh and change it to updateDropdownsLists
document.querySelector("#open-main").addEventListener("click", async (event) => {
  try {
    closeOpenMeetsAccordian();
    await handleMeetOpenAllRooms(event);
    updateDropdownsLists();
    await chromeRuntimeSendMessage({ action: "tellContextToUpdateTabs" });
    //
  } catch (error) {
    console.log(`Error in #open-main `, error);
  }
});

document.querySelector("#open-breakouts").addEventListener("click", async (event) => {
  try {
    closeOpenMeetsAccordian();
    await handleMeetOpenAllRooms(event);
    updateDropdownsLists();
    await chromeRuntimeSendMessage({ action: "tellContextToUpdateTabs" });
    //
  } catch (error) {
    console.log(`Error in #open-breakouts `, error);
  }
});

document.querySelector("#open-breakouts2").addEventListener("click", async (event) => {
  try {
    closeOpenMeetsAccordian();
    await handleMeetOpenAllRooms(event);
    updateDropdownsLists();
    handleCopyClipboardButtons(event);
    await chromeRuntimeSendMessage({ action: "tellContextToUpdateTabs" });
    //
  } catch (error) {
    console.log(`Error in #open-breakouts2 `, error);
  }
});

document.querySelector("#open-both").addEventListener("click", async (event) => {
  try {
    closeOpenMeetsAccordian();
    await handleMeetOpenAllRooms(event);
    updateDropdownsLists();
    await chromeRuntimeSendMessage({ action: "tellContextToUpdateTabs" });
    //
  } catch (error) {
    console.log(`Error in #open-both `, error);
  }
});

document.querySelector("#copy-all-links").addEventListener("click", handleCopyClipboardButtons);

document.querySelector("#btn-ad-hoc-list-groups-link-copy").addEventListener("click", handleCopyClipboardButtons);

document.querySelector("#btn-ad-hoc-list-groups-ppt-copy").addEventListener("click", handleCopyClipboardButtons);

document.querySelector("#btn-pre-assigned").addEventListener("click", handleCopyClipboardButtons);
document.querySelector("#btn-gc-sync").addEventListener("click", (events) => {
  handleCopyClipboardButtons(events);
  syncGC(events);
});

document.querySelector("#btn-ad-hoc").addEventListener("click", handleCopyClipboardButtons);
document.querySelector("#btn-ad-hoc-autosend").addEventListener("click", handleAutosendAssignments);
document.querySelector("#btn-autosend-ok").addEventListener("click", handleAutosendOk);

document.querySelector("#copy-ppt-list").addEventListener("click", handleCopyClipboardButtons);
document.querySelector("#copy-ppt-assignments").addEventListener("click", handleCopyClipboardButtons);
document.querySelector("#copy-breakout-groups").addEventListener("click", handleCopyClipboardButtons);

document.querySelector("#slider").addEventListener("input", handleSlider);
document.querySelector("#slider-left").addEventListener("click", handleSlider);
document.querySelector("#slider-right").addEventListener("click", handleSlider);
document.querySelector("#thisSpk").addEventListener("click", handleSliderMute);
document.querySelector("#thisMic").addEventListener("click", handleSliderMute);
document.querySelector("#thisVid").addEventListener("click", handleSliderMute);
document.querySelector("#thatSpk").addEventListener("click", handleSliderMute);
document.querySelector("#thatMic").addEventListener("click", handleSliderMute);
document.querySelector("#thatVid").addEventListener("click", handleSliderMute);
document.querySelector("#broadSpk").addEventListener("click", handleSliderMute);
document.querySelector("#broadMic").addEventListener("click", handleSliderMute);
document.querySelector("#broadVid").addEventListener("click", handleSliderMute);

// 2) Event listeners on rooms tab
document.querySelector("#dropdown-rooms-class-hook").addEventListener("click", handleRoomsChooseClass);

document.querySelector("#btn-rooms-add").addEventListener("click", handleRooms);
document.querySelector("#btn-rooms-save").addEventListener("click", handleRooms);
document.querySelector("#btn-rooms-recycle").addEventListener("click", handleRooms);
document.querySelector("#btn-rooms-undo").addEventListener("click", handleRooms);
document.querySelector("#btn-rooms-delete").addEventListener("click", handleRooms);

document.querySelector("#btn-rooms-export").addEventListener("click", handleRoomsExport);
document.querySelector("#btn-rooms-import").addEventListener("click", handleRoomsImport);

document.querySelector("#list-rooms-hook").addEventListener("input", handleRoomsEditInput);

document.querySelector("#list-rooms-hook").addEventListener("dragend", (evt) => {
  alertMessage(roomsNotYetSaved, "alert-warning", "#rooms-alert", (category = "rooms"), (waitTime = 1000000));
});

// 3) Event listeners on classes tab
document.querySelector("#btn-classes-add").addEventListener("click", handleClasses);
document.querySelector("#btn-classes-save").addEventListener("click", handleClasses);
document.querySelector("#btn-classes-undo").addEventListener("click", handleClasses);
document.querySelector("#btn-classes-delete").addEventListener("click", handleClasses);

document.querySelector("#btn-classes-export").addEventListener("click", handleClassesExport);
document.querySelector("#btn-classes-import").addEventListener("click", handleClassesImport);

document.querySelector("#list-classes-hook").addEventListener("input", handleClassesEditInput);

document.querySelector("#list-classes-hook").addEventListener("dragend", (evt) => {
  alertMessage(roomsNotYetSaved, "alert-warning", "#classes-alert", (category = "classes"), (waitTime = 1000000));
});

// Tab 4: General
document.querySelector("[data-general-click]").addEventListener("click", handleTabsTilesMaxtabs);
document.querySelector("[data-general-themes]").addEventListener("click", handleThemes);
document.querySelector("[data-radio-toolbar-solid]").addEventListener("click", handleRadioSolid);
document.querySelector("[data-radio-toolbar-grad]").addEventListener("click", handleRadioGrad);

document.querySelector("#slider-bg-url-save").addEventListener("click", async (event) => {
  handleCopyClipboardButtons(event);
  handleSliderBg();
  myBreakout.saveBreakout();
});

document.querySelector("#broadcast-bg-url-save").addEventListener("click", async (event) => {
  handleCopyClipboardButtons(event);
  handleBroadcastBg();
  myBreakout.saveBreakout();
});

document.querySelector("#auto-enter").addEventListener("click", handleAutoEnter);
document.querySelector("#new-mute").addEventListener("click", handleNewMute);
document.querySelector("#auto-join-main").addEventListener("click", handleAutoJoin);
document.querySelector("#auto-join-breakouts").addEventListener("click", handleAutoJoin);
document.querySelector("#auto-refresh-main").addEventListener("click", handleAutoRefresh);
document.querySelector("#auto-refresh-breakouts").addEventListener("click", handleAutoRefresh);
document.querySelector("#allow-simult").addEventListener("click", handleAllowSimult);

// Bootstrap
$(".alert").alert();

$("#meet-main-ppt-pre").on("show.bs.collapse", function () {
  // Groups Links
  let groupsLinkText = getAssignRoomList((boolCondense = true)).listText;

  document.querySelector("#pre-assigned-list-groups-link-copy").classList.remove("hide-button");
  // document.querySelector("#ad-hoc-list-groups-link").innerText = groupsLinkText;

  if (groupsLinkText.length < 500) {
    document.querySelector(
      "#pre-assigned-list-groups-link-length"
    ).innerHTML = `<span data-msg-pre-numwords2a>This copy/paste is only </span>${groupsLinkText.length} <span data-msg-pre-numwords2b> characters, which is under the 500 character limit.  The listing below is for your reference only</span>`;
  } else {
    document.querySelector("#pre-assigned-list-groups-link-copy").classList.add("hide-button");
    document.querySelector(
      "#pre-assigned-list-groups-link-length"
    ).innerText = `<span data-msg-pre-numwords2c>This copy/paste has </span>${groupsLinkText.length} <span data-msg-pre-numwords2d> characters, which is OVER the 500 character limit.  Please copy/paste by highlighting the text below in sections and copy/paste into the Main chat.  Use your judgment as to how much to copy and paste at a time, perhaps 8 lines at a time.  It is OK if you overlap and copy and paste the same lines again.  The purpose it so inform the students so they know what to click on.</span>`;
  }

  document.querySelector("#pre-assigned-list-groups-link").innerText = groupsLinkText;

  intlMsg("pre-numwords2a", "preNumwords2a");
  intlMsg("pre-numwords2b", "preNumwords2b");
  intlMsg("pre-numwords2c", "preNumwords2c");
  intlMsg("pre-numwords2d", "preNumwords2d");
});

$("#rooms-export-import").on("show.bs.modal", (evt) => {
  nameKey = document.querySelector("#setup-rooms-class[data-class-name-key]").dataset.classNameKey;

  document.querySelector("[data-impexp-rooms-popup-title]").innerText = `${nameKey}`;
});

// Slider background image options
$("#slider-bg-position").on("show.bs.dropdown", async (event) => {
  let sel = document.querySelectorAll("#slider-bg-size .dropdown-item");

  for (let i = 0; i < sel.length; i++) {
    sel[i].classList.remove("active");

    if (sel[i].text == myBreakout.settings.sliderBg.position) {
      sel[i].classList.add("active");
    }
  }
});

$("#slider-bg-size").on("show.bs.dropdown", async (event) => {
  let sel = document.querySelectorAll("#slider-bg-size .dropdown-item");

  for (let i = 0; i < sel.length; i++) {
    sel[i].classList.remove("active");

    if (sel[i].text == myBreakout.settings.sliderBg.size) {
      sel[i].classList.add("active");
    }
  }
});

$("#slider-bg-fgcolor").on("show.bs.dropdown", async (event) => {
  let sel = document.querySelectorAll("#slider-bg-fgcolor .dropdown-item");

  for (let i = 0; i < sel.length; i++) {
    sel[i].classList.remove("active");

    if (sel[i].text == myBreakout.settings.sliderBg.fgcolor) {
      sel[i].classList.add("active");
    }
  }
});

$("#slider-bg-bgcolor").on("show.bs.dropdown", async (event) => {
  let sel = document.querySelectorAll("#slider-bg-bgcolor .dropdown-item");

  for (let i = 0; i < sel.length; i++) {
    sel[i].classList.remove("active");

    if (sel[i].text == myBreakout.settings.sliderBg.bgcolor) {
      sel[i].classList.add("active");
    }
  }
});

// Slider background image options
$("#slider-bg-position").on("hide.bs.dropdown", async (event) => {
  let sel = document.querySelectorAll("#slider-bg-position .dropdown-item");

  if (event.clickEvent && event.clickEvent.target && event.clickEvent.target.classList.contains("dropdown-item")) {
    for (let i = 0; i < sel.length; i++) {
      sel[i].classList.remove("active");
    }
    event.clickEvent.target.classList.add("active");
    myBreakout.settings.sliderBg.position = event.clickEvent.target.text;
    await myBreakout.saveBreakout();

    updateSliderBG();
  }
});

$("#slider-bg-size").on("hide.bs.dropdown", async (event) => {
  let sel = document.querySelectorAll("#slider-bg-size .dropdown-item");

  if (event.clickEvent && event.clickEvent.target && event.clickEvent.target.classList.contains("dropdown-item")) {
    for (let i = 0; i < sel.length; i++) {
      sel[i].classList.remove("active");
    }
    event.clickEvent.target.classList.add("active");
    myBreakout.settings.sliderBg.size = event.clickEvent.target.text;
    await myBreakout.saveBreakout();

    updateSliderBG();
  }
});

$("#slider-bg-fgcolor").on("hide.bs.dropdown", async (event) => {
  let sel = document.querySelectorAll("#slider-bg-fgcolor .dropdown-item");

  if (event.clickEvent && event.clickEvent.target && event.clickEvent.target.classList.contains("dropdown-item")) {
    for (let i = 0; i < sel.length; i++) {
      sel[i].classList.remove("active");
    }
    event.clickEvent.target.classList.add("active");
    myBreakout.settings.sliderBg.fgcolor = event.clickEvent.target.text;
    await myBreakout.saveBreakout();

    updateSliderBG();
  }
});

$("#slider-bg-bgcolor").on("hide.bs.dropdown", async (event) => {
  let sel = document.querySelectorAll("#slider-bg-bgcolor .dropdown-item");

  if (event.clickEvent && event.clickEvent.target && event.clickEvent.target.classList.contains("dropdown-item")) {
    for (let i = 0; i < sel.length; i++) {
      sel[i].classList.remove("active");
    }
    event.clickEvent.target.classList.add("active");
    myBreakout.settings.sliderBg.bgcolor = event.clickEvent.target.text;
    await myBreakout.saveBreakout();

    updateSliderBG();
  }
});

// Broadcast background image options
$("#broadcast-bg-position").on("show.bs.dropdown", async (event) => {
  let sel = document.querySelectorAll("#broadcast-bg-size .dropdown-item");

  for (let i = 0; i < sel.length; i++) {
    sel[i].classList.remove("active");

    if (sel[i].text == myBreakout.settings.broadcastBg.position) {
      sel[i].classList.add("active");
    }
  }
});

$("#broadcast-bg-size").on("show.bs.dropdown", async (event) => {
  let sel = document.querySelectorAll("#broadcast-bg-size .dropdown-item");

  for (let i = 0; i < sel.length; i++) {
    sel[i].classList.remove("active");

    if (sel[i].text == myBreakout.settings.broadcastBg.size) {
      sel[i].classList.add("active");
    }
  }
});

$("#broadcast-bg-fgcolor").on("show.bs.dropdown", async (event) => {
  let sel = document.querySelectorAll("#broadcast-bg-fgcolor .dropdown-item");

  for (let i = 0; i < sel.length; i++) {
    sel[i].classList.remove("active");

    if (sel[i].text == myBreakout.settings.broadcastBg.fgcolor) {
      sel[i].classList.add("active");
    }
  }
});

$("#broadcast-bg-bgcolor").on("show.bs.dropdown", async (event) => {
  let sel = document.querySelectorAll("#broadcast-bg-bgcolor .dropdown-item");

  for (let i = 0; i < sel.length; i++) {
    sel[i].classList.remove("active");

    if (sel[i].text == myBreakout.settings.broadcastBg.bgcolor) {
      sel[i].classList.add("active");
    }
  }
});

// Broadcast background image options
$("#broadcast-bg-position").on("hide.bs.dropdown", async (event) => {
  let sel = document.querySelectorAll("#broadcast-bg-position .dropdown-item");

  if (event.clickEvent && event.clickEvent.target && event.clickEvent.target.classList.contains("dropdown-item")) {
    for (let i = 0; i < sel.length; i++) {
      sel[i].classList.remove("active");
    }
    event.clickEvent.target.classList.add("active");
    myBreakout.settings.broadcastBg.position = event.clickEvent.target.text;
    await myBreakout.saveBreakout();

    updateBroadcastBG();
  }
});

$("#broadcast-bg-size").on("hide.bs.dropdown", async (event) => {
  let sel = document.querySelectorAll("#broadcast-bg-size .dropdown-item");

  if (event.clickEvent && event.clickEvent.target && event.clickEvent.target.classList.contains("dropdown-item")) {
    for (let i = 0; i < sel.length; i++) {
      sel[i].classList.remove("active");
    }
    event.clickEvent.target.classList.add("active");
    myBreakout.settings.broadcastBg.size = event.clickEvent.target.text;
    await myBreakout.saveBreakout();

    updateBroadcastBG();
  }
});

$("#broadcast-bg-fgcolor").on("hide.bs.dropdown", async (event) => {
  let sel = document.querySelectorAll("#broadcast-bg-fgcolor .dropdown-item");

  if (event.clickEvent && event.clickEvent.target && event.clickEvent.target.classList.contains("dropdown-item")) {
    for (let i = 0; i < sel.length; i++) {
      sel[i].classList.remove("active");
    }
    event.clickEvent.target.classList.add("active");

    myBreakout.settings.broadcastBg.fgcolor = event.clickEvent.target.text;
    await myBreakout.saveBreakout();

    updateBroadcastBG();
  }
});

$("#broadcast-bg-bgcolor").on("hide.bs.dropdown", async (event) => {
  let sel = document.querySelectorAll("#broadcast-bg-bgcolor .dropdown-item");

  if (event.clickEvent && event.clickEvent.target && event.clickEvent.target.classList.contains("dropdown-item")) {
    for (let i = 0; i < sel.length; i++) {
      sel[i].classList.remove("active");
    }
    event.clickEvent.target.classList.add("active");
    myBreakout.settings.broadcastBg.bgcolor = event.clickEvent.target.text;
    await myBreakout.saveBreakout();

    updateBroadcastBG();
  }
});

// One time build the list
$("#dropdown-general-toolbar-solid").on("show.bs.dropdown", (evt) => {
  try {
    let items = [...evt.currentTarget.querySelectorAll(".dropdown-menu>a")];

    if (items.length == 0) {
      let hook = evt.currentTarget.querySelector(".dropdown-menu");
      colorList.forEach((el, i) => {
        i == 0 ? (setActive = "active") : (setActive = "");
        i > 0 ? (backgroundColor = el) : (backgroundColor = "");

        setStyle = `background: ${getColorRgb(el)}`;

        items =
          items +
          `<a class="col-12 flex-fill dropdown-item ${setActive}" href="#" data-general-toolbar-solid><span class="col-6 flex-fill" style="${setStyle}">&nbsp&nbsp&nbsp&nbsp&nbsp</span>&nbsp&nbsp${el}</a>
          `;
      });

      hook.innerHTML = items;
    }
  } catch (err) {}
});

// User selects solid color
$("#dropdown-general-toolbar-solid").on("hidden.bs.dropdown", async (evt) => {
  try {
    selectedColor = evt.clickEvent.target.text;
    if (selectedColor == undefined) {
      return;
    }
    selectedColor != "" ? (selectedColor = selectedColor.trim()) : false;
    myBreakout.settings.toolbarSolidColor = selectedColor;

    updateToolBarColorSettings();
    await myBreakout.saveBreakout();

    // Reset the active
    let items = [...evt.currentTarget.querySelectorAll(".dropdown-menu>a")];
    items.map((el) => {
      el.classList.remove("active");
      if (el.innerText.trim() === selectedColor) {
        el.classList.add("active");
      }
    });
  } catch (err) {}
});

$("#dropdown-general-toolbar-grad-left").on("show.bs.dropdown", (evt) => {
  try {
    let items = [...evt.currentTarget.querySelectorAll(".dropdown-menu>a")];

    if (items.length == 0) {
      let hook = evt.currentTarget.querySelector(".dropdown-menu");
      colorList.forEach((el, i) => {
        i == 0 ? (setActive = "active") : (setActive = "");
        i > 0 ? (backgroundColor = el) : (backgroundColor = "");

        setStyle = `background: ${getColorRgb(el)}`;

        items =
          items +
          `<a class="col-12 flex-fill dropdown-item ${setActive}" href="#" data-general-toolbar-grad-left><span class="col-6 flex-fill" style="${setStyle}">&nbsp&nbsp&nbsp&nbsp&nbsp</span>&nbsp&nbsp${el}</a>
          `;
      });

      hook.innerHTML = items;
    }
  } catch (err) {}
});

$("#dropdown-general-toolbar-grad-left").on("hidden.bs.dropdown", async (evt) => {
  try {
    selectedColor = evt.clickEvent.target.text;
    if (selectedColor == undefined) {
      return;
    }
    selectedColor != "" ? (selectedColor = selectedColor.trim()) : false;

    myBreakout.settings.toolbarGradLeftColor = selectedColor;
    updateToolBarColorSettings();
    await myBreakout.saveBreakout();

    // Reset the active
    let items = [...evt.currentTarget.querySelectorAll(".dropdown-menu>a")];
    items.map((el) => {
      el.classList.remove("active");
      if (el.innerText.trim() === selectedColor) {
        el.classList.add("active");
      }
    });
  } catch (err) {}
});

$("#dropdown-general-toolbar-grad-right").on("show.bs.dropdown", (evt) => {
  try {
    let items = [...evt.currentTarget.querySelectorAll(".dropdown-menu>a")];

    if (items.length == 0) {
      let hook = evt.currentTarget.querySelector(".dropdown-menu");
      colorList.forEach((el, i) => {
        i == 0 ? (setActive = "active") : (setActive = "");
        i > 0 ? (backgroundColor = el) : (backgroundColor = "");

        setStyle = `background: ${getColorRgb(el)}`;

        items =
          items +
          `<a class="col-12 flex-fill dropdown-item ${setActive}" href="#" data-general-toolbar-grad-right><span class="col-6 flex-fill" style="${setStyle}">&nbsp&nbsp&nbsp&nbsp&nbsp</span>&nbsp&nbsp${el}</a>
          `;
      });

      hook.innerHTML = items;
    }
  } catch (err) {}
});

$("#dropdown-general-toolbar-grad-right").on("hidden.bs.dropdown", async (evt) => {
  try {
    selectedColor = evt.clickEvent.target.text;
    if (selectedColor == undefined) {
      return;
    }
    selectedColor != "" ? (selectedColor = selectedColor.trim()) : false;

    myBreakout.settings.toolbarGradRightColor = selectedColor;
    updateToolBarColorSettings();
    await myBreakout.saveBreakout();

    // Reset the active
    let items = [...evt.currentTarget.querySelectorAll(".dropdown-menu>a")];
    items.map((el) => {
      el.classList.remove("active");
      if (el.innerText.trim() === selectedColor) {
        el.classList.add("active");
      }
    });
  } catch (err) {}
});

// Popup receives broadcast message
chrome.runtime.onMessage.addListener(async (payload, sender, cb) => {
  (async () => {
    let action = payload.action;
    let tabsQuery, tabsUpdated;
    let boolMuted;

    switch (action) {
      case "getSpkMuteStatus":
        try {
          console.log("inside getSpkMuteStatus");

          // Use the reusable function to get tab details
          let tab = await getTabById(sender.tab.id);

          // Access the mutedInfo property of the tab
          let muted = tab.mutedInfo.muted;

          // Return the current state
          cb({ muted });
        } catch (error) {
          console.error("Failed to get tab details:", error);
          cb({ error: "Failed to get tab details" });
        }
        return true;
        break;
      case "contentSpk":
        {
          let tabId = sender.tab.id;
          let tabUrl = sender.tab.url;
          let element = document.querySelector("#slider-title");

          if (!element) {
            console.log(`Element with id 'slider-title' not found for ${tabId} ${tabUrl}`);
            break;
          }

          let tabIdSlider = element.dataset.tabId;
          console.log(`Inside contentSpk tabId: ${tabId} tabIdSlider: ${tabIdSlider} tabUrl: ${tabUrl}`);

          if (tabId.toString() !== tabIdSlider) break;

          // Match !!!
          let tab = await chromeTabsGet(tabId);
          let muted = tab.mutedInfo.muted;
          console.log(`Inside contentSpk ${tabId} ${muted} ${tabUrl}`);

          if (muted) {
            document.querySelector("#thisSpk").classList.add("av-mute");
            icn = document.querySelector("#thisSpk").querySelector("i");
            icn.classList.remove("fa-volume-up");
            icn.classList.add("fa-volume-mute");
          } else {
            document.querySelector("#thisSpk").classList.remove("av-mute");
            icn = document.querySelector("#thisSpk").querySelector("i");
            icn.classList.remove("fa-volume-mute");
            icn.classList.add("fa-volume-up");
          }
        }
        break;

      case "contentMic":
        if (document.querySelector("#slider-title").innerText == payload.title) {
          if (payload.boolMuted == "true") {
            document.querySelector("#thisMic").classList.add("av-mute");
          } else {
            document.querySelector("#thisMic").classList.remove("av-mute");
          }
        }
        break;

      case "contentVid":
        if (document.querySelector("#slider-title").innerText == payload.title) {
          if (payload.boolMuted == "true") {
            document.querySelector("#thisVid").classList.add("av-mute");
          } else {
            document.querySelector("#thisVid").classList.remove("av-mute");
          }
        }
        break;

      case "getSelectedCourse":
        cb({
          class: "Web Magic",
          numRooms: 3,
          links: ["https://meet.google.com/abc-defg-hij", "https://meet.google.com/xyz-jksk-sks"],
        });

      // This is from the background
      case "updateSliderFocus":
        // await sleep(5000);
        let newPopup = payload.newPopup;
        console.log(`newPopup = ${newPopup}`);

        if (newPopup) {
          let openRooms2 = await chromeAllOpenRooms();
          let main = openRooms2.filter((el) => el.title === "Main");
          if (main.length === 1) {
            let mainTabId = parseInt(main[0].id, 10);
            let thisMute = await chromeTabsSendMessage(mainTabId, {
              action: "getSpkMicVidMuteState",
            });

            let thisSpk = document.querySelector("#thisSpk");
            let thisMic = document.querySelector("#thisMic");
            let thisVid = document.querySelector("#thisVid");

            // Spk
            if (thisMute.spk) {
              thisSpk.classList.add("av-mute");
              icn = thisSpk.querySelector("i");
              icn.classList.remove("fa-volume-up");
              icn.classList.add("fa-volume-mute");
            } else {
              thisSpk.classList.remove("av-mute");
              icn = document.querySelector("#thisSpk").querySelector("i");
              icn.classList.remove("fa-volume-mute");
              icn.classList.add("fa-volume-up");
            }
            // Mic
            if (thisMute.mic) {
              thisMic.classList.add("av-mute");
            } else {
              thisMic.classList.remove("av-mute");
            }
            // Vid
            if (thisMute.vid) {
              thisVid.classList.add("av-mute");
            } else {
              thisVid.classList.remove("av-mute");
            }
            console.log(`For new popup, existing main mute status: ${thisMute}`);
          }
        }

        let obj = await chromeWindowsGetCurrent({});
        await chromeWindowsUpdate2(obj.id, { focused: true });
        document.querySelector("#slider").focus();
        cb({ msg: "focused on slider" });
        break;

      case "updateMicVidButtonState":
        {
          let thisMic = document.querySelector("#thisMic");
          let thisVid = document.querySelector("#thisVid");

          console.log(`mic: ${payload.micMute}, vid: ${payload.vidMute}`);

          // Mic
          if (payload.micMuted != null) {
            if (payload.micMuted) {
              thisMic.classList.add("av-mute");
              icn = thisMic.querySelector("i");
              icn.classList.remove("fa-microphone");
              icn.classList.add("fa-microphone-slash");
            } else {
              thisMic.classList.remove("av-mute");
              icn = thisMic.querySelector("i");
              icn.classList.remove("fa-microphone-slash");
              icn.classList.add("fa-microphone");
            }
          }

          // Vid
          if (payload.vidMuted != null) {
            if (payload.vidMuted) {
              thisVid.classList.add("av-mute");
              icn = thisVid.querySelector("i");
              icn.classList.remove("fa-video");
              icn.classList.add("fa-video-slash");
            } else {
              thisVid.classList.remove("av-mute");
              icn = thisVid.querySelector("i");
              icn.classList.remove("fa-video-slash");
              icn.classList.add("fa-video");
            }
          }

          cb({ success: true });
          return true;
        }
        break;

      case "pingPopup":
        let pingObj = await chromeWindowsGetCurrent({});
        await chromeWindowsUpdate2(pingObj.id, { focused: true });
        console.log("Popup received runtime message, action: 'pingPopup'");
        cb({ msg: "popup is already open" });
        break;

      // case "GETSPKSTATE":
      //   // Get the current muted state
      //   tabsQuery = await chromeTabsQuery2({ url: sender.tab.url });
      //   boolMuted = tabsQuery[0].mutedInfo.muted;

      //   // Return the current state
      //   cb({ boolMuted: boolMuted });
      //   break;
      // case "SPKBTNCLICKED":
      //   // Get the current muted state
      //   tabsQuery = await chromeTabsQuery2({ url: sender.tab.url });
      //   boolMuted = tabsQuery[0].mutedInfo.muted;

      //   // Toggle this state
      //   tabsUpdated = await chromeTabsUpdate2(sender.tab.id, {
      //     muted: !boolMuted,
      //   });

      // // Return the new state
      // cb({ boolMutedNew: tabsUpdated.mutedInfo.muted });
      // break;

      default:
        break;
    }
  })();
});

$(document).ready(function () {
  $('[data-toggle="tooltip"]').tooltip();
});
