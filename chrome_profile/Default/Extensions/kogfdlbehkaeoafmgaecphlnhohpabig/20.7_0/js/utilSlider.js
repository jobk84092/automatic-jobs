const buildSlider = async () => {
  try {
    let numSelectedRooms = document.querySelector("#meet-room-number").innerText;

    let lowMemoryFlag = document.querySelector("#low-memory-option");

    let slider = document.querySelector("#slider");

    let position = slider.value;

    let sliderTitle = document.querySelector("#slider-title");

    let rooms = await chromeAllOpenRooms();
    // let rooms = await chromeAllOpenRooms(false, 0, true, false, false);
    rooms = filterExtensionRooms(rooms);
    rooms = sortRoomsTabOrder(rooms);

    if (rooms && rooms[position] && rooms.length > 0) {
      if (lowMemoryFlag) {
        slider.max = numSelectedRooms;
      } else {
        slider.max = rooms.length - 1;
      }
      sliderTitle.dataset.linkFetchedUrl = rooms[position].url;
      sliderTitle.dataset.tabId = rooms[position].id;
      sliderTitle.dataset.winId = rooms[position].windowId;
      sliderTitle.innerText = rooms[position].title;
    } else {
      slider.max = 0;
    }

    // Reset room name
    if (myBreakout && myBreakout.myRooms && myBreakout.myRooms.length > 0) {
      let numSelectedRooms = document.querySelector("#meet-room-number").innerText;

      selectedRooms = myBreakout.myRooms.slice(0, numSelectedRooms);

      selectedRooms.forEach((el) => {
        if (el.linkFetchedUrl == sliderTitle.dataset.linkFetchedUrl) {
          sliderTitle.innerText = el.name;

          // July 19
          // let subTitle = document.querySelector("#room-part-controls-title");
          // subTitle.innerText = `\u00A0 ${sliderTitle.innerText} Room Participant Controls`;
          // End July 19

          chrome.tabs.sendMessage(parseInt(sliderTitle.dataset.tabId), {
            action: "updateTabTitle",
          });
        }
      });
    }
  } catch (err) {}
};

const handleSlider = async (evt) => {
  try {
    // await chromeRuntimeSendMessage({ action: "tellContextToUpdateTabs" }); // Jan 1 2021

    let numSelectedRooms = document.querySelector("#meet-room-number").innerText;
    let lowMemoryFlag = document.querySelector("#low-memory-option").checked;
    let rooms = [];
    let url;
    let id;
    let windowId;
    let boolActive;
    let boolFocused;
    let saveWinId;
    let obj;

    muteBroadcast();

    let slider = document.querySelector("#slider");

    switch (evt.currentTarget.id) {
      case "slider-left":
        if (slider.value == 0) {
          slider.value = slider.max;
        } else {
          slider.value--;
        }
        break;
      case "slider-right":
        if (slider.value == slider.max) {
          slider.value = 0;
        } else {
          slider.value++;
        }
        break;

      default:
        break;
    }

    let position = slider.value;

    let sliderTitle = document.querySelector("#slider-title");

    // Can't rely on this
    rooms = myBreakout.myRooms;

    // Important section
    let openRooms2 = await chromeAllOpenRooms();
    // filter out the hash #breakout_testing
    openRooms2 = filterHashRooms(openRooms2);
    openRooms2 = sortRoomsTabOrder(openRooms2);
    openRooms2 = filterExtensionRooms(openRooms2);
    let currentTabId = parseInt(document.querySelector("#slider-title").dataset.tabId, 10);

    if (openRooms2.length < 1) {
      return;
    }

    if (lowMemoryFlag) {
      slider.max = numSelectedRooms;
      sliderTitle.innerText = rooms[position].name;
      // sliderTitle.dataset.linkFetchedUrl = rooms[position].linkFetchedUrl;

      switch (rooms[position].linkType) {
        case "nick":
          url = await autoCreateLink((nick = rooms[position].link));
          break;

        case "nickGC":
          let myNick = getNickFromLookup(rooms[position].link);
          url = await autoCreateLink((nick = myNick));
          break;

        case "code":
          url = "https://meet.google.com/" + rooms[position].link;
          break;

        case "url":
          url = rooms[position].link;
          break;

        default:
          break;
      }

      sliderTitle.dataset.linkFetchedUrl = url;

      let alreadyOpenFlag = openRooms2.filter((el) => el.url == url);

      if (alreadyOpenFlag.length > 0) {
        windowId = openRooms2[position].windowId;
        id = openRooms2[position].id;
      } else {
        // Send message to context to change to this url
        windowId = openRooms2[openRooms2.length - 1].windowId;
        id = openRooms2[openRooms2.length - 1].id;
        let msg = await chromeTabsSendMessage(id, {
          action: "updateUrl",
          url: url,
        });
      }

      sliderTitle.dataset.tabId = id;
      sliderTitle.dataset.winId = windowId;

      // Save my current tabId and windowId
      let currentTab = await chromeTabsQuery({
        active: true,
        currentWindow: true,
      });

      // Control panel window id
      saveWinId = currentTab[0].windowId;

      // Make tab active
      boolActive = true;
    }

    if (!lowMemoryFlag && openRooms2 && openRooms2[position] && openRooms2.length > 0) {
      // Save my current tabId and windowId
      let currentTab = await chromeTabsQuery({
        active: true,
        currentWindow: true,
      });

      // Control panel window id
      saveWinId = currentTab[0].windowId;

      slider.max = openRooms2.length - 1;

      let myRoom = rooms.filter((el) => el.linkFetchedUrl == getMeetUrlBase(openRooms2[position].url));

      if (!myRoom || myRoom.length < 1) {
        return;
      }

      sliderTitle.innerText = myRoom[0].name;
      sliderTitle.dataset.linkFetchedUrl = myRoom[0].linkFetchedUrl;
      sliderTitle.dataset.tabId = openRooms2[position].id;
      sliderTitle.dataset.winId = openRooms2[position].windowId;

      url = myRoom[0].linkFetchedUrl;
      windowId = openRooms2[position].windowId;
      id = openRooms2[position].id;

      // Make tab active
      boolActive = true;
      // chrome.tabs.update(id, { active: boolActive });

      // taken from here
    }

    if (id == undefined || windowId == undefined || saveWinId == undefined) {
      return;
    }

    // common to lowMemoryFlag and also Normal
    obj = await chromeTabsUpdate2(id, {
      active: boolActive,
    });

    boolFocused = true;

    // Slider current window
    obj = await chromeWindowsUpdate2(windowId, {
      focused: boolFocused,
    });

    // Control panel
    obj = await chromeWindowsUpdate2(saveWinId, {
      focused: boolFocused,
    });

    // Set the av values
    btnSpk = document.querySelector("#thisSpk");
    btnMic = document.querySelector("#thisMic");
    btnVid = document.querySelector("#thisVid");

    btnOtherSpk = document.querySelector("#thatSpk");
    btnOtherMic = document.querySelector("#thatMic");
    btnOtherVid = document.querySelector("#thatVid");

    menuItemThis = `this${getBoolDigit(btnSpk)}${getBoolDigit(btnMic)}${getBoolDigit(btnVid)}`;

    menuItemThat = `that${getBoolDigit(btnOtherSpk)}${getBoolDigit(btnOtherMic)}${getBoolDigit(btnOtherVid)}`;

    // >>>>>>>>>>>>> 9/13/2024 begin
    // big change, don't use this method anymore
    // handleContextMenuClick(
    //   {
    //     pageUrl: url,
    //     menuItemId: menuItemThis,
    //   },
    //   { windowId, id }
    // );

    currentTabId = parseInt(sliderTitle.dataset.tabId, 10);

    const muteSpkOtherRooms = async () => {
      try {
        // Get the list of all tabs
        const tabs = await chrome.tabs.query({});

        // Filter out the current tab and get the room ids from `openRooms2`
        let allOtherRooms = openRooms2.filter((el) => el.id !== currentTabId);

        // Create an array of promises to mute each room in parallel
        const mutePromises = allOtherRooms.map(async (room) => {
          const tab = tabs.find((t) => t.id === room.id);
          if (tab) {
            // Update the tab to mute the tab (set muted to true)
            await chrome.tabs.update(tab.id, { muted: true });

            // Send message to the tab to mute the speaker, mic, and video
            return chrome.tabs.sendMessage(tab.id, {
              action: "muteSpkMicVid",
            });
          }
        });

        // Wait for all mute actions to complete
        await Promise.all(mutePromises);

        console.log("All rooms muted successfully");
      } catch (error) {
        console.error("Error muting rooms:", error);
      }
    };

    await muteSpkOtherRooms();

    thisSpk = document.querySelector("#thisSpk");
    thisMic = document.querySelector("#thisMic");
    thisVid = document.querySelector("#thisVid");
    thisSpkMute = thisSpk.classList.contains("av-mute");
    thisMicMute = thisMic.classList.contains("av-mute");
    thisVidMute = thisVid.classList.contains("av-mute");

    await chrome.tabs.update(currentTabId, { muted: thisSpkMute });

    const checkMuteSpkStateForRooms = async () => {
      try {
        // Loop through all rooms in openRooms2
        const muteStates = await Promise.all(
          openRooms2.map(async (room) => {
            return new Promise((resolve, reject) => {
              chrome.tabs.get(room.id, (tab) => {
                if (chrome.runtime.lastError) {
                  reject(chrome.runtime.lastError);
                } else {
                  resolve({ id: room.id, muted: tab.mutedInfo.muted, url: room.url, title: room.title });
                }
              });
            });
          })
        );

        // Log the mute states of each room
        muteStates.forEach((state) => {
          // console.log(`Room ${state.id} ${state.title} is muted: ${state.muted}`);
        });
      } catch (error) {
        console.error("Error checking mute state:", error);
      }
    };

    await checkMuteSpkStateForRooms();

    // loop thru openRooms2, if it is currentTabId then send a message to the content with the new state of the spk, mic, and vid.  If it is not the currentTabId then send a message to the content to mute spk, mic, and vid.  Note that the message to content for spk mute / unmute is ONLY for css / html update because the muting for the speaker is done using the chrome API to mute / unmute speaker.  As for the video and mic, that is done on the content side by actually clicking the buttons on the meet at the bottom

    const updateRoomStates = async () => {
      try {
        // Create an array to store the promises for muting the other rooms
        const mutePromises = [];

        // Loop through openRooms2 and handle the currentTabId separately
        for (let i = 0; i < openRooms2.length; i++) {
          const room = openRooms2[i];

          if (room.id === currentTabId) {
            // If it's the current tab, send message to update the state (unmute or other actions)
            await chrome.tabs.sendMessage(room.id, {
              action: "updateSpkMicVidMuteState",
              state: {
                spkMute: thisSpkMute,
                micMute: thisMicMute,
                vidMute: thisVidMute,
              },
            });
            console.log(`Room ${room.id}, ${room.title} spkMute:${thisSpkMute}, micMute:${thisMicMute}, vidMute: ${thisVidMute}`);
          } else {
            // For all other rooms, mute speaker, mic, and video, and add to the array of promises
            mutePromises.push(
              chrome.tabs
                .sendMessage(room.id, {
                  action: "updateSpkMicVidMuteState",
                  state: {
                    spkMute: true,
                    micMute: true,
                    vidMute: true,
                  },
                })
                .then(() => {
                  // console.log(`Room ${room.id} ${room.title} spkMute:${thisSpkMute}, micMute:${thisMicMute}, vidMute: ${thisVidMute}`);
                })
                .catch((err) => {
                  console.error(`Failed to mute room ${room.id}:`, err);
                })
            );
          }
        }

        // Wait for all mute actions to complete in parallel for other rooms
        await Promise.all(mutePromises);

        console.log("All other rooms muted successfully");
      } catch (error) {
        console.error("Error updating room states:", error);
      }
    };

    // Call this function when needed (for example, after some user interaction)
    updateRoomStates();

    // <<<<<<<<<<< 9/13/2024 end

    // end taken from here

    // New
    if (myBreakout && myBreakout.myRooms && myBreakout.myRooms.length > 0) {
      let numSelectedRooms = document.querySelector("#meet-room-number").innerText;
      selectedRooms = myBreakout.myRooms.slice(0, numSelectedRooms);
      for (let i = 0; i < selectedRooms.length; i++) {
        const el = myBreakout.myRooms[i];

        if (el.linkFetchedUrl == sliderTitle.dataset.linkFetchedUrl) {
          sliderTitle.innerText = el.name;
          await chromeTabsSendMessage(parseInt(sliderTitle.dataset.tabId), {
            action: "updateTabTitle",
          });
        }
      }
    }
  } catch (err) {
    alert(err);
  }
};

const filterExtensionRooms = (myArray) => {
  try {
    let subset = [];

    if (myArray.length > 0) {
      // Get number of breakouts
      let numRooms = document.querySelector("#meet-room-number").innerText.trim();

      // Get rooms tab rooms
      let rooms = myBreakout.myRooms;
      rooms = rooms.slice(0, numRooms + 1);

      subset = myArray.filter((el) => {
        let bool = false;

        for (let i = 0; i < rooms.length; i++) {
          if (getMeetUrlBase(el.url) == rooms[i].linkFetchedUrl) {
            bool = true;
          }
        }

        return bool;
      });
    }
    return subset;
  } catch (err) {
    return [];
  }
};

const handleSliderMute = (evt, boolClick = true) => {
  (async () => {
    btn = evt.currentTarget;
    icn = btn.querySelector("i");

    if (boolClick) {
      if (btn.classList.contains("av-mute")) {
        btn.classList.remove("av-mute");
      } else {
        btn.classList.add("av-mute");
      }

      // Update icons
      if (icn.classList.contains("fa-volume-up")) {
        icn.classList.remove("fa-volume-up");
        icn.classList.add("fa-volume-mute");
      } else if (icn.classList.contains("fa-volume-mute")) {
        icn.classList.remove("fa-volume-mute");
        icn.classList.add("fa-volume-up");
      }
      if (icn.classList.contains("fa-microphone")) {
        icn.classList.remove("fa-microphone");
        icn.classList.add("fa-microphone-slash");
      } else if (icn.classList.contains("fa-microphone-slash")) {
        icn.classList.remove("fa-microphone-slash");
        icn.classList.add("fa-microphone");
      }
      if (icn.classList.contains("fa-video")) {
        icn.classList.remove("fa-video");
        icn.classList.add("fa-video-slash");
      } else if (icn.classList.contains("fa-video-slash")) {
        icn.classList.remove("fa-video-slash");
        icn.classList.add("fa-video");
      }
    }

    sliderTitle = document.querySelector("#slider-title");

    let link = sliderTitle.dataset.link;
    let id = parseInt(sliderTitle.dataset.tabId, 10);
    let windowId = sliderTitle.dataset.winId;
    let spkMute, micMute, vidMute;

    switch (btn.id) {
      case "thisSpk":
        if (btn.classList.contains("av-mute")) {
          spkMute = true;
        } else {
          spkMute = false;
        }

        await chrome.tabs.update(id, { muted: spkMute });

        await chrome.tabs.sendMessage(id, {
          action: "updateSpkMicVidMuteState",
          state: {
            spkMute: spkMute,
            micMute: null,
            vidMute: null,
          },
        });
        break;
      case "thisMic":
        if (btn.classList.contains("av-mute")) {
          micMute = true;
        } else {
          micMute = false;
        }
        await chrome.tabs.sendMessage(id, {
          action: "updateSpkMicVidMuteState",
          state: {
            spkMute: null,
            micMute: micMute,
            vidMute: null,
          },
        });

        break;
      case "thisVid":
        if (btn.classList.contains("av-mute")) {
          vidMute = true;
        } else {
          vidMute = false;
        }
        await chrome.tabs.sendMessage(id, {
          action: "updateSpkMicVidMuteState",
          state: {
            spkMute: null,
            micMute: null,
            vidMute: vidMute,
          },
        });
        break;
      case "thatSpk":
        if (btn.classList.contains("av-mute")) {
          handleContextMenuClick({ pageUrl: link, menuItemId: "x0__" }, { windowId, id });
        } else {
          handleContextMenuClick({ pageUrl: link, menuItemId: "x1__" }, { windowId, id });
        }
        break;
      case "thatMic":
        if (btn.classList.contains("av-mute")) {
          handleContextMenuClick({ pageUrl: link, menuItemId: "x_0_" }, { windowId, id });
        } else {
          handleContextMenuClick({ pageUrl: link, menuItemId: "x_1_" }, { windowId, id });
        }
        break;
      case "thatVid":
        if (btn.classList.contains("av-mute")) {
          handleContextMenuClick({ pageUrl: link, menuItemId: "x__0" }, { windowId, id });
        } else {
          handleContextMenuClick({ pageUrl: link, menuItemId: "x__1" }, { windowId, id });
        }
        break;
      case "broadSpk":
        {
          if (btn.classList.contains("av-mute")) {
            spkMute = true;
          } else {
            spkMute = false;
          }

          // New 09/14/2024 for keeping the this buttons in sync with broadcast buttons
          let thisSpk = document.querySelector("#thisSpk");
          let thisSpkIcon = thisSpk.querySelector("i");

          if (sliderTitle.textContent !== "Main") {
            if (spkMute) {
              thisSpk.classList.add("av-mute");
              thisSpkIcon.classList.remove("fa-volume-mute");
              thisSpkIcon.classList.add("fa-volume-mute");
            } else {
              thisSpk.classList.remove("av-mute");
              thisSpkIcon.classList.remove("fa-volume-up");
              thisSpkIcon.classList.add("fa-volume-up");
            }
          }

          // Here get all the room ids and loop thru them except for main room
          let openRooms2 = await chromeAllOpenRooms();
          openRooms2 = filterExtensionRooms(openRooms2);
          openRooms2 = sortRoomsTabOrder(openRooms2);
          openRooms2 = filterExtensionRooms(openRooms2);
          openRooms2 = openRooms2.filter((room) => room.title !== "Main");

          for (let i = 0; i < openRooms2.length; i++) {
            const room = openRooms2[i];
            await chrome.tabs.update(room.id, { muted: spkMute });

            await chrome.tabs.sendMessage(room.id, {
              action: "updateSpkMicVidMuteState",
              state: {
                spkMute: spkMute,
                micMute: null,
                vidMute: null,
              },
            });
          }
        }

        break;
      case "broadMic":
        {
          if (btn.classList.contains("av-mute")) {
            micMute = true;
          } else {
            micMute = false;
          }

          // New 09/14/2024 keep thisMic in sync with broadcast
          let thisMic = document.querySelector("#thisMic");
          let thisMicIcon = thisMic.querySelector("i");

          if (sliderTitle.textContent !== "Main") {
            if (micMute) {
              thisMic.classList.add("av-mute");
              thisMicIcon.classList.remove("fa-microphone");
              thisMicIcon.classList.add("fa-microphone-slash");
            } else {
              thisMic.classList.remove("av-mute");
              thisMicIcon.classList.remove("fa-microphone-slash");
              thisMicIcon.classList.add("fa-microphone");
            }
          }

          // Here get all the room ids and loop thru them except for main room
          let openRooms2 = await chromeAllOpenRooms();
          openRooms2 = filterExtensionRooms(openRooms2);
          openRooms2 = sortRoomsTabOrder(openRooms2);
          openRooms2 = filterExtensionRooms(openRooms2);
          openRooms2 = openRooms2.filter((room) => room.title !== "Main");

          for (let i = 0; i < openRooms2.length; i++) {
            const room = openRooms2[i];
            await chrome.tabs.update(room.id, { muted: spkMute });

            await chrome.tabs.sendMessage(room.id, {
              action: "updateSpkMicVidMuteState",
              state: {
                spkMute: null,
                micMute: micMute,
                vidMute: null,
              },
            });
          }
        }
        break;
      case "broadVid":
        {
          if (btn.classList.contains("av-mute")) {
            vidMute = true;
          } else {
            vidMute = false;
          }
        }

        // New 09/14/2024 keep thisMic in sync with broadcast
        let thisVid = document.querySelector("#thisVid");
        let thisVidIcon = thisVid.querySelector("i");

        if (sliderTitle.textContent !== "Main") {
          if (vidMute) {
            thisVid.classList.add("av-mute");
            thisVidIcon.classList.remove("fa-video");
            thisVidIcon.classList.add("fa-video-slash");
          } else {
            thisVid.classList.remove("av-mute");
            thisVidIcon.classList.remove("fa-video-slash");
            thisVidIcon.classList.add("fa-video");
          }
        }

        let openRooms2 = await chromeAllOpenRooms();
        openRooms2 = filterExtensionRooms(openRooms2);
        openRooms2 = sortRoomsTabOrder(openRooms2);
        openRooms2 = filterExtensionRooms(openRooms2);
        openRooms2 = openRooms2.filter((room) => room.title !== "Main");

        for (let i = 0; i < openRooms2.length; i++) {
          const room = openRooms2[i];
          await chrome.tabs.update(room.id, { muted: spkMute });

          await chrome.tabs.sendMessage(room.id, {
            action: "updateSpkMicVidMuteState",
            state: {
              spkMute: null,
              micMute: null,
              vidMute: vidMute,
            },
          });
        }
        break;

      default:
        break;
    }

    document.querySelector("#slider").focus();
  })();

  return true;
};

const getBoolDigit = (btn) => {
  return btn.classList.contains("av-mute") ? "0" : "1";
};

const muteBroadcast = () => {
  let btn, icn;

  // Broadcast speaker
  btn = document.querySelector("#broadSpk");
  icn = btn.querySelector("i");
  btn.classList.add("av-mute");
  icn.classList.remove("fa-volume-up");
  icn.classList.add("fa-volume-mute");

  // Broadcast microphone
  btn = document.querySelector("#broadMic");
  icn = btn.querySelector("i");
  btn.classList.add("av-mute");
  icn.classList.remove("fa-microphone");
  icn.classList.add("fa-microphone-slash");

  // Broadcast video
  btn = document.querySelector("#broadVid");
  icn = btn.querySelector("i");
  btn.classList.add("av-mute");
  icn.classList.remove("fa-video");
  icn.classList.add("fa-video-slash");
};
