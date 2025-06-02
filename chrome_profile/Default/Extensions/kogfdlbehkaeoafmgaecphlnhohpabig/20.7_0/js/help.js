// Get the modal
var modal = document.querySelector("#my-help");
var modalTimer = document.querySelector("#my-timer");
var modalLowMemory = document.querySelector("#my-low-memory-option");

// Get the button that opens the modal
// var btn = document.querySelector("#popup-help");
var btnTimer = document.querySelector("#status-timer");
var btnLowMemory = document.querySelector("#help-low-memory-option");

// Get the <span> element that closes the modal
var span = document.querySelector("#my-help .close-help");
var spanTimer = document.querySelector("#my-timer .close-help");
var spanLowMemory = document.querySelector("#my-low-memory-option .close-help");

// When the user clicks the button, open the modal
// btn.onclick = function () {
//   modal.style.display = "block";
// };
btnTimer.onclick = function () {
  modalTimer.style.display = "block";
};
// btnLowMemory.onclick = function () {
//   modalLowMemory.style.display = "block";
// };

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = "none";
};
spanTimer.onclick = function () {
  modalTimer.style.display = "none";
};
// spanLowMemory.onclick = function () {
//   modalLowMemory.style.display = "none";
// };

// Timer logic

let showHrs = document.querySelector("#show-hrs");
let showMin = document.querySelector("#show-min");
let showSec = document.querySelector("#show-sec");
let statusTimer = document.querySelector("#status-timer");

let boolStop = true;

// When the user clicks anywhere outside of the modal, close it
// window.onclick = function (event) {
//   if (event.target == modal) {
//     modal.style.display = "none";
//   }
// };

// Modal window for Assign Participants
var modalAdHoc = document.querySelector("#modal-ad-hoc");

// Get the button that opens the modal
var btnAdHoc = document.querySelector("#btn-ad-hoc");

// Get the <span> element that closes the modal
var spanAdHoc = document.querySelector("#close-ad-hoc");

// When the user clicks the button, open the modal
btnAdHoc.onclick = function () {
  modalAdHoc.style.display = "block";

  let s = "hi";
  let className = "hi";
  document.querySelector("#ad-hoc-list-groups-link-copy").classList.remove("hide-button");
  document.querySelector("#ad-hoc-list-groups-ppt-copy").classList.remove("hide-button");

  // Groups Links
  let groupsLinkText = getAssignRoomList((boolCondense = true)).listText;

  // document.querySelector("#ad-hoc-list-groups-link").innerText = groupsLinkText;

  if (groupsLinkText.length < 500) {
    document.querySelector(
      "#ad-hoc-list-groups-link-length"
    ).innerHTML = `<span data-msg-popup-help-adhoc-numwords2a>This copy/paste is only </span>${groupsLinkText.length} <span data-msg-popup-help-adhoc-numwords2b>characters, which is under the 500 character limit.  The listing below is for your reference only</span>`;
  } else {
    // document.querySelector("#ad-hoc-list-groups-link-copy").innerHTML = "";
    document.querySelector("#ad-hoc-list-groups-link-copy").classList.add("hide-button");
    document.querySelector(
      "#ad-hoc-list-groups-link-length"
    ).innerHTML = `<p><span data-msg-popup-help-adhoc-numwords2c> This copy/paste has </span> ${groupsLinkText.length} <span data-msg-popup-help-adhoc-numwords2d>characters, which is OVER the 500 character limit.  Please copy/paste by highlighting the text below in sections and copy/paste into the Main chat.  Use your judgment as to how much to copy and paste at a time, perhaps 8 lines at a time. It is OK if you overlap and copy and paste the same lines again.  The purpose it so inform the students so they know what to click on.</span></p>`;
  }

  document.querySelector("#ad-hoc-list-groups-link").innerText = groupsLinkText;

  // Groups Ppt
  let groupsPptText = getAssignPptGroup(s, className, (boolCondense = true)).listText;

  if (groupsPptText.length < 500) {
    document.querySelector(
      "#ad-hoc-list-groups-ppt-length"
    ).innerHTML = `<p><span data-msg-popup-help-adhoc-numwords3a>This copy/paste is only </span>${groupsPptText.length}<span data-msg-popup-help-adhoc-numwords3b> characters, which is under the 500 character limit.  The listing below is for your reference only</span></p>`;
  } else {
    // document.querySelector("#ad-hoc-list-groups-ppt-copy").innerHTML = "";
    document.querySelector("#ad-hoc-list-groups-ppt-copy").classList.add("hide-button");
    document.querySelector(
      "#ad-hoc-list-groups-ppt-length"
    ).innerHTML = `<p><span data-msg-popup-help-adhoc-numwords3c>This copy/paste has </span>${groupsLinkText.length} <span data-msg-popup-help-adhoc-numwords3d>characters, which is OVER the 500 character limit. Please copy/paste by highlighting the text below in sections and copy/paste into the Main chat.  Use your judgment as to how much to copy and paste at a time, perhaps 8 lines at a time.   It is OK if you overlap and copy and paste the same lines again.  The purpose it so inform the students so they know what to click on.</span></p>`;
  }

  // document.querySelector(
  //   "#ad-hoc-list-groups-ppt-length"
  // ).innerText = `There is a 500 character length limit for copy/paste in the chatbox.  This text has ${groupsPptText.length} characters`;

  document.querySelector("#ad-hoc-list-groups-ppt").innerText = groupsPptText;

  intlMsg("popup-help-adhoc", "popupHelpAdhoc");
  intlMsg("popup-help-adhoc-step2", "popupHelpAdhocStep2");
  intlMsg("popup-help-adhoc-step2a", "popupHelpAdhocStep2a");
  intlMsg("popup-help-adhoc-step2b", "popupHelpAdhocStep2b");
  intlMsg("popup-help-adhoc-step2c", "popupHelpAdhocStep2c");
  intlMsg("popup-help-adhoc-numwords2a", "popupHelpAdhocNumwords2a");
  intlMsg("popup-help-adhoc-numwords2b", "popupHelpAdhocNumwords2b");
  intlMsg("popup-help-adhoc-numwords2c", "popupHelpAdhocNumwords2c");
  intlMsg("popup-help-adhoc-numwords2d", "popupHelpAdhocNumwords2d");
  intlMsg("popup-help-adhoc-numwords3a", "popupHelpAdhocNumwords3a");
  intlMsg("popup-help-adhoc-numwords3b", "popupHelpAdhocNumwords3b");
  intlMsg("popup-help-adhoc-numwords3c", "popupHelpAdhocNumwords3c");
  intlMsg("popup-help-adhoc-numwords3d", "popupHelpAdhocNumwords3d");

  intlMsg("popup-help-adhoc-step3", "popupHelpAdhocStep3");
  intlMsg("popup-help-adhoc-step3a", "popupHelpAdhocStep3a");
  intlMsg("popup-help-adhoc-step3b", "popupHelpAdhocStep3b");
  intlMsg("popup-help-adhoc-step3c", "popupHelpAdhocStep3c");
};

// When the user clicks on <span> (x), close the modal
spanAdHoc.onclick = function () {
  modalAdHoc.style.display = "none";
};

const getBoolStop = () => {
  return boolStop;
};
// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  switch (event.target) {
    case modal:
      modal.style.display = "none";
      break;
    case modalAdHoc:
      modalAdHoc.style.display = "none";
      break;
    case modalTimer:
      modalTimer.style.display = "none";
      break;
    case modalLowMemory:
      modalLowMemory.style.display = "none";
      break;

    default:
      switch (event.target.id) {
        case "timer-start":
          (async () => {
            document.querySelector("#status-timer").classList.add("running");
            document.querySelector("#status-timer").classList.remove("five");
            document.querySelector("#status-timer").classList.remove("one");
            document.querySelector("#status-timer").classList.remove("zero");
            modalTimer.style.display = "none";

            if (boolStop == false) {
              boolStop = true;
              await sleep(1000);
            }
            boolStop = false;

            let setHrs = document.querySelector("#set-hrs").value;
            let setMin = document.querySelector("#set-min").value;
            let setSec = document.querySelector("#set-sec").value;

            setHrs = Number.isInteger(parseInt(setHrs)) ? parseInt(setHrs) : 0;
            setMin = Number.isInteger(parseInt(setMin)) ? parseInt(setMin) : 0;
            setSec = Number.isInteger(parseInt(setSec)) ? parseInt(setSec) : 0;

            timerSec = parseInt(setHrs * 60 * 60 + setMin * 60 + setSec);

            // If invalid then exit
            if (timerSec < 0) {
              modalTimer.style.display = "none";
              return;

              // Valid input
            } else {
              const padZeros = (digits) => {
                digits = digits.toString();
                return digits.length < 2 ? "0" + digits : digits;
              };

              const countdown = setInterval(
                () => {
                  timerSec--;

                  // Finish
                  if (timerSec == 0) {
                    document.querySelector("#status-timer").classList.remove("running");
                    document.querySelector("#status-timer").classList.remove("five");
                    document.querySelector("#status-timer").classList.remove("one");
                    document.querySelector("#status-timer").classList.add("zero");
                    showHrs.innerText = padZeros(Math.floor(timerSec / 60 / 60));
                    showMin.innerText = padZeros(Math.floor(timerSec / 60));
                    showSec.innerText = padZeros(timerSec % 60);
                    statusTimer.innerText = `${showHrs.innerText}:${showMin.innerText}:${showSec.innerText}`;

                    let sound = document.querySelector("#mySoundZero");
                    sound.play();
                    clearInterval(countdown);

                    // User quit
                  } else if (getBoolStop() == true) {
                    timerSec = 0;
                    document.querySelector("#status-timer").classList.remove("running");
                    document.querySelector("#status-timer").classList.remove("five");
                    document.querySelector("#status-timer").classList.remove("one");
                    document.querySelector("#status-timer").classList.remove("zero");
                    showHrs.innerText = padZeros(Math.floor(timerSec / 60 / 60));
                    showMin.innerText = padZeros(Math.floor(timerSec / 60));
                    showSec.innerText = padZeros(timerSec % 60);
                    statusTimer.innerText = `${showHrs.innerText}:${showMin.innerText}:${showSec.innerText}`;
                    clearInterval(countdown);

                    // Normal process
                  } else {
                    showHrs.innerText = padZeros(Math.floor(timerSec / 60 / 60));
                    showMin.innerText = padZeros(Math.floor(timerSec / 60));
                    showSec.innerText = padZeros(timerSec % 60);
                    statusTimer.innerText = `${showHrs.innerText}:${showMin.innerText}:${showSec.innerText}`;

                    if (timerSec == 60) {
                      let sound = document.querySelector("#mySoundOne");
                      sound.play();
                    }

                    if (timerSec < 1) {
                      document.querySelector("#status-timer").classList.remove("running");
                      document.querySelector("#status-timer").classList.remove("five");
                      document.querySelector("#status-timer").classList.remove("one");
                      document.querySelector("#status-timer").classList.add("zero");
                    } else if (timerSec < 60) {
                      document.querySelector("#status-timer").classList.remove("running");
                      document.querySelector("#status-timer").classList.remove("five");
                      document.querySelector("#status-timer").classList.add("one");
                    } else if (timerSec < 300) {
                      document.querySelector("#status-timer").classList.remove("running");
                      document.querySelector("#status-timer").classList.add("five");
                    } else {
                    }
                  }
                },
                1000,
                timerSec
              );
              document.querySelector("#status-timer").classList.add("running");
            }
          })();

          break;
        case "timer-stop":
          boolStop = true;
          document.querySelector("#status-timer").classList.remove("running");
          document.querySelector("#status-timer").classList.remove("five");
          document.querySelector("#status-timer").classList.remove("one");
          document.querySelector("#status-timer").classList.remove("zero");
          modalTimer.style.display = "none";
          break;
        case "timer-reset":
          boolStop = true;
          document.querySelector("#set-hrs").value = "";
          document.querySelector("#set-min").value = "";
          document.querySelector("#set-sec").value = "";
          showHrs.innerText = "0";
          showMin.innerText = "00";
          showSec.innerText = "00";

          statusTimer.innerText = `${showHrs.innerText}:${showMin.innerText}:${showSec.innerText}`;
          document.querySelector("#status-timer").classList.remove("running");
          document.querySelector("#status-timer").classList.remove("five");
          document.querySelector("#status-timer").classList.remove("one");
          document.querySelector("#status-timer").classList.remove("zero");
          modalTimer.style.display = "none";
          break;

        default:
          break;
      }
      break;
  }

  intlMsg("set-timer", "setTimer");
  intlMsg("timer-hrs", "timerHrs");
  intlMsg("timer-min", "timerMin");
  intlMsg("timer-sec", "timerSec");
  intlMsg("timer-start", "timerStart");
  intlMsg("timer-stop", "timerStop");
  intlMsg("timer-reset", "timerReset");

  let onlineVideo = document.querySelector("#online-help-link");
  let onlineVideoTitle = chrome.i18n.getMessage("onlineVideoTitle");
  let onlineVideoHref = chrome.i18n.getMessage("onlineVideoHref");
  if (onlineVideoTitle && onlineVideoHref) {
    onlineVideo.innerText = onlineVideoTitle;
    onlineVideo.href = onlineVideoHref;
    onlineVideo.style.color = "red";
  }
};
