const throttle = (func, limit) => {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

const observerCallback = throttle((list) => {
  const evt = new CustomEvent("dom-changed", { detail: list });
  document.body.dispatchEvent(evt);
}, 1000); // Limit execution to once per second

const observer = new MutationObserver(observerCallback);

observer.observe(document.body, {
  attributes: true,
  childList: true,
  subtree: true,
});

// const observer = new MutationObserver((list) => {
//   const evt = new CustomEvent("dom-changed", { detail: list });
//   document.body.dispatchEvent(evt);
// });

// observer.observe(document.body, {
//   attributes: true,
//   childList: true,
//   subtree: true,
// });

const waitForJoinButton = setInterval(() => {
  // 2023-08-30
  let btnPresent = null;

  // 2023-08-16
  btnsArr = document.querySelectorAll("button[data-idom-class]");

  for (let i = 0; i < btnsArr.length - 2; i++) {
    if (btnsArr[i].parentElement.parentElement == btnsArr[i + 1].parentElement.parentElement) {
      btnPresent = btnsArr[i];
      break;
    }
  }

  if (btnPresent) {
    btnJoin = document.querySelector("[data-is-touch-wrapper] button[data-idom-class][data-promo-anchor-id]");
  } else {
    btnJoin = false;
  }

  (async () => {
    try {
      let { breakout: test2 } = await chromeStorageLocalGet("breakout");
      let boolJoin = false;

      if (test2.myRooms && test2.myRooms.length > 0) {
        let rooms = test2.myRooms;

        for (let i = 0; i < rooms.length; i++) {
          if (getMeetUrlBase(document.URL) == rooms[i].linkFetchedUrl) {
            if (i == 0) {
              if (test2.settings.autoJoinMain) {
                boolJoin = true;
              }
            } else {
              if (test2.settings.autoJoinBreakouts) {
                boolJoin = true;
              }
            }

            g_relelvant = true;
            break;
          }
        }
      }

      if (btnJoin && !chrome.extension.inIncognitoContext) {
        if (boolJoin) {
          await sleep(1000);
          // joinSpan.click();
          btnJoin.click();
        }
        console.log("waitForJoinButton cleared");
        clearInterval(waitForJoinButton);
      }

      // Simulate students
      await simulateStudents();
    } catch (err) {}
  })();
}, 1000);

// Extra
const simulateStudentsChangeHref = async () => {
  // Check if the current URL contains the required hash
  const hasBreakoutHash = document.URL.includes("#breakout_testing");

  // Check if this tab is in incognito mode
  const isIncog = chrome.extension.inIncognitoContext;

  // Only proceed if in incognito mode and the URL contains the breakout hash
  if (isIncog && hasBreakoutHash) {
    console.log("Incognito mode and breakout hash detected. Modifying chat links.");

    // Get the current student number from the URL, default to "01" if not present
    const urlParams = new URLSearchParams(window.location.search);
    const studentNumber = urlParams.get("student") || "A";

    // Select all anchor tags pointing to meet.google.com
    const chatLinks = document.querySelectorAll('a[href*="meet.google.com"]');

    // Iterate through each chat link
    for (const chatLink of chatLinks) {
      console.log("Found chatLink: ", chatLink);

      // Skip if the link already has the modified href (determined by a custom attribute)
      if (chatLink.hasAttribute("data-href-modified")) {
        console.log("Link already modified, skipping:", chatLink.href);
        continue;
      }

      // Modify the URL to include the student number and the hash
      let newUrl = chatLink.href;
      if (!newUrl.includes("?student=")) {
        newUrl += `?student=${studentNumber}`;
      }
      if (!newUrl.includes("#breakout_testing")) {
        newUrl += "#breakout_testing";
      }

      // Change the href to the modified URL
      chatLink.href = newUrl;
      console.log("Modified href:", newUrl);

      // Add an attribute to indicate the URL has been modified
      chatLink.setAttribute("data-href-modified", "true");

      // Optional: Log or add any additional logic if needed
    }
  } else {
    console.log("No modification needed (either not incognito or missing breakout hash).");
  }
};

document.body.addEventListener("dom-changed", async (evt) => {
  try {
    // Get the breakout object
    if (!g_myBreakout) {
      // (async () => {
      let { breakout: test } = await chromeStorageLocalGet("breakout");
      myBreakout = test;
      g_myBreakout = myBreakout;
      // })();
    }

    // If haven't initialized... *** NOTE maybe change this, 09/14/2024 ???
    if (!g_joinedFlag && g_myBreakout) {
      // Open the meets in muted video and mic mode
      let btns = document.querySelectorAll('[role="button"][data-is-muted]');
      if (btns.length > 1) {
        btnMic = btns[0];
        btnVid = btns[1];
        let micIsMuted = btnMic.dataset.isMuted == "true";
        let vidIsMuted = btnVid.dataset.isMuted == "true";
        if (!micIsMuted) {
          btnMic.click();
        }
        if (!vidIsMuted) {
          btnVid.click();
        }
      }

      // Give yourself some time before trying to initialize
      // (async () => {
      // NOTE: 09/14/2024 change from 5000 to 1000
      // await sleep(5000);

      await sleep(1000);
      oneTimeClick();

      // })();

      // Always update the speaker audio if initialized
    } else {
      // 2024, i need this
      if (!document.querySelector('[data-btn-breakout="spk"]')) {
        await createSpeakerButton();
        updateToolbarColors();
      }
      let muted = await setTabColor();
      setBtnColor(muted);
    }

    // Auto enter flag
    if (g_autoEnterFlag) {
      autoAdmit(evt);
    }

    // Google classroom sync
    if (!g_synced) {
      syncNick();
    }

    toggleTitle();

    simulateStudentsChangeHref();

    // await setTabTitle();
  } catch (err) {
    console.log(`error in try/catch for 'dom-changed' ${JSON.stringify(err)}`);
  }

  return true;
});

chrome.runtime.onMessage.addListener(async (payload, sender, cb) => {
  // console.log(payload);
  let meetBottomBar;

  switch (payload.action) {
    case "hideBar":
      meetBottomBar = document.querySelector("[data-btn-breakout]").parentElement.parentElement.parentElement.parentElement;
      meetBottomBar.style.display = "none";
      break;
    case "unHideBar":
      meetBottomBar = document.querySelector("[data-btn-breakout]").parentElement.parentElement.parentElement.parentElement;
      meetBottomBar.style.display = "";
      break;
    case "updateUrl":
      document.location.href = payload.url;
      cb({ message: "Done" });
      break;

    case "statusStudents":
      break;

    case "muting":
      console.log("muting event received");
      handleMutingFromContext(payload);
      cb({ msg: "muting done" });
      break;

    case "getWindowScreen":
      cb({
        availLeft: window.screen.availLeft,
        availWidth: window.screen.availWidth,
      });
      break;

    case "updateTabTitle2":
      console.log("updateTabTable2");
      break;

    case "updateTabTitle":
      (async () => {
        await setTabTitle();
      })();
      break;

    case "updateToolbarColors":
      updateToolbarColors();
      break;

    case "showAllPpt":
      showAllPpt();
      console.log(`my pptId = ${pptId}`);
      break;

    case "closeAllPpt":
      if (document.querySelector('[aria-label="Close"]')) {
        document.querySelector('[aria-label="Close"]').click();
      }
      break;

    case "getPpt":
      let ppt = getParticipants2();
      cb({ ppt });
      break;

    case "remove":
      removeParticipant(payload.pptId);
      cb({ msg: "ok" });
      break;

    case "muteAll":
      muteAll();
      break;

    case "getReferrer":
      let referrer = window.document.referrer;
      cb({ referrer });
      break;

    case "syncGC":
      syncGC2();
      break;

    case "removeAll":
      removeAll((boolClose = false));
      break;

    case "hangup":
      hangup((boolClose = false));
      break;

    case "closeRoom":
      removeAll((boolClose = true), (winId = payload.winId), (tabId = payload.tabId));

      cb({ msg: "room closed" });
      break;

    case "sendAssignments":
      // Edit check to make sure that you are the Main and not in incognito mode
      if (!chrome.extension.inIncognitoContext) {
        const messages = payload.messages;
        handleSendAssignments(messages);
      }
      break;

    case "clickChatButton":
      try {
        // const chatButton = document.querySelector('[aria-label="Chat with everyone"]');
        const chatButton = Array.from(document.querySelectorAll("button")).find((btn) => btn.textContent.trim() === "chatchat_bubble");
        if (chatButton.ariaPressed == "true") {
          chatButton.click();
          cb({ status: "success" });
        } else {
          cb({ status: "error", message: "Chat button not found" });
        }
      } catch (error) {
        console.log("error in clickChatButton", error);
      }
      break;

    case "getSpkMicVidMuteState":
      try {
        let currentSpkMute = document.querySelector('[data-btn-breakout="spk"]');

        let btns = getMicVidElements();
        let turnMicOn = btns.btnMicTurnOn;
        let turnVidOn = btns.btnVidTurnOn;

        let spkMute, micMute, vidMute;

        if (currentSpkMute && currentSpkMute.classList.contains("av-mute")) {
          spkMute = true;
        } else {
          spkMute = false;
        }

        if (turnMicOn) {
          micMute = true;
        } else {
          micMute = false;
        }

        if (turnVidOn) {
          vidMute = true;
        } else {
          vidMute = false;
        }

        mainStatus = {
          spk: spkMute,
          mic: micMute,
          vid: vidMute,
        };

        cb(mainStatus);
      } catch (error) {}
      break;

    case "updateSpkMicVidMuteState":
      try {
        if (!document.querySelector('[data-btn-breakout="spk"]')) {
          await sleep(2000);
        }
        const spkMute = payload.state.spkMute;
        const micMute = payload.state.micMute;
        const vidMute = payload.state.vidMute;

        // console.log(`updateSpkMicVidMuteState spkMute: ${spkMute}, micMute: ${micMute}, vidMute: ${vidMute}`);

        // Get the current state for these
        let currentSpkMute = document.querySelector('[data-btn-breakout="spk"]');

        let btns = getMicVidElements();

        let turnMicOn = btns.btnMicTurnOn;
        let turnMicOff = btns.btnMicTurnOff;
        let turnVidOn = btns.btnVidTurnOn;
        let turnVidOff = btns.btnVidTurnOff;

        // 1) Speaker mute logic
        if (currentSpkMute && spkMute != null) {
          let icons = currentSpkMute.querySelectorAll("[data-muted-icon]");

          if (spkMute && !currentSpkMute.classList.contains("av-mute")) {
            currentSpkMute.classList.add("av-mute");
            currentSpkMute.classList.add("breakout-mute");
            currentSpkMute.classList.remove("breakout-unmute");
            icons[0].style.display = "flex";
            icons[1].style.display = "none";
          } else if (!spkMute && currentSpkMute.classList.contains("av-mute")) {
            currentSpkMute.classList.remove("av-mute");
            currentSpkMute.classList.remove("breakout-mute");
            currentSpkMute.classList.add("breakout-unmute");
            icons[0].style.display = "none";
            icons[1].style.display = "flex";
          }
        }

        // 2) Microphone mute logic
        if (micMute != null) {
          if (micMute && turnMicOff) {
            turnMicOff.click(); // Click to mute microphone
          } else if (!micMute && turnMicOn) {
            turnMicOn.click(); // Click to unmute microphone
          }
        }

        // 3) Video mute logic
        if (vidMute != null) {
          if (vidMute && turnVidOff) {
            turnVidOff.click(); // Click to mute video
          } else if (!vidMute && turnVidOn) {
            turnVidOn.click(); // Click to unmute video
          }
        }

        let muted = await setTabColor();

        setBtnColor(muted);
        // console.log(muted);
      } catch (error) {
        console.log("error in updateSpkMicVidMuteState", error);
      }
      break;

    default:
      break;
  }
});
