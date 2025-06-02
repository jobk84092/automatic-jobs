let saveMainWindowPosition;
let saveMainTab;

const handleToolTipCopyText = (event, listText) => {
  l_obj = {
    button: event.button,
    buttonId: event.buttonId,
  };

  // Toggle the bounce
  let sel = `#${event.currentTarget.id}`;
  // el = $(event.target);

  if (l_obj.button) {
    document.querySelector(`#${l_obj.buttonId}`).classList.toggle("bounce");
  } else {
    document.querySelector(sel).classList.toggle("bounce");
  }

  // Save title and get text to be copied
  let saveTitle = event.currentTarget.dataset.originalTitle;
  let tempTextArea = document.createElement("textarea");
  tempTextArea.value = listText;
  document.body.appendChild(tempTextArea);
  tempTextArea.select();

  // Update the new tooltip
  try {
    var successful = document.execCommand("copy");
    var msg = successful ? "Copied!" : "Error in copy";
    event.currentTarget.dataset.originalTitle = msg;
    if (!l_obj.button) {
      $(`#${event.currentTarget.id}`).tooltip("show");
    }
  } catch (err) {
    console.log("Error in copy");
  }

  //Cleanup
  document.body.removeChild(tempTextArea);
  event.currentTarget.dataset.originalTitle = saveTitle;

  // Remove class after time period
  setTimeout(
    () => {
      if (l_obj.button) {
        document.querySelector(`#${l_obj.buttonId}`).classList.toggle("bounce");
      } else {
        document.querySelector(sel).classList.toggle("bounce");
      }
    },
    500,
    l_obj
  );
};

const getAssignRoomList = (boolCondense = false) => {
  try {
    list2 = [...document.querySelectorAll("#list-rooms-hook > div")];
    numRooms = document.querySelector("#meet-room-number").innerText;
    numRooms = parseInt(numRooms);

    list = list2.map((el) => {
      let roomText = el.querySelector('input[data-type="name"]').value;
      let linkText;
      let linkType = el.querySelector('input[data-type="link"]').dataset.linkType;
      let link = el.querySelector('input[data-type="link"]').value;

      switch (linkType) {
        case "nick":
          linkText = "https://meet.google.com/lookup/" + link;
          // linkText = "https://g.co/meet/" + link;
          break;
        case "nickGC":
          linkText = link;
          break;
        case "code":
          linkText = "https://meet.google.com/" + link;
          break;
        case "url":
          linkText = link;
          break;

        default:
          break;
      }

      return { roomText, linkText };
    });

    list = list.filter((el, i) => {
      if (i == 0) {
        return false;
      }
      if (i <= numRooms) {
        return true;
      } else {
        return false;
      }
    });

    listText = "";
    listTextCsv = "Room, Url\n";

    list.forEach((el) => {
      if (boolCondense) {
        let roomText = el.roomText;
        let linkText = el.linkText;

        if (listText == "") {
          listText = `${roomText.trim()} ${linkText}\n`;
          listTextCsv = listTextCsv + `${roomText.trim()},=HYPERLINK("${linkText}")\n`;
        } else {
          listText = listText + `${roomText.trim()} ${linkText}\n`;
          // listText = listText + `\n${roomText.trim()} ${linkText}\n`;
          listTextCsv = listTextCsv + `${roomText.trim()},=HYPERLINK("${linkText}")\n`;
        }

        // Not condensed (normal case)
      } else {
        let roomText = el.roomText;
        let linkText = el.linkText;

        listText = listText + `${roomText.trim()} ${linkText}\n`;
        listTextCsv = listTextCsv + `${roomText.trim()},=HYPERLINK("${linkText}")\n`;
      }
    });

    return { listText, listTextCsv };
  } catch (err) {}
};

const getAssignRoomList_old = (boolCondense = false) => {
  list = document.querySelectorAll("[data-meet-room-row]");
  listText = "";
  listTextCsv = "Room, Url\n";

  list.forEach((el) => {
    if (boolCondense) {
      let roomText = el.querySelector("button").innerText;
      let linkText = el.querySelector("[data-meet-room-link]").dataset.meetRoomLink;

      if (listText == "") {
        listText = `${roomText.trim()} ${linkText}\n`;
        listTextCsv = listTextCsv + `${roomText.trim()},=HYPERLINK("${linkText}")\n`;
      } else {
        listText = listText + `${roomText.trim()} ${linkText}\n`;
        // listText = listText + `\n${roomText.trim()} ${linkText}\n`;
        listTextCsv = listTextCsv + `${roomText.trim()},=HYPERLINK("${linkText}")\n`;
      }

      // Not condensed (normal case)
    } else {
      let roomText = el.querySelector("button").innerText;
      let linkText = el.querySelector("[data-meet-room-link]").dataset.meetRoomLink;
      listText = listText + `${roomText.trim()} ${linkText}\n`;
      listTextCsv = listTextCsv + `${roomText.trim()},=HYPERLINK("${linkText}")\n`;
    }
  });

  return { listText, listTextCsv };
};

const getAssignPpt = (s, className) => {
  let listText = "";
  let listTextCsv = `${className} ${s.replace(/,/g, "")},\n`;
  // listTextCsv = 'Participant \n';

  let roster = [...document.querySelector("[data-main-ppts-hook]").querySelectorAll("[data-main-ppts-lines]>div>[data-ppt-id]")];

  listText = new Date().toLocaleString() + "\n";
  listText = listText + document.querySelector("[data-class-name-key]").innerText + "\n";

  for (let i = 0; i < roster.length; i++) {
    listText = listText + `${roster[i].innerText} \n`;
    listTextCsv = listTextCsv + `${roster[i].innerText},\n`;
  }

  return { listText, listTextCsv };
};

const getAssignPptGroup = (s, className, boolCondense = false) => {
  let arr = [...document.querySelectorAll("[data-assign-rooms-hook]>*")];
  let listText = "";
  let list = [];
  let listRoom = {};
  let newArr = [];

  listText = new Date().toLocaleString() + "\n";
  listText = listText + document.querySelector("[data-class-name-key]").innerText + "\n";

  let listTextCsv = `${className} ${s.replace(/,/g, "")} Breakout Groups,\n`;

  //   for (let i = 0; i < roster.length; i++) {
  //     listText = listText + `${roster[i].innerText} \n`;
  //     listTextCsv = listTextCsv + `${roster[i].innerText},\n`;
  //   }
  let pptName, groupName;

  let boolNewLine = true;

  if (boolCondense) {
    listText = "";
    listTextCsv = "";
  }

  arr.forEach((el) => {
    if (el.tagName == "DIV") {
      pptName = el.querySelector("H6").innerText;
      pptId = el.querySelector("H6").dataset.pptId;

      listRoom.ppt.push({ name: pptName, id: pptId });

      if (boolCondense) {
        if (boolNewLine) {
          listText = listText + `${pptName}`;
          listTextCsv = listTextCsv + `${pptName}`;
          boolNewLine = false;
        } else {
          listText = listText + `, ${pptName}`;
          listTextCsv = listTextCsv + `, ${pptName}`;
        }
      } else {
        listText = listText + `   ${pptName},\n`;
        listTextCsv = listTextCsv + `   ${pptName},\n`;

        list.push();
      }
    } else {
      boolNewLine = true;
      if (listRoom.roomName != undefined) {
        list.push({ ...listRoom });
      }
      listRoom.roomName = el.innerText;
      listRoom.ppt = [];
      newArr = [];

      if (boolCondense) {
        groupName = el.innerText;
        if (listText == "") {
          listText = `${groupName}: `;
          listTextCsv = `${groupName}: `;
        } else {
          listText = listText + `\n${groupName}: `;
          listTextCsv = listTextCsv + `\n${groupName}: `;
        }
      } else {
        groupName = el.innerText;
        listText = listText + `Group: ${groupName},\n`;
        listTextCsv = listTextCsv + `Group: ${groupName},\n`;
      }
    }
  });

  list.push(listRoom);

  return { listText, listTextCsv, list };
};

const handleToolTip = (event) => {
  if (!event.currentTarget || !event.currentTarget.id) {
    return;
  }

  let sel = `#${event.currentTarget.id}`;
  let list;
  let listText;
  let listTextCsv;
  let obj;
  let className = document.querySelector("#meet-room-class").innerText;
  let s = new Date().toLocaleString();
  // let pairs, link, hook;
  // let lookup = [];

  switch (sel) {
    case "#btn-ad-hoc-list-groups-link-copy":
      listText = getAssignRoomList((boolCondense = true)).listText;
      handleToolTipCopyText(event, listText);
      break;

    case "#btn-ad-hoc-list-groups-ppt-copy":
      listText = getAssignPptGroup(s, className, (boolCondense = true)).listText;
      handleToolTipCopyText(event, listText);
      break;

    case "#btn-copy-rooms":
      obj = getAssignRoomList();
      listText = obj.listText;
      listTextCsv = obj.listTextCsv;

      handleToolTipCopyText(event, listText);
      downloadToolTip({
        filename: event.filename,
        listText: listTextCsv,
        bool: event.bool,
      });
      break;

    case "#btn-copy-ppt":
      obj = getAssignPpt(s, className);
      listText = obj.listText;
      listTextCsv = obj.listTextCsv;

      handleToolTipCopyText(event, listText);
      downloadToolTip({
        filename: event.filename,
        listText: listTextCsv,
        bool: event.bool,
      });
      break;

    case "#btn-copy-assigned":
      list = document.querySelectorAll("[data-meet-room-row]");
      listText = "";
      listTextCsv = `Participant, Breakout Room, Url Link\n`;
      let lookup = [];
      let pairs = [];
      let link;

      list.forEach((el) => {
        let roomText = el.querySelector("button").innerText.trim();
        link = el.querySelector("[data-meet-room-link]").dataset.meetRoomLink;
        lookup.push({ roomName: roomText, link: link });
      });

      hook = [...document.querySelector("[data-main-ppts-hook]").children];
      hook.forEach((el) => {
        let name = el.children[0].innerText.trim();
        let roomName = el.children[1].innerText.trim();
        let myLink = lookup.filter((el) => el.roomName == roomName);
        link = myLink.length > 0 ? myLink[0].link : "";
        pairs.push({ name, roomName, link: link });
      });

      pairs.forEach((el) => {
        listText = listText + `${el.name} ${el.roomName} ${el.link} \n`;
        listTextCsv = listTextCsv + `${el.name}, ${el.roomName},=HYPERLINK("${el.link}")\n`;
      });

      handleToolTipCopyText(event, listText);
      downloadToolTip({
        filename: event.filename,
        listText: listTextCsv,
        bool: event.bool,
      });
      break;

    case "#btn-copy-breakout-groups":
      obj = getAssignPptGroup(s, className);
      listText = obj.listText;
      listTextCsv = obj.listTextCsv;

      handleToolTipCopyText(event, listText);
      downloadToolTip({
        filename: event.filename,
        listText: listTextCsv,
        bool: event.bool,
      });
      break;

    default:
      listText = "";
      handleToolTipCopyText(event, listText);
      break;
  }
};

const handleAutosendAssignments = async (evt) => {
  console.log("inside handleAutosendAssignments");

  // Select all h6 elements representing the rooms
  const rooms = document.querySelectorAll("[data-assign-room]");

  // Create an array to store the final results
  const result = [];

  rooms.forEach((room) => {
    // Get the room name from the h6 element
    // const roomName = room.getAttribute("data-assign-room");
    const roomName = room.textContent;

    // Find the corresponding room object from myBreakout.myRooms
    const roomObj = myBreakout.myRooms.find((r) => r.name === roomName);

    // Initialize a variable to move through siblings
    let nextElement = room.nextElementSibling;

    // While there are siblings and the sibling is not another h6 (next room)
    while (nextElement && nextElement.tagName !== "H6") {
      // If the current sibling is a participant div
      if (nextElement.hasAttribute("data-ppt-name")) {
        // Get participant name
        const participantName = nextElement.getAttribute("data-ppt-name");

        // Push the combined data to the result array
        result.push({
          roomName: roomName,
          participantName: participantName,
          link: roomObj.linkFetchedUrl,
        });
      }
      // Move to the next sibling
      nextElement = nextElement.nextElementSibling;
    }
  });

  // Log the final result
  console.log(result);

  let messages = [];
  let currentRoom = "";
  let message = "\n**************\n\n"; // Start with a blank line, leading line, and another blank line

  // Create a temporary object to store participants by room
  let roomParticipants = {};

  result.forEach((entry) => {
    // Initialize the room in the roomParticipants object if not already done
    if (!roomParticipants[entry.roomName]) {
      roomParticipants[entry.roomName] = {
        link: entry.link,
        participants: [],
      };
    }
    // Add the participant name to the array for the room
    roomParticipants[entry.roomName].participants.push(entry.participantName);
  });

  // Now that we have collected all participants, we sort them and build the message
  Object.keys(roomParticipants).forEach((roomName, index) => {
    if (currentRoom !== "") {
      message += "\n"; // Add a blank line before starting the new room block
    }
    currentRoom = roomName;

    // Add the room name and link
    message += `Room Name: ${currentRoom}\nRoom Link: ${roomParticipants[roomName].link}\n`;

    // Sort participants alphabetically and add them to the message
    // const sortedParticipants = roomParticipants[roomName].participants.sort();
    const sortedParticipants = roomParticipants[roomName].participants.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    sortedParticipants.forEach((participant) => {
      message += `${participant}\n`;
    });

    // If this is the last room, close the message with the final line and a blank line
    if (index === Object.keys(roomParticipants).length - 1) {
      message += "\n**************\n\n"; // Closing line and a blank line after
      messages.push(message.trim()); // Push the final message to the array
    }
  });

  // Log the messages array
  messages.forEach((msg) => console.log(msg + "\n"));

  // Define the target URL
  const targetUrl = myBreakout.myRooms[0].link;

  //
  let tabPopup = await chromeTabsGetCurrent();
  let tabs = await chromeTabsQuery({});

  const tabsMeet = tabs
    .filter((tab) => tab.url && tab.url.includes("meet.google.com")) // Check if tab.url exists before using .includes()
    .map((tab) => ({
      id: tab.id,
      url: tab.url,
      title: tab.title,
      status: tab.status,
      windowId: tab.windowId,
    }));

  let tabMain = tabsMeet.find((tab) => tab.title === "Main");

  await chromeWindowActive(tabMain.windowId);

  // update the saveMainWindowPosition
  saveMainWindowPosition = await chromeWindowProperties(tabMain.windowId);
  saveMainTab = tabMain;

  await chrome.windows.update(tabMain.windowId, {
    state: "maximized",
  });

  await chromeWindowActive(tabPopup.windowId);

  // Query all tabs in all windows
  chrome.tabs.query({}, function (tabs) {
    // Iterate through each tab
    tabs.forEach((tab) => {
      // Check if the tab's URL matches the target URL
      if (tab.url === targetUrl) {
        // Send a message to the content script in the matching tab
        chrome.tabs.sendMessage(tab.id, {
          action: "sendAssignments",
          messages: messages,
        });
      }
    });
  });
};

const handleCopyClipboardButtons = (evt) => {
  (async () => {
    let payload = { currentTarget: {} };
    payload.button = true;
    payload.buttonId = evt.currentTarget.id;

    try {
      payload.bool = evt.currentTarget.parentElement.querySelector("#copy-download-csv").checked;
    } catch (error) {
      payload.bool = false;
    }

    let dateNow = new Date();
    let year = dateNow.getFullYear();
    let month = ("00" + (parseInt(dateNow.getMonth()) + 1)).slice(-2);
    let date = ("00" + dateNow.getDate()).slice(-2);
    let className = document.querySelector("#meet-room-class").innerText;

    switch (evt.currentTarget.id) {
      case "copy-all-links":
        payload.currentTarget = document.querySelector("#btn-copy-rooms");
        payload.filename = `${className}_${year}.${month}.${date}_links`;
        handleToolTip(payload);
        break;
      case "copy-all-links2":
      case "btn-ad-hoc":
      case "btn-pre-assigned":
      case "open-breakouts2":
      case "btn-gc-sync":
      case "slider-bg-url-save":
      case "broadcast-bg-url-save":
      case "mute-all-main":
      case "mute-all-this":
      case "mute-all-breakouts":
      case "mute-all-all":
      case "remove-all":
      case "remove-all-main":
      case "remove-all-this":
      case "remove-all-breakouts":
      case "hangup-all-breakouts":
      case "hangup-main":
      case "close-room":
      case "popup-hide-bar":
      case "popup-retile":
        payload.currentTarget = document.querySelector("#btn-copy-rooms");
        payload.filename = `${className}_${year}.${month}.${date}_links`;
        handleToolTip(payload);
        break;

      // case "meet-goto-account":
      // case "rooms-goto-account":
      //   payload.currentTarget = evt.currentTarget;
      //   payload.currentTarget.id = evt.currentTarget.id;
      //   // payload.currentTarget = evt.currentTarget.id;
      //   handleToolTip(payload);
      //   break;
      case "btn-ad-hoc-list-groups-link-copy":
        payload.currentTarget = document.querySelector("#btn-ad-hoc-list-groups-link-copy");
        payload.target = payload.currentTarget;
        handleToolTip(payload);
        break;

      case "btn-ad-hoc-list-groups-ppt-copy":
        payload.currentTarget = document.querySelector("#btn-ad-hoc-list-groups-ppt-copy");
        payload.target = payload.currentTarget;
        handleToolTip(payload);
        break;

      case "copy-ppt-list":
        await buildMeetMainPptListing();
        payload.currentTarget = document.querySelector("#btn-copy-ppt");
        payload.target = payload.currentTarget;
        payload.filename = `${className}_${year}.${month}.${date}_attendance`;
        handleToolTip(payload);
        break;
      case "copy-ppt-assignments":
        // await buildMeetMainPptListing();
        payload.currentTarget = document.querySelector("#btn-copy-assigned");
        payload.target = payload.currentTarget;
        payload.filename = `${className}_${year}.${month}.${date}_breakout_assignments`;
        handleToolTip(payload);
        break;
      case "copy-breakout-groups":
        // await buildMeetMainPptListing();

        payload.currentTarget = document.querySelector("#btn-copy-breakout-groups");
        payload.target = payload.currentTarget;
        payload.filename = `${className}_${year}.${month}.${date}_breakout_groups`;
        handleToolTip(payload);
        break;

      default:
        break;
    }
  })();

  return true;
};

const downloadToolTip = (options) => {
  try {
    let filename = options.filename;
    let listText = options.listText;
    let bool = options.bool;

    if (!filename || !bool) {
      return;
    }

    filename = filename ? filename : "download";
    filename = filename.endsWith(".csv") ? filename : filename + ".csv";

    // let dataStr = "data:text/text;charset=utf-8,";
    let dataStr = "data:text/csv;charset=utf-8,";

    dataStr += listText;

    let link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", filename);
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
  } catch (err) {
    // alert(`Error in downloading the file ${JSON.stringify(err)}`);
  }
};

const handleAutosendOk = async () => {
  const sendMessageToTab = async (tabId) => {
    try {
      await chrome.tabs.sendMessage(tabId, { action: "clickChatButton" });
    } catch (error) {
      console.error("Error sending message to tab:", error);
    }
  };

  if (saveMainTab && saveMainWindowPosition) {
    sendMessageToTab(saveMainTab.id);

    if (document.querySelector("#breakout-tiles").checked) {
      document.querySelector("#popup-retile").click();
    } else {
      let { top, left, height, width, id } = saveMainWindowPosition;

      try {
        await chrome.windows.update(id, {
          top,
          left,
          height,
          width,
        });
      } catch (error) {
        console.log("Error updating window position:", error, saveMainWindowPosition);
      }
    }
    document.querySelector("#assign-ppts").click();
  }
};
