// Globals
let g_joinedFlag = false;
let g_openedFlag = false;
let g_synced = false;
let g_autoAdmitted = false;
let g_relevant = false;
let g_tabColorCode = "100";

// let g_spk_classList = {
//   muted: [],
//   mutedFalse: [],
// };

let g_autoEnterFlag = null;
let g_hangup_moved = false;

let g_myBreakout;

let colors = {
  red: "#ef5350", // mat-red
  // green: "#69F0AE",
  green: "#66bb6a", // mat-green
  yellow: "#FFF59D",
};

// let { breakout: myBreakout } = await chromeStorageLocalGet("breakout");
//

const getRemoveLI = () => {
  const listItems = document.querySelectorAll("li");

  for (const li of listItems) {
    if (Array.from(li.querySelectorAll("i")).some((icon) => icon.textContent.trim() === "remove_circle_outline")) {
      return li;
    }
  }

  return null;
};

const getMoreActionsButtons = () => {
  const buttons = document.querySelectorAll(`div[role="list"] button`);

  return Array.from(buttons).filter((button) => Array.from(button.querySelectorAll("i")).some((icon) => icon.textContent.trim() === "more_vert"));
};

const getChatButton = () => {
  // const buttons = document.querySelectorAll("button");

  // return (
  //   Array.from(buttons).find((button) =>
  //     Array.from(button.querySelectorAll("i")).some((icon) => icon.textContent.trim() === "chatchat_bubble")
  //   ) || null
  // );

  const chatButton = Array.from(document.querySelectorAll("button")).find((btn) => btn.textContent.trim() === "chatchat_bubble");

  return chatButton;
};

const getSendButton = () => {
  const buttons = document.querySelectorAll("button");

  return Array.from(buttons).find((button) => Array.from(button.querySelectorAll("i")).some((icon) => icon.textContent.trim() === "send")) || null;
};

const getMicVidElements = () => {
  console.log("inside getMicVidElements");

  // const buttons = document.querySelectorAll("button[aria-label][data-is-muted][data-mute-button]");
  const buttons = document.querySelectorAll("button[aria-label][data-is-muted]");

  let btnMic, btnMicTurnOn, btnMicTurnOff, btnVid, btnVidTurnOn, btnVidTurnOff;

  if (buttons.length >= 1) {
    btnMic = buttons[0];
    if (btnMic.getAttribute("data-is-muted") === "true") {
      btnMicTurnOn = btnMic;
      btnMicTurnOff = null;
    } else {
      btnMicTurnOn = null;
      btnMicTurnOff = btnMic;
    }
  } else {
    btnMic = btnMicTurnOn = btnMicTurnOff = null;
  }

  if (buttons.length >= 2) {
    btnVid = buttons[1];
    if (btnVid.getAttribute("data-is-muted") === "true") {
      btnVidTurnOn = btnVid;
      btnVidTurnOff = null;
    } else {
      btnVidTurnOn = null;
      btnVidTurnOff = btnVid;
    }
  } else {
    btnVid = btnVidTurnOn = btnVidTurnOff = null;
  }

  console.log(`btnMic = ${btnMic}`);
  console.log(`btnVid = ${btnVid}`);

  return { btnMic, btnVid, btnMicTurnOn, btnMicTurnOff, btnVidTurnOn, btnVidTurnOff };
};

const refreshBreakoutObject = async () => {
  let { breakout: test } = await chromeStorageLocalGet("breakout");
  g_myBreakout = test;
};

// Only click on button once, while outside
const oneTimeClick = async () => {
  try {
    if (g_joinedFlag) {
      return;
    }

    // Make sure this is relevant
    if (isRelevant() == false) {
      return;
    }

    // await sleep(5000);
    let settings = myBreakout.settings;

    g_autoEnterFlag = false;

    if (settings.autoEnter) {
      g_autoEnterFlag = true;
    }

    let btns = getMicVidElements();
    let btnMic = btns.btnMic;
    let btnVid = btns.btnVid;

    let btnCheck;

    // Look to see if hangup button exists.  If so then u are inside meeting
    // This line below will fail if not inside meeting.  Try/Catch
    // ********* June 10 **********Look for the revised verison June 10

    // *** Feb 5, 2022
    let btnsCheck = [...document.querySelectorAll("button")]?.filter((el) => el.querySelector("i")?.innerText.includes("call_end"));

    if (btnsCheck.length > 0) {
      btnCheck = btnsCheck[0];
    } else if (document.querySelector('[data-tooltip-id="tt-c6"]')) {
      btnCheck = document.querySelector('[data-tooltip-id="tt-c6"]');
    } else if (document.querySelector('[data-tooltip-id="tt-c8"]')) {
      btnCheck = document.querySelector('[data-tooltip-id="tt-c8"]');
      // flag40 = true;
    } else {
      // btnCheck = btnMic.parentElement?.parentElement?.parentElement?.nextElementSibling?.querySelector('[role="button"]');
    }
    // ***************

    // Feb 3
    let testSpk = document.querySelector('[data-btn-breakout="spk"]');

    if (testSpk && btnCheck && btnCheck.dataset.isMuted) {
      return;
    }

    // check
    micIsMuted = btnMic.dataset.isMuted == "true";
    vidIsMuted = btnVid.dataset.isMuted == "true";

    if (!micIsMuted) {
      btnMic.click();
    }
    if (!vidIsMuted) {
      btnVid.click();
    }

    // await sleep(2000);

    let btnHangup = btnCheck;
    console.log(btnCheck);
    console.log("btnHangup is created");

    // Wait for hangup button
    if (btnMic && btnVid && !g_joinedFlag && btnHangup) {
      g_joinedFlag = true;

      await createSpeakerButton();
      btnHangup.dataset.btnBreakout = "hangup";

      // let btnSpk = document.querySelector('[data-btn-breakout="spk"]');

      // btnMic = document.querySelector('[data-btn-breakout="mic"]');
      // // btnBye = btnMic.nextElementSibling;
      // btnVid = document.querySelector('[data-btn-breakout="vid"]');

      // g_spk_classList.mutedFalse = [...document.querySelector('[data-btn-breakout="mic"]').classList];
      // g_spk_classList.muted = [...document.querySelector('[data-btn-breakout="mic"]').classList];

      // await sleep(1000);

      // ********* June 10 **********Look for the revised verison June 10
      // if (!document.querySelector('[data-tooltip-id="tt-c6"]')) {
      // moveHangupBtn();
      // }
      // ******** June 10

      updateToolbarColors();

      let muted = await setTabColor();

      setBtnColor(muted);

      setTabTitle();

      g_joinedFlag = true;

      if (g_myBreakout.settings.newMute == true) {
        console.log("new audio mute method");
        document.querySelector('[data-btn-breakout="spk"]').addEventListener("click", handleSpkBtnClick3);

        //  Mute if not in the main room
        let rooms = [...g_myBreakout.myRooms];
        let roomsTest = rooms?.filter((el, i) => {
          return el?.link === document.URL && i > 0;
        });

        // console.log(document.URL);
        // console.log(rooms);
        // console.log(roomsTest);

        if (roomsTest.length > 0) {
          console.log("not in the main room, so mute");
          // test NOTE 09/14/2024 don't think i need this
          // document.querySelector('[data-btn-breakout="spk"]').click();
        }

        // document.querySelector('[data-btn-breakout="spk"]').click();
        // Default is current method ("old")
      } else {
        // console.log("old audio mute method");
        // document.querySelector('[data-btn-breakout="spk"]').addEventListener("click", handleSpkBtnClick);
      }

      btnMic.addEventListener("click", handleMicBtnClick);
      btnVid.addEventListener("click", handleVidBtnClick);
    }
  } catch (err) {
    // console.log("Error in oneTimeClick");
  }

  // } catch (err) {}
};

const autoAdmit = (evt) => {
  try {
    // console.log(`autoAdmit2 = ${autoAdmit2}`);
    // let admitBtn = document.querySelector("[data-mdc-dialog-action='accept']");
    let admitBtn = document.querySelector("[data-is-touch-wrapper] button[data-idom-class][data-promo-anchor-id]");

    if (admitBtn) {
      testSpan = admitBtn.querySelector("span");
      if (testSpan) {
        console.log(`g_autoAdmitted = ${g_autoAdmitted}`);
        console.log(`autoAdmit2 = ${admitBtn}`);
        (async () => {
          await sleep(1);
          if (admitBtn) {
            admitBtn.click();
          }
        })();
      }
    }
  } catch (err) {}
};

const handleMutingFromContext = ({
  // action,
  winId,
  tabId,
  // spkIsMuted,
  boolMic,
  boolVid,
  boolSpk,
  boolFrzt,
  boolFrz0,
  commands,
  menuId,
  tabId2,
}) => {
  // *** Begin freeze

  try {
    // Ignore this is menuId[0]="g" and it is the main room
    if (menuId[0] == "g") {
      if (getMeetUrlBase(document.URL) == myBreakout.myRooms[0].linkFetchedUrl) {
        return;
      }
    }

    boolNotMe = tabId != tabId2;
    // boolFrzt = boolFrzt == true;

    // Individual freeze toggle only applies to me
    if (boolNotMe) {
      boolFrzt = false;
    }

    freezeState = document.querySelector("[data-freeze-state]").dataset.freezeState;
    freezeState = freezeState == "true";
    boolChange = menuId.charAt(0) != "f";

    // If there is a change request and it comes from me, I will unfreeze
    if (boolChange && !boolNotMe) {
      freezeState = false;
    }

    // Toggle freeze
    if (boolFrzt) {
      freezeState = !freezeState;
    }

    // Global unfreeze
    if (boolFrz0) {
      freezeState = false;
    }

    document.querySelector("[data-freeze-state]").dataset.freezeState = freezeState;

    let myObj = {
      boolNotMe,
      boolFrzt,
      boolFrz0,
      freezeState,
      boolChange,
    };

    // If i am frozen and someone other than me tells me to do something, i exit (refuse)
    if (freezeState && boolChange && boolNotMe) {
      return;
    }

    if (freezeState) {
      return [...document.querySelectorAll('link[rel="shortcut icon"]')].map((el) => {
        stubs = el.href.split("img/");
        firstChar = stubs[1].charAt(0);
        if (firstChar == "g" || firstChar == "r") {
          stub1 = stubs[0];
          stub2 = `img/f${stubs[1]}`;
          el.href = `${stub1}${stub2}`;
        }
      });
    }
    // ***** End freeze

    // Execute the mute commands by clicking on the buttons
    let btns = document.querySelectorAll("[data-btn-breakout]");

    btnSpk = btns[0];
    btnMic = btns[1];
    btnVid = btns[2];

    //
    spkIsMuted = btnSpk.dataset.isMuted == "true";
    micIsMuted = btnMic.dataset.isMuted == "true";
    vidIsMuted = btnVid.dataset.isMuted == "true";

    let { muteSpk, muteMic, muteVid } = commands;

    btnMic.isMuted;
    // Get the current muted this.state.

    if (boolSpk) {
      if ((spkIsMuted && !muteSpk) || (!spkIsMuted && muteSpk)) {
        console.log("click on btnSpk");
        btnSpk.click();
      }
    }

    if (boolMic) {
      if ((micIsMuted && !muteMic) || (!micIsMuted && muteMic)) {
        btnMic.click();
      }
    }

    if (boolVid) {
      if ((vidIsMuted && !muteVid) || (!vidIsMuted && muteVid)) {
        btnVid.click();
      }
    }
  } catch (error) {}
};

const updateToolbarColors = () => {
  (async () => {
    try {
      let fontBlack = [];

      fontBlack["Orange_Dracula"] = true;
      fontBlack["Purple_Dracule"] = true;
      fontBlack["Green_Dracula"] = true;
      fontBlack["Red_Dracula"] = true;
      fontBlack["Pink_Dracula"] = true;
      fontBlack["LightBlue_Dracula"] = true;
      fontBlack["Yellow_Dracula"] = true;

      // await sleep(500);

      // Refresh the settings
      let { breakout: test } = await chromeStorageLocalGet("breakout");
      myBreakout.settings = { ...test.settings };

      let toolbar = document.querySelector("[data-btn-breakout]").parentElement.parentElement.parentElement;

      let { toolbarSolid, toolbarSolidColor, toolbarGradLeftColor, toolbarGradRightColor } = myBreakout.settings;

      toolbar.style.backgroundImage = "";
      toolbar.style.backgroundColor = "";
      toolbar.style.background = "";
      toolbar.style.color = "";

      if (toolbarSolid) {
        toolbar.style.background = `${getColorRgb(toolbarSolidColor)}`;

        if (fontBlack[toolbarSolidColor]) {
          toolbar.style.color = "black";
        }
      } else {
        toolbar.style.background = `linear-gradient(to right, 
        ${getColorRgb(toolbarGradLeftColor)}, 
        ${getColorRgb(toolbarGradRightColor)}, 
        ${getColorRgb(toolbarGradLeftColor)})`;
      }

      // Shadows on buttons
      btnSpk = document.querySelector('[data-btn-breakout="spk"]');
      btnMic = document.querySelector('[data-btn-breakout="mic"]');
      btnVid = document.querySelector('[data-btn-breakout="vid"]');
      btnHangup = document.querySelector('[data-btn-breakout="hangup"]');

      btnSpk.style.boxShadow = "1px 1px 2px black";
      btnMic.style.boxShadow = "1px 1px 2px black";
      btnVid.style.boxShadow = "1px 1px 2px black";
      btnHangup.style.boxShadow = "1px 1px 2px black";
    } catch (err) {}
  })();
};

const moveHangupBtn = () => {
  try {
    btnVid = document.querySelector('[role="button"][data-btn-breakout="vid"]');
    btnBye = btnVid.parentElement.parentElement.previousElementSibling;
    btnBye.firstElementChild.style.backgroundColor = "yellow";
    btnBye.firstElementChild.style.backgroundColor = colors.yellow;
    btnBye.firstElementChild.dataset.breakoutHangup = "false";
    btnTop = btnBye.parentElement;
    btnTop.removeChild(btnBye);
    btnTop.appendChild(btnBye);

    g_hangup_moved = true;
  } catch (err) {
    alert(`Problem ${JSON.stringify(err)}`);
  }
};

const handleMicBtnClick = async (event) => {
  // await sleep(1000);
  if (!event.isTrusted) {
    return;
  }

  try {
    console.log("mic clicked");

    await sleep(1);

    let muted = await setTabColor();

    setBtnColor(muted);

    await chromeRuntimeSendMessage({
      action: "updateMicVidButtonState",
      micMuted: muted.mic,
      vidMuted: null,
    });
  } catch (error) {}
};

const handleVidBtnClick = async (event) => {
  // await sleep(1000);
  if (!event.isTrusted) {
    return;
  }

  try {
    console.log("vid clicked");

    await sleep(1);

    let muted = await setTabColor();

    setBtnColor(muted);

    await chromeRuntimeSendMessage({
      action: "updateMicVidButtonState",
      micMuted: null,
      vidMuted: muted.vid,
    });
  } catch (error) {}
};

const handleSpkBtnClick3 = async (event) => {
  // 08.03.2024

  try {
    let l_currentTarget = event.currentTarget;

    // Get the button current state
    let l_btn = document.querySelector('[data-btn-breakout="spk"][data-is-muted]');

    if (!l_btn) {
      console.log("Cannot find the speaker button on click");
      return false;
    }

    // Call the background to mute
    console.log("clicked btnSpk 3");

    let { boolMuted } = await chromeRuntimeSendMessage({
      action: "SPKBTNCLICKED",
    });

    // This is the new state
    l_currentTarget.dataset.isMuted = boolMuted;
    l_btn.dataset.isMuted = boolMuted;

    // Get the speaker muted icons
    let l_mutedIconTrue = l_currentTarget.querySelector('[data-muted-icon="true"]');
    let l_mutedIconFalse = l_currentTarget.querySelector('[data-muted-icon="false"]');

    // Already toggled
    if (boolMuted) {
      l_mutedIconTrue.style.display = "flex";
      l_mutedIconFalse.style.display = "none";
      l_btn.classList.add("av-mute");
      l_btn.classList.add("breakout-mute");
      l_btn.classList.remove("breakout-unmute");

      // New state is muted (Red)
    } else {
      l_mutedIconTrue.style.display = "none";
      l_mutedIconFalse.style.display = "flex";
      l_btn.classList.remove("av-mute");
      l_btn.classList.remove("breakout-mute");
      l_btn.classList.add("breakout-unmute");
    }

    await sleep(1);

    let muted = await setTabColor();

    setBtnColor(muted);

    await chromeRuntimeSendMessage({
      action: "contentSpk",
      title: document.title,
      boolMuted: boolMuted,
    });

    return true;
  } catch (error) {
    console.log(`Error in handleSpkBtnClick3 `, error);
    return false; // Ensure a boolean is always returned
  }
};

const setBtnColor = (muted) => {
  try {
    // Reset the white colors
    btnSpk = document.querySelector('[data-btn-breakout="spk"]');
    // btnMic = document.querySelector('[data-btn-breakout="mic"]');
    // btnVid = document.querySelector('[data-btn-breakout="vid"]');

    btns = getMicVidElements();
    let btnMic = btns.btnMic;
    let btnVid = btns.btnVid;

    if (btnSpk) {
      btnSpk.style.boxShadow = "1px 1px 2px black";
      btnSpk.style.borderRadius = "50%";

      btnMic.style.boxShadow = "1px 1px 2px black";
      btnVid.style.boxShadow = "1px 1px 2px black";

      if (muted.spk == "true") {
        btnSpk.style.backgroundColor = colors.red;
        btnSpk.style.borderColor = colors.red;
        btnSpk.style.color = "white";
      } else {
        btnSpk.style.backgroundColor = colors.green;
        btnSpk.style.borderColor = colors.green;
        btnSpk.style.color = "white";
      }
    }

    // Mic
    if (btnMic.dataset.isMuted == "true") {
      btnMic.style.backgroundColor = colors.red;
      btnMic.style.color = "white";
    } else {
      btnMic.style.backgroundColor = colors.green;
      btnMic.style.color = "white";
    }

    // Vid
    if (btnVid.dataset.isMuted == "true") {
      btnVid.style.backgroundColor = colors.red;
      btnVid.style.color = "white";
    } else {
      btnVid.style.backgroundColor = colors.green;
      btnVid.style.color = "white";
    }
  } catch (error) {
    console.log(error);
  }
};

const chromeRuntimeSendMessage2 = (message) => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError));
      } else {
        resolve(response);
      }
    });
  });
};

const createSpeakerButton = async () => {
  console.log("createSpeakerButton");
  let test = document.querySelector('[data-btn-breakout="spk"]');
  if (test) {
    return;
  }

  let mutedStyle = "my-breakout-speaker-muted";
  let btns = document.querySelectorAll('[role="button"][data-is-muted]');

  if (btns.length < 2) {
    console.log("Problem in create speaker button: Not enough buttons found.");
    return; // Exit the function if not enough buttons are found
  }

  // Assign the attributes
  btns[0].dataset.btnBreakout = "mic";
  btns[1].dataset.btnBreakout = "vid";

  // Remove the event listeners to avoid duplication
  btns[0].removeEventListener("click", handleMicBtnClick);
  btns[1].removeEventListener("click", handleVidBtnClick);

  // Add the event listeners again
  btns[0].addEventListener("click", handleMicBtnClick);
  btns[1].addEventListener("click", handleVidBtnClick);

  // let topNode = btns[0].parentElement.parentElement.parentElement.parentElement.parentElement;
  // let topNode = document.querySelector('div[data-promo-placement-align-start]').parentElement;
  // 01/30/2025
  let topNode = document.querySelector('div[role="region"][aria-label] > div[jsname]');
  //

  let btnSpk = document.createElement("div");
  btnSpk.classList.add("my-breakout-speaker-btn");

  // Get the speaker muted status
  try {
    // await sleep(10000);
    // let muted = await chromeRuntimeSendMessage2("getSpkMuteStatus");
    console.log(`create new speaker`);
  } catch (error) {
    console.log("Error in calling getSpkMuteStatus", error);
  }

  mutedStyle = "";
  let micClassList = [...btns[0].classList];
  for (let i = 0; i < micClassList.length; i++) {
    btnSpk.classList.add(micClassList[i]);
  }

  btnSpk.style.float = "left";
  btnSpk.style.position = "relative";
  btnSpk.style.backgroundColor = colors.green; // Ensure colors.green is defined
  btnSpk.style.color = "white";

  btnSpk.dataset.btnBreakout = "spk";
  btnSpk.dataset.isMuted = false;
  btnSpk.dataset.tooltip = "Turn off speaker";
  btnSpk.dataset.ariaLabel = "Turn off speaker";
  btnSpk.dataset.responseDelayMs = "0";

  btnSpk.innerHTML = `<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.5.0/css/all.css"
  integrity="sha384-B4dIYHKNBt8Bc12p+WXckhzcICo0wtJAoU8YZTY5qE0Id1GSseTk6S+L3BlXeVIU" crossorigin="anonymous" />
  <div>
    <i style="display: none" class="fas fa-volume-mute my-breakout-speaker-icon ${mutedStyle}" data-muted-icon="true"></i>
    <i style="display: flex" class="fas fa-volume-up my-breakout-speaker-icon" 
    data-freeze-state="false"
    data-muted-icon="false"></i>
  </div>`;

  topNode.prepend(btnSpk);

  // wait a few clicks so it updates
  await sleep(10);

  // Select the element
  const spkButton = document.querySelector('[data-btn-breakout="spk"]');

  if (spkButton) {
    // Remove the event listener if it exists
    spkButton.removeEventListener("click", handleSpkBtnClick3);

    // Add the event listener
    spkButton.addEventListener("click", handleSpkBtnClick3);

    // Handle styling
    let { muted } = await chromeRuntimeSendMessage2({ action: "getSpkMuteStatus" });
    console.log("speaker muted is ", muted);

    // Get the speaker muted icons
    let l_mutedIconTrue = spkButton.querySelector('[data-muted-icon="true"]');
    let l_mutedIconFalse = spkButton.querySelector('[data-muted-icon="false"]');

    // Already toggled
    if (muted) {
      l_mutedIconTrue.style.display = "flex";
      l_mutedIconFalse.style.display = "none";
      spkButton.classList.add("av-mute");
      spkButton.classList.add("breakout-mute");
      spkButton.classList.remove("breakout-unmute");

      // New state is muted (Red)
    } else {
      l_mutedIconTrue.style.display = "none";
      l_mutedIconFalse.style.display = "flex";
      spkButton.classList.remove("av-mute");
      spkButton.classList.remove("breakout-mute");
      spkButton.classList.add("breakout-unmute");
    }
  } else {
    console.log("Speaker button not found.");
  }
};

// On

// Function to send a message to the background script to get the tab's mute status
const getTabMuteStatus = async () => {
  try {
    const tabInfo = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: "getTabMuteStatus" }, (response) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve(response); // Resolve with the full tab info
      });
    });

    // console.log("Tab Info:", tabInfo);
    return tabInfo; // Full tab info, including mute status
  } catch (error) {
    console.log("Error getting tab mute status:", error);
  }
};

// Example usage (call this function with the current tab ID)

const getSpkMicVidState2 = async () => {
  if (g_joinedFlag) {
    let muted = {
      spk: false,
      mic: false,
      vid: false,
    };

    let btns = getMicVidElements();
    console.log(btns);

    let turnMicOn = btns.btnMicTurnOn;
    let turnVidOn = btns.btnVidTurnOn;

    // spk: use the gold standard, use query
    let tabInfo = await getTabMuteStatus();

    if (tabInfo) {
      muted.spk = tabInfo.mutedInfo.muted;
    }

    // mic
    if (turnMicOn) {
      muted.mic = true;
    } else {
      muted.mic = false;
    }

    // vid
    if (turnVidOn) {
      muted.vid = true;
    } else {
      muted.vid = false;
    }

    return muted;
  }
};

const getSpkMicVidState = () => {
  if (g_joinedFlag) {
    let muted = {
      spk: false,
      mic: false,
      vid: false,
    };

    btns = document.querySelectorAll("[data-btn-breakout]");

    if (btns.length > 2) {
      btnSpk = btns[0];
      btnMic = btns[1];
      btnVid = btns[2];

      muted.spk = btnSpk.dataset.isMuted === "true";
      muted.mic = btnMic.dataset.isMuted === "true";
      muted.vid = btnVid.dataset.isMuted === "true";
    }

    return muted;
  }
};

const syncNick = () => {
  let nickname = document.querySelector("[jsslot] div[jscontroller][jsaction][jsname]");

  if (nickname && !nickname.dataset.breakoutUpdated) {
    nickname.dataset.breakoutUpdated = true;
    g_synced = true;
  }
};

const toggleTitle = () => {
  let saveTitle = document.title;

  // 2024.10.02
  if (chrome.extension.inIncognitoContext) {
    // Prefix title with # if it's not already prefixed
    if (!document.title.startsWith("#")) {
      document.title = `#${saveTitle}`;
    }
  } else {
    // Restore the original title if it's in normal mode
    document.title = saveTitle;
  }
};

const setTabTitle = async () => {
  // await sleep(5000);
  // debugger;
  // See if relevant and auto admit
  try {
    // let url = document.URL.split("?");

    let url = getMeetUrlBase(document.URL);
    let rooms = [];

    if (myBreakout) {
      // let myClassName = g_myBreakout.settings.meetClassName;

      let { breakout: test } = await chromeStorageLocalGet("breakout");
      myBreakout = test;

      rooms = [...myBreakout.classes].filter((el) => el.name == myBreakout.settings.meetClassName).map((el) => el.rooms)[0];

      // rooms = [...myBreakout.myClass.rooms];
    }

    if (url.startsWith("https://meet.google.com/")) {
      // if (url.length > 0 && document.baseURI == "https://meet.google.com/") {
      // let link = url[0];

      for (let i = 0; i < rooms.length; i++) {
        // July 23, 2020 filter out the right of the ?
        // roomLink = rooms[i].link.split("?");
        // if (rooms[i].link == link) {
        // if (roomLink[0] == url[0]) {
        if (rooms[i].linkFetchedUrl == url) {
          document.title = "updating...";
          document.title = rooms[i].name;
        }
        if (chrome.extension.inIncognitoContext) {
          // Prefix title with # if it's not already prefixed
          if (!document.title.startsWith("#")) {
            document.title = `#${document.title}`;
          }
        }
      }
    }
  } catch (err) {}
};

const setTabColor = async () => {
  await sleep(10);

  let muted = { spk: true, mic: true, vid: true };
  let l_changed = false;

  if (!g_joinedFlag) return muted;

  // Check freeze state
  const el = document.querySelector("[data-freeze-state]");
  const freezeState = el?.dataset.freezeState === "true";

  if (freezeState) return muted;

  // Get speaker, microphone, and video states
  const { spk, mic, vid } = await getSpkMicVidState2();
  muted = { spk, mic, vid };

  // Set tab color based on states
  const d1 = spk ? "0" : "1";
  const d2 = mic ? "0" : "1";
  const d3 = vid ? "0" : "1";
  const tabColor = `c${d1}${d2}${d3}.png`;

  // Access individual characters of g_tabColorCode string
  let d1_old = g_tabColorCode.charAt(0); // Get the first character
  let d2_old = g_tabColorCode.charAt(1); // Get the second character
  let d3_old = g_tabColorCode.charAt(2); // Get the third character

  // Compare each d1, d2, and d3 with their corresponding characters
  // Don't send anything for spk because that is handled differently
  if (d1 !== d1_old) {
    l_changed = true;
    console.log("Spk clicked");
  }
  // Mic
  if (d2 !== d2_old) {
    l_changed = true;
    // await chromeRuntimeSendMessage({
    //   action: "updateMicVidButtonState",
    //   micMute: d2,
    //   vidMute: d3,
    // });
    // console.log("Mic clicked");
  }
  // Video
  if (d3 !== d3_old) {
    l_changed = true;
    // await chromeRuntimeSendMessage({
    //   action: "updateMicVidButtonState",
    //   micMute: d2,
    //   vidMute: d3,
    // });
    // console.log("Vid clicked");
  }

  // Update g_tabColorCode with new values using template literals
  g_tabColorCode = `${d1}${d2}${d3}`;

  // Update tab icon
  if (l_changed) {
    console.log(`Old colorcode = ${d1_old}${d2_old}${d3_old} and new is ${d1}${d2}${d3}`);

    const link = chrome.runtime.getURL(`img/${tabColor}`);
    document.querySelectorAll('link[rel="shortcut icon"]').forEach((el) => {
      el.href = link;
    });
  }

  return muted;
};

const getParticipants2_new = () => {
  // Function to store the size and position of the Google Meet window and maximize the window
  const storeAndMaximizeWindow = () => {
    const googleMeetWindow = window; // Assuming this script is running in the Google Meet window context
    const windowSizeAndPosition = {
      width: googleMeetWindow.outerWidth,
      height: googleMeetWindow.outerHeight,
      x: googleMeetWindow.screenX,
      y: googleMeetWindow.screenY,
    };

    // Store the original size and position
    localStorage.setItem("googleMeetWindowSizeAndPosition", JSON.stringify(windowSizeAndPosition));

    // Maximize the window to the screen size
    googleMeetWindow.moveTo(0, 0);
    // googleMeetWindow.resizeTo(screen.availWidth, screen.availHeight);
    googleMeetWindow.resizeTo(1000, 1000);
  };

  // Call the function to store the window size and position and maximize it
  storeAndMaximizeWindow();

  // Function to get the innerText excluding elements with role="tooltip"
  const getFilteredText = (element) => {
    let text = "";
    element.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        text += child.textContent;
      } else if (child.nodeType === Node.ELEMENT_NODE && child.getAttribute("role") !== "tooltip") {
        text += getFilteredText(child);
      }
    });
    return text;
  };

  // Select the <i> tag with innerText 'visual_effects'
  const visualEffectsIcon = Array.from(document.querySelectorAll("i")).find((element) => element.innerText === "visual_effects");

  // Traverse up the DOM tree to find the participant element
  let participantElement = visualEffectsIcon;

  while (participantElement && !participantElement.hasAttribute("data-participant-id")) {
    participantElement = participantElement.parentElement;
  }

  // Get the participant ID
  const hostParticipantId = participantElement ? participantElement.getAttribute("data-participant-id") : null;

  console.log("Host Participant ID:", hostParticipantId);

  // Go thru all participants
  // let ppt = Array.from(document.querySelectorAll('[role="listitem"]')).map((el) => {});

  // let ppt = [...document.querySelectorAll("[data-requested-participant-id]")]
  let testListItems = Array.from(document.querySelectorAll('[role="listitem"]'));
  let listItems = testListItems.filter((el, index) => index !== 0);

  let ppt = listItems
    .map((el) => {
      // elName2 = el.querySelector("[data-self-name]");
      const name = el.querySelector("[avatar-tooltip-id]").textContent;

      // Get the filtered innerText
      // const name = getFilteredText(selfName);
      console.log(name);

      elId2 = el.dataset.participantId;
      elUrl2 = el.querySelector("img[data-iml]");

      let me = false;
      let id, url;

      if (name) {
        if (el.dataset.participantId === hostParticipantId) {
          me = true;
        }
      } else {
        return false;
      }

      if (elId2.split("devices/").length > 1) {
        id = elId2.split("devices/")[1];
      } else {
        return false;
      }

      if (elUrl2) {
        url = elUrl2.src;
      } else {
        return false;
      }

      return { name, me, id, url };
    })
    .filter((el) => el != false);

  ppt.sort((a, b) => {
    aName = `${a.name.toLowerCase()} ${a.id}`;
    bName = `${b.name.toLowerCase()} ${b.id}`;

    if (aName < bName) {
      return -1;
    }
    if (aName > bName) {
      return 1;
    }
    return 0;
  });

  return ppt;
};

const getParticipants2 = () => {
  // Function to get the innerText excluding elements with role="tooltip"

  // const getFilteredText = (element) => {
  //   let text = "";
  //   element.childNodes.forEach((child) => {
  //     if (child.nodeType === Node.TEXT_NODE) {
  //       text += child.textContent;
  //     } else if (child.nodeType === Node.ELEMENT_NODE && child.getAttribute("role") !== "tooltip") {
  //       text += getFilteredText(child);
  //     }
  //   });
  //   return text;
  // };
  const getFilteredText = (element) => {
    let text = "";

    try {
      // Check if element has childNodes
      if (!element || !element.childNodes || element.childNodes.length === 0) {
        return text; // If no childNodes, return empty string
      }

      element.childNodes.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          text += child.textContent;
        } else if (child.nodeType === Node.ELEMENT_NODE && child.getAttribute("role") !== "tooltip") {
          text += getFilteredText(child); // Recursively get text from child elements
        }
      });
    } catch (error) {
      console.warn("Error while getting filtered text:", error);
    }

    return text;
  };

  // Select the <i> tag with innerText 'visual_effects'
  const visualEffectsIcon = Array.from(document.querySelectorAll("i")).find((element) => element.innerText === "visual_effects");

  // Traverse up the DOM tree to find the participant element
  let participantElement = visualEffectsIcon;

  while (participantElement && !participantElement.hasAttribute("data-participant-id")) {
    participantElement = participantElement.parentElement;
  }

  // Get the participant ID
  const hostParticipantId = participantElement ? participantElement.getAttribute("data-participant-id") : null;

  console.log("Host Participant ID:", hostParticipantId);

  let ppt = [...document.querySelectorAll("[data-requested-participant-id]")]
    .map((el) => {
      // elName2 = el.querySelector("[data-self-name]");
      const selfName = el.querySelector("[data-self-name]");

      // Get the filtered innerText
      const name = getFilteredText(selfName);
      console.log(name);

      elId2 = el.dataset.requestedParticipantId;
      elUrl2 = el.querySelector("img[data-size][data-iml]");

      let me = false;
      let id, url;

      if (name) {
        // if (name == selfName.dataset.selfName) {
        //   me = true;
        // }
        if (el.dataset.participantId === hostParticipantId) {
          me = true;
        }
      } else {
        return false;
      }

      if (elId2.split("devices/").length > 1) {
        id = elId2.split("devices/")[1];
      } else {
        return false;
      }

      if (elUrl2) {
        url = elUrl2.src;
      } else {
        return false;
      }

      return { name, me, id, url };
    })
    .filter((el) => el != false);

  ppt.sort((a, b) => {
    aName = `${a.name.toLowerCase()} ${a.id}`;
    bName = `${b.name.toLowerCase()} ${b.id}`;

    if (aName < bName) {
      return -1;
    }
    if (aName > bName) {
      return 1;
    }
    return 0;
  });

  return ppt;
};

const getParticipants = () => {
  ppt = [...document.querySelectorAll("[data-participant-id]")].map((el) => {
    elName2 = el.querySelector("[data-self-name]");
    elId2 = el.dataset.participantId;
    elUrl2 = el.querySelector("img[data-size][data-iml]");

    me = false;

    if (elName2) {
      name = elName2.innerText;
      if (elName2.innerText == elName2.dataset.selfName) {
        me = true;
      }
    } else {
      return false;
    }

    if (elId2.split("devices/").length > 1) {
      id = elId2.split("devices/")[1];
    } else {
      return false;
    }

    if (elUrl2) {
      url = elUrl2.src;
    } else {
      return false;
    }

    return { name, me, id, url };
  });

  ppt.sort((a, b) => {
    aName = `${a.name.toLowerCase()} ${a.id}`;
    bName = `${b.name.toLowerCase()} ${b.id}`;

    if (aName < bName) {
      return -1;
    }
    if (aName > bName) {
      return 1;
    }
    return 0;
  });

  return ppt;
};

const removeParticipant = (myPptId) => {
  let nodesAll = [...document.querySelectorAll("[data-requested-participant-id]")];

  let myArr = nodesAll.filter((el) => {
    let items = el.dataset.requestedParticipantId.split("/");
    let pptId = items[items.length - 1];

    if (pptId === myPptId) {
      return true;
    } else {
      return false;
    }
  });

  let btns = myArr[0].querySelectorAll('[role="button"]');

  // remove
  btns[2].click();
};

const removeAll = async (boolClose = false, winId, tabId) => {
  let boolOpen = false;
  const btn1 = document.querySelector('button[data-panel-id="1"]');
  console.log(`btn1 open? aria-pressed = ${btn1?.ariaPressed}`);

  // See if need to press btn1.  If this popup open then no need for btn1
  let testListItems = Array.from(document.querySelectorAll('[role="listitem"]'));

  if (testListItems && testListItems.length > 0) {
    console.log(`appears to be open`, testListItems);
    boolOpen = true;
  } else {
    console.log(`appears to be closed so need to click btn1`, testListItems);
    if (btn1) {
      console.log("btn1 clicked");
      simulateUserClick(btn1);
    } else {
      console.log("Panel button not found");
    }
  }

  // Now move on to list of participants
  // let listItems = Array.from(document.querySelectorAll('button[aria-label="More actions"]'));
  let listItems = getMoreActionsButtons();

  listItems = listItems.filter((el, index) => index !== 0);

  // For each participant...
  for (let i = 0; i < listItems.length; i++) {
    const el = listItems[i];
    let btn2 = el;
    if (btn2) {
      simulateUserClick(btn2);
    } else {
      console.log(`More actions button btn2 not found for list item ${i}`);
      continue;
    }

    await sleep(500);

    // Remove from the call
    // let btn3 = document.querySelector('li[aria-label="Remove from the call"]');
    let btn3 = getRemoveLI();

    if (btn3) {
      simulateUserClick(btn3);
    } else {
      console.log("Remove button btn3 not found");
      continue;
    }

    await sleep(500);

    // Confirm the remove
    let btnGroup = document.querySelectorAll('[aria-modal="true"][aria-labelledby] button');
    let btn4 = btnGroup.length > 0 ? btnGroup[1] : false;
    // let btn4 = document.querySelector('button[aria-label="Remove"]');

    if (btn4) {
      simulateUserClick(btn4);
    } else {
      console.log("Confirm button btn4 not found");
      continue;
    }

    await sleep(500);
  }

  console.log(`boolOpen ${boolOpen}`);

  if (btn1.ariaPressed === "true") {
    btn1.click();
  }
};

const removeAll2 = async (boolClose = false, winId, tabId) => {
  let me = await getMe();

  let arrAll = [...document.querySelectorAll("[data-requested-participant-id]")];

  btnsAll = [];

  arrAll.forEach((el) => {
    let items = el.dataset.requestedParticipantId.split("/");
    let pptId = items[items.length - 1];
    let btns = el.querySelectorAll('[role="button"]');

    if (pptId != me) {
      btnsAll.push({ btns: btns, pptId });
    }
  });

  // First try to remove all
  for (let i = 0; i < btnsAll.length; i++) {
    btnsAll[i].btns[2].click();
    await sleep(1500);

    let btn = document.querySelector('button[data-mdc-dialog-action="ok"]');
    if (btn) {
      btn.click();
      await sleep(1500);
    }
  }

  // Close the window
  try {
    document.querySelector('div[role="heading"][tabindex="-1"]').nextElementSibling.querySelector("button").click();
  } catch (err) {
    console.log("Error closing window");
  }

  if (boolClose) {
    return chromeRuntimeSendMessage({
      action: "closeRoomTab",
      tabId: tabId,
      winId: winId,
    });
  }
};

const hangup = async (boolClose = false, winId, tabId) => {
  try {
    // let hangup = document.querySelector('[data-btn-breakout="hangup"]');
    // hangup.click();

    myElement2 = [...document.querySelectorAll("i")].filter((el) => el.innerText.includes("call_end"));
    btn = myElement2[0].parentElement;
    btn.click();
  } catch (err) {}
};

// Function to simulate a user click
function simulateUserClick(element) {
  const event = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
    button: 0,
  });
  element.dispatchEvent(event);
}

// Function to mute all participants
const muteAll = async (myPptId) => {
  let boolOpen = false;
  const btn1 = document.querySelector('button[data-panel-id="1"]');
  console.log(`btn1 open? aria-pressed = ${btn1?.ariaPressed}`);

  // See if need to press btn1.  If this popup open then no need for btn1
  let testListItems = Array.from(document.querySelectorAll('[role="listitem"]'));

  if (testListItems && testListItems.length > 0) {
    console.log(`appears to be open`, testListItems);
    boolOpen = true;
  } else {
    console.log(`appears to be closed so need to click btn1`, testListItems);
    if (btn1) {
      console.log("btn1 clicked");
      simulateUserClick(btn1);
    } else {
      console.log("Panel button not found");
    }
  }

  // // See if need to press btn1.  If this popup open then no need for btn1
  // let testListItems = Array.from(document.querySelectorAll('[role="listitem"]'));

  // if (testListItems && testListItems.length > 0) {
  //   const btn1 = document.querySelector('button[data-panel-id="1"]');
  //   if (btn1) {
  //     simulateUserClick(btn1);
  //   } else {
  //     console.error("Panel button not found");
  //     return;
  //   }
  // }

  // Now move on to list of participants
  let listItems = Array.from(document.querySelectorAll('[role="listitem"]'));

  listItems = listItems.filter((el, index) => index !== 0);

  for (let i = 0; i < listItems.length; i++) {
    const el = listItems[i];
    let btn2 = el.querySelector("button");
    if (btn2) {
      simulateUserClick(btn2);
    } else {
      console.log(`Mute button not found for list item ${i}`);
      continue;
    }

    await sleep(10);

    // For each need to click on the mute button
    let btn3 = document.querySelector('[data-mdc-dialog-action="ok"]');
    if (btn3) {
      simulateUserClick(btn3);
    } else {
      console.log("Confirm button not found");
    }

    await sleep(100);
  }

  console.log(`boolOpen ${boolOpen}`);

  if (btn1.ariaPressed === "true") {
    btn1.click();
  }
};

// const muteAll = async (myPptId) => {
//   const btn1 = document.querySelector('button[data-panel-id="1"]');
//   btn1.click();

//   let listItems = Array.from(document.querySelectorAll('[role="listitem"]'));

//   listItems = listItems.filter((el, index) => index !== 0);

//   for (let i = 0; i < listItems.length; i++) {
//     const el = listItems[i];
//     let btn2 = el.querySelector("button");
//     btn2.click();

//     await sleep(10);

//     btn3 = document.querySelector('[data-mdc-dialog-action="ok"]');
//     btn3.click();

//     await sleep(100);
//   }
// };

const muteAll_old = async (myPptId) => {
  let me = await getMe();

  let ppts = document.querySelectorAll("[data-participant-id]");
  // let ppts = document.querySelectorAll("[data-requested-participant-id]");

  for (let i = 1; i < ppts.length; i++) {
    let btn = ppts[i].querySelector("button");
    btn.click();
    // await sleep(1500);
    await sleep(100);

    let btn2 = document.querySelector('[data-mdc-dialog-action="ok"]');
    if (btn2) {
      btn2.click();
      await sleep(1500);
    }
  }

  // Close the window
  try {
    document.querySelector('div[role="heading"][tabindex="-1"]').nextElementSibling.querySelector("button").click();
  } catch (err) {}
};

const getMe = async () => {
  try {
    let myElement = [...document.querySelectorAll("i")].filter((el) => el.innerText.includes("people_alt"));
    let btn = myElement[0].parentElement;

    let ttc12 = document.querySelector('[data-tooltip-id="tt-c12"]');
    let ttc11 = document.querySelector('[data-tooltip-id="tt-c11"]');
    let other = document.querySelectorAll("[jsshadow][role='button'][data-tab-id='1']");

    // Normal processing
    if (btn.tagName == "BUTTON") {
      btn.click();

      //
    } else if (ttc12) {
      ttc12.click();

      //
    } else if (ttc11) {
      ttc11.click();

      // GUI changed so use other
    } else if (other.length > 0) {
      other[0].click();
    }

    await sleep(2000);

    let arrAll = [...document.querySelectorAll("[data-participant-id]")];

    let items = arrAll[0].dataset.participantId.split("/");
    let pptId = items[items.length - 1];

    return pptId;
  } catch (err) {}
};

const showAllPpt = () => {
  try {
    document.querySelectorAll("[jsshadow][role='button'][data-tab-id='1']")[0].click();
  } catch (err) {}
};

// July 19, 2020 - Not used as of yet
const getNewBreakout = async () => {
  let { breakout: test } = await chromeStorageLocalGet("breakout");
  let myBreakout = test;
  g_myBreakout = myBreakout;

  // await sleep(5000);
  let settings = myBreakout.settings;

  g_autoEnterFlag = false;
  if (settings.autoEnter) {
    g_autoEnterFlag = true;
  }
};

const syncGC2 = async () => {
  console.log("synced");

  let boolError = false;
  let url = document.URL;
  let selectedCourse;

  // Ask the popup to give you the linkschromeRuntimeSendMessage
  try {
    selectedCourse = await chromeRuntimeSendMessage({
      action: "getSelectedCourse",
    });
  } catch (err) {
    return alert(
      `Please open the Breakout Rooms extension control panel and make sure that this GC course is selected in the Rooms tab.  You can open the control panel by single clicking on the Breakout Rooms extension button in the menu bar.  It is the purple "b" icon`
    );
  }

  alert(`The selected URL is ${selectedCourse.links[0]}`);
  // if (!url.startsWith("https://meet.google.com/")) {
  //   boolError = true;
  //   return alert(
  //     `This is not a google meet.  This URL is ${document.URL} which means that it is not a google meet`
  //   );
  // }

  // let list = [...document.querySelectorAll("#list-rooms-hook")];

  // if (!list || list.length < 1) {
  //   boolError = true;
  //   return alert(
  //     `Please open the Breakout Rooms extension control panel and make sure that this GC course is selected in the Rooms tab.  You can open the control panel by single clicking on the Breakout Rooms extension button in the menu bar.  It is the purple "b" icon`
  //   );
  // }

  // Tell the popup to update

  // if (boolEror) {
  //   return;
  // }
};

const isRelevant = () => {
  return true;

  let rooms = g_myBreakout.myRooms;
  let flag = false;

  for (let i = 0; i < rooms.length; i++) {
    if (getMeetUrlBase(document.URL) == rooms[i].linkFetchedUrl) {
      g_relelvant = true;
      flag = true;
      break;
    }
  }

  return flag;
};

// 2024.10.02
const simulateStudents = async () => {
  // console.log("inside simulateStudents" + window.location.hash);

  // Check if the URL contains #breakout_testing
  if (window.location.hash === "#breakout_testing") {
    // console.log("Running breakout testing script");

    // Step 1: Extract the student's name from the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const studentName = urlParams.get("student"); // Looks for ?student=Student_01

    if (studentName) {
      // Step 2: Input the student's name into the name field
      const nameField = document.querySelector('input[type="text"][autocomplete="name"]');
      if (nameField) {
        nameField.value = studentName;

        // Trigger the input event to register the value
        const event = new Event("input", { bubbles: true });
        nameField.dispatchEvent(event);

        // console.log("Student name set to:", studentName);
      } else {
        // console.log("Name input field not found.");
        return; // Stop if no input field is found
      }

      // Step 3: Remove the disabled attribute from the join button
      const joinButton = document.querySelector("button[data-promo-anchor-id][disabled]");
      if (joinButton) {
        joinButton.removeAttribute("disabled");
        console.log("Disabled attribute removed from the join button.");

        // Step 4: Wait for 500ms
        await sleep(500);

        // Step 5: Click the button
        joinButton.click();
        console.log("Join button clicked.");
      } else {
        // console.log("Join button not found or already enabled.");
      }
    } else {
      console.log("Student name not found in the URL.");
    }
  } else {
    // console.log("URL does not contain #breakout_testing, script will not run.");
  }
};

// New stuff 2024.08.16
const ElementUpdater = (function () {
  let valueSetterCache = new WeakMap(); // Use WeakMap to cache value setters for elements

  function getValueSetter(element) {
    if (!valueSetterCache.has(element)) {
      const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), "value") || Object.getOwnPropertyDescriptor(element, "value");
      if (descriptor && descriptor.set) {
        valueSetterCache.set(element, descriptor.set);
      } else {
        console.log("Unable to find value setter for the textarea/input element");
      }
    }
    return valueSetterCache.get(element);
  }

  function updateContent(element, content) {
    if (element.tagName.toLowerCase() === "textarea" || element.tagName.toLowerCase() === "input") {
      const setter = getValueSetter(element);
      if (setter) {
        setter.call(element, content); // Set the new content using the cached setter
        element.dispatchEvent(new Event("input", { bubbles: true })); // Dispatch an input event to trigger any bindings
      }
    } else {
      element.textContent = content; // Set the textContent for other elements
      element.dispatchEvent(new Event("contentupdate", { bubbles: true })); // Custom event for non-input elements
    }
  }

  return { updateContent };
})();

const handleSendAssignments = async (messages) => {
  // let btn = document.querySelector('button[aria-label="Chat with everyone"]');
  let btn = getChatButton();

  console.log("inside handleSendAssignments " + messages);

  if (btn.ariaPressed == "false") {
    btn.click();
    await sleep(1000);
  }

  // const btnText = document.querySelector('textarea[aria-label="Send a message"]');
  // const btnSend = document.querySelector('button[aria-label="Send a message"]');
  let btnSend = getSendButton();
  // btnSend and btnText have the same aria-label so it should work internationally?
  // let btnText = document.querySelector(`textarea[aria-label=${btnSend.ariaLabel}]`)
  let btnText = btnSend.parentElement.parentElement.querySelector("textarea");

  function sendMessage(message, callback) {
    // Update the textarea with the message using ElementUpdater
    ElementUpdater.updateContent(btnText, message);

    // Trigger a click on the send button
    btnSend.click();

    // Wait for one second before sending the next message
    setTimeout(callback, 1000);
  }

  function sendAllMessages(messages, index = 0) {
    if (index < messages.length) {
      sendMessage(messages[index], () => sendAllMessages(messages, index + 1));
    }
  }

  // Start sending the messages with a delay between each
  sendAllMessages(messages);

  // Scroll to bottom
  // await sleep(100);
  let chatContainer = document.querySelector('div[aria-live="polite"]');
  if (chatContainer) {
    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: "smooth",
    });
  }
};
