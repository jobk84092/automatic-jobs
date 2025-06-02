//

const buildRoomsClassDropdown = (meetClassName, classes) => {
  let hook = document.querySelector("#dropdown-rooms-class-hook");
  hook.innerHTML = "";
  document.querySelector("#setup-rooms-class").dataset.classNameKey = meetClassName;

  document.querySelector("#setup-rooms-class").innerText = meetClassName;

  classes.forEach((el) => {
    let flagActive = "";
    if (el.name == meetClassName) {
      flagActive = "active";
    }
    hook.innerHTML =
      hook.innerHTML +
      `<a class="dropdown-item ${flagActive}"  href="#" data-rooms-class-active="${flagActive}" data-class-name-key="${el.name}">${el.name}</a>`;
  });
};

const handleRoomsChooseClass = (evt) => {
  arr = [...evt.target.parentElement.childNodes];
  arr.forEach((el) => el.classList.remove("active"));
  evt.target.classList.add("active");

  nameKey = evt.target.dataset.classNameKey;
  name = evt.target.innerText;
  document.querySelector("#setup-rooms-class").dataset.classNameKey = nameKey;
  // document.querySelector("#setup-rooms-class").dataset.classNameKey = `${nameKey}`;

  document.querySelector("#setup-rooms-class").innerText = name;
  // document.querySelector("#setup-rooms-class").innerText = `${name}`;

  myBreakout.readRooms(nameKey);
  rooms = myBreakout.myRooms;

  buildRoomsRoomList(rooms);

  if (evt.isTrusted) {
    clickMeetClass(nameKey);
    clickClassesClass(nameKey);
  }
};

const buildRoomsRoomList = (rooms) => {
  let hook = document.querySelector("#list-rooms-hook");
  hook.innerHTML = "";
  // let rooms = await readRooms2(nameKey);

  // data-link-type = code, url, or nick

  switch (rooms.length) {
    case 0:
      let linkType = "url";
      let linkTypeStyleClass = getLinkTypeStyleClass(linkType);
      let linkFetchedUrl = "";
      let link = "";
      let name = chrome.i18n.getMessage("mainName") ? chrome.i18n.getMessage("mainName") : "Main";

      // let name = "Main";

      hook.innerHTML =
        hook.innerHTML +
        `     <div class="row ml-1 mr-1 mb-2" data-room-id='0'>
                  <div class="col-4 px-0 ">
                      <input type="text" class="form-control text-center ${linkTypeStyleClass}" data-type="name" value='${name}'> </div>
                  <div class="col-8 px-0">
                       <input type="text" class="form-control" data-type="link" data-link-type='${linkType}'  
                        data-link-fetched-url='${linkFetchedUrl}' value='${link}'>
                  </div>
                </div> `;
      break;

    default:
      rooms.forEach((el, i) => {
        let linkType = getLinkType(rooms[i].link);
        let linkTypeStyleClass = getLinkTypeStyleClass(rooms[i].linkType);
        let linkFetchedUrl = rooms[i].linkFetchedUrl;
        let link = rooms[i].link;
        let name = rooms[i].name;

        hook.innerHTML =
          hook.innerHTML +
          `     <div class="row ml-1 mr-1 mb-2" data-room-id='${i}'>
                  <div class="col-4 px-0 ">
                      <input type="text" class="form-control text-center ${linkTypeStyleClass}" data-type="name" value='${name}'> </div>
                  <div class="col-8 px-0">
                       <input type="text" class="form-control" data-type="link" data-link-type='${linkType}'  
                        data-link-fetched-url='${linkFetchedUrl}' value='${link}'>
                  </div>
                </div> `;
      });

      break;
  }
};

const btnRoomsAdd = () => {
  alertMessage(
    roomsNotYetSaved,
    // "Reminder: Changes not yet saved",
    "alert-warning",
    "#rooms-alert",
    (category = "rooms"),
    (waitTime = 1000000)
  );

  // get the current number of rows
  let listRooms = document.querySelectorAll("#list-rooms-hook>[data-room-id]");
  let num = listRooms.length;

  // let hook = document.querySelector("#list-rooms-hook");
  div = document.createElement("div");
  div.classList.add("row", "ml-1", "mr-1", "mb-2");
  div.dataset.roomId = "9";
  div.innerHTML = `<div class="col-4 px-0">
                      <input type="text" class="form-control room-url text-center" data-type="name" value=${num}>
                  </div>
                  <div class="col-8 px-0">
                    <input type="text" class="form-control" data-type="link" data-link-type="url" data-link-fetched-url>
                  </div>`;

  document.querySelector("#list-rooms-hook").appendChild(div);

  document.querySelector("#list-rooms-hook").appendChild(div);
};

const checkRoomsDupe = () => {
  let listNames = [];
  let listLinks = [];
  let listNicks = [];
  let dupeNames = [];
  let dupeLinks = [];

  let listRooms = [...document.querySelectorAll("#list-rooms-hook>[data-room-id]")];

  // Read the rooms from the input elements
  let rooms = listRooms.map((el) => {
    let name = "";
    let link = "";
    let nick = "";

    if (el.querySelector('input[type="text"]')) {
      name = el.querySelector('input[type="text"]').value.trim();
    }
    if (el.querySelector('input[data-type="link"]')) {
      link = el.querySelector('input[data-type="link"]').value.trim();
    }
    // if (el.querySelector('input[type="name"]')) {
    //   nick = el.querySelector('input[type="name"]').value.trim();
    // }

    el.dataset.link = link;
    el.dataset.roomName = name;

    listNames.push(name);
    listLinks.push(link);
    // listNicks.push(nick);

    return { name, link, nick };
  });

  // Look for dupes
  dupeNames = listNames.reduce(function (acc, el, i, arr) {
    if (arr.indexOf(el) !== i && acc.indexOf(el) < 0) acc.push(el);
    return acc;
  }, []);
  dupeLinks = listLinks.reduce(function (acc, el, i, arr) {
    if (arr.indexOf(el) !== i && acc.indexOf(el) < 0) acc.push(el);
    return acc;
  }, []);
  // dupeNicks = listNicks.reduce(function (acc, el, i, arr) {
  //   if (arr.indexOf(el) !== i && acc.indexOf(el) < 0) acc.push(el);
  //   return acc;
  // }, []);

  // Don't worry about dupe links of blanks.  That is the normal case
  dupeLinks = dupeLinks.filter((el) => el != "");

  dupeNames.forEach((el) => {
    for (let i = 0; i < listRooms.length; i++) {
      if (listRooms[i].dataset.roomName == el) {
        listRooms[i].querySelector('input[type="text"]').style.color = "red";
      }
    }
  });

  dupeLinks.forEach((el) => {
    for (let i = 0; i < listRooms.length; i++) {
      if (listRooms[i].dataset.link == el) {
        if (listRooms[i].querySelector('input[type="url"]')) {
          listRooms[i].querySelector('input[type="url"]').style.color = "red";
        }
        if (listRooms[i].querySelector('input[data-type="link"]')) {
          listRooms[i].querySelector('input[data-type="link"]').style.color = "red";
        }
        // listRooms[i].querySelector('input[type="url"]').style.color = "red";
      }
    }
  });

  // dupeNicks.forEach((el) => {
  //   for (let i = 0; i < listRooms.length; i++) {
  //     if (listRooms[i].dataset.link == el) {
  //       listRooms[i].querySelector('input[type="name"]').style.color = "red";
  //     }
  //   }
  // });

  if (dupeLinks.length > 0 || dupeNames.length > 0) {
    return false;
  }
  return true;
};

const handleRoomsEditInput = (evt) => {
  // Clip after the ?

  let boolOK = checkRoomsDupe();
  let linkType = "nick";

  if (evt.target && evt.target.tagName == "INPUT" && evt.target.dataset && evt.target.dataset.type == "link") {
    const pattern1 = "g.co/meet/";
    const pattern2 = "meet.google.com/"; //code
    const pattern3 = "meet.google.com/lookup/";
    const pattern4 = "https://meet.google.com/lookup/";
    const pattern5 = "https://g.co/meet/";
    const pattern6 = "http://g.co/meet/";
    const pattern7 = "http://meet.google.com/lookup/";
    const pattern8 = "http://meet.google.com/";
    const pattern8a = "https://meet.google.com/";

    evt.target.value = evt.target.value.trim();
    evt.target.value = getMeetUrlBase(evt.target.value);

    let room = evt.target.parentElement.parentElement.querySelector('input[data-type="name"]');

    let linkType = getLinkType(evt.target.value);

    if (evt.target.value) {
      if (evt.target.value.startsWith(pattern1)) {
        evt.target.value = evt.target.value.replace(pattern1, "");
      } else if (evt.target.value.startsWith(pattern2)) {
        evt.target.value = evt.target.value.replace(pattern2, "");
        linkType = "code";
      } else if (evt.target.value.startsWith(pattern3)) {
        evt.target.value = evt.target.value.replace(pattern3, "");
      } else if (evt.target.value.startsWith(pattern4)) {
        evt.target.value = evt.target.value.replace(pattern4, "");
      } else if (evt.target.value.startsWith(pattern5)) {
        evt.target.value = evt.target.value.replace(pattern5, "");
      } else if (evt.target.value.startsWith(pattern6)) {
        evt.target.value = evt.target.value.replace(pattern6, "");
      } else if (evt.target.value.startsWith(pattern7)) {
        evt.target.value = evt.target.value.replace(pattern7, "");
      } else if (evt.target.value.startsWith(pattern8)) {
        evt.target.value = evt.target.value.replace(pattern8, pattern8a);
      } else {
      }
    }

    switch (linkType) {
      case "nick":
        room.classList.remove("room-code");
        room.classList.remove("room-url");
        room.classList.add("room-nick");
        break;
      case "nickGC":
        room.classList.remove("room-code");
        room.classList.remove("room-url");
        room.classList.add("room-nickGC");
        break;
      case "code":
        room.classList.remove("room-nick");
        room.classList.remove("room-url");
        room.classList.add("room-code");
        break;
      case "url":
        room.classList.remove("room-code");
        room.classList.remove("room-nick");
        room.classList.add("room-url");
        break;

      default:
        break;
    }

    // let regexMask = /https:\/\/meet.google.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}/;
  }

  // Check for empty name
  let boolNoName = false;
  let listRooms = document.querySelectorAll("#list-rooms-hook>[data-room-id]");

  for (let i = 0; i < listRooms.length; i++) {
    let name = listRooms[i].querySelector('[data-type="name"]');
    let link = listRooms[i].querySelector('[data-type="link"]');
    if (name.value == "" && link.value != "") {
      boolNoName = true;
      boolOK = false;
    }
  }

  // Save processing
  if (boolOK) {
    alertMessage(
      roomsNotYetSaved,
      // "Reminder: Changes not yet saved",
      "alert-warning",
      "#rooms-alert",
      (category = "rooms"),
      (waitTime = 1000000)
    );
  } else if (boolNoName) {
    alertMessage(
      roomsNeedName,
      // "Cannot save: All rooms must have a name",
      "alert-warning",
      "#rooms-alert",
      (category = "rooms"),
      (waitTime = 1000000)
    );
  } else {
    alertMessage(
      roomsDupe,
      // "Cannot save: Duplicate Room Names and/or Duplicate Links",
      "alert-warning",
      "#rooms-alert",
      (category = "rooms"),
      (waitTime = 1000000)
    );
  }
};

const getLinkTypeStyleClass = (linkType) => {
  switch (linkType) {
    case "nick":
    case "nickGC":
      return "room-nick";
      break;

      break;
    case "code":
      return "room-code";
      break;
    case "url":
      return "room-url";
      break;

    default:
      return "room-url";
      break;
  }
};

const getLinkType = (link) => {
  let linkType = null;
  let regexMask;
  let regexSplit;

  if (link == "") {
    return "url";
  }

  // code
  if (!linkType) {
    regexMask = /[a-z]{3}-[a-z]{4}-[a-z]{3}/;
    regexSplit = regexMask.exec(link);

    if (regexSplit && link == regexSplit[0]) {
      return (linkType = "code");
    }
  }

  // lookup = nickname GC
  if (!linkType && link) {
    if (link.startsWith("https://meet.google.com/lookup/")) {
      return (linkType = "nickGC");
    }
  }

  // normal url
  if (!linkType && link) {
    if (link == "" || link.startsWith("https://") || link.startsWith("http://")) {
      return (linkType = "url");
    }
  }

  // nickname
  return (linkType = "nick");
};

const btnRoomsSave = async (boolMsg) => {
  let rooms = [];
  // New stuff
  // let regexMask = /https:\/\/meet.google.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}/;
  let boolOK = checkRoomsDupe();

  // Check for empty name
  let boolNoName = false;
  let listRooms = document.querySelectorAll("#list-rooms-hook>[data-room-id]");

  for (let i = 0; i < listRooms.length; i++) {
    let name = listRooms[i].querySelector('[data-type="name"]');
    let link = listRooms[i].querySelector('[data-type="link"]');
    if (name.value == "" && link.value != "") {
      boolNoName = true;
      boolOK = false;
    }
  }

  if (boolNoName) {
    alertMessage(
      roomsNeedName,
      // "Cannot save: All rooms need a name",
      "alert-warning",
      "#rooms-alert",
      (category = "rooms"),
      (waitTime = 1000000)
    );
    return;
  }

  if (!boolOK) {
    alertMessage(
      roomsDupe,
      // "Cannot save: Duplicate Room Names and/or Duplicate Links",
      "alert-warning",
      "#rooms-alert",
      (category = "rooms"),
      (waitTime = 1000000)
    );
    return;
  }

  // Give saving message
  alertMessage(
    roomsCreatingUrl,
    // "Creating automatic URL links and saving...",
    "alert-progress",
    "#rooms-alert",
    (category = "rooms"),
    (waitTime = 1000000)
  );

  // Get the Google Account

  // Get the class name
  let className = document.querySelector("#setup-rooms-class").dataset.classNameKey;

  let roomsHtml = [...document.querySelectorAll("#list-rooms-hook [data-room-id]")];

  for (let i = 0; i < roomsHtml.length; i++) {
    let name_html = roomsHtml[i].querySelector("input[data-type='name']");
    let link_html = roomsHtml[i].querySelector("input[data-type='link']");
    let linkFetchedUrl_html = roomsHtml[i].querySelector("input[data-link-fetched-url]");

    let name = "";
    let link = "";
    let linkType = "";
    let linkFetchedUrl = "";

    // Get the name
    if (name_html) {
      name = name_html.value.trim();
    }

    // Get the link
    if (link_html) {
      link = link_html.value.trim();
    }

    // Get the linkType
    linkType = getLinkType(link);

    // Get the linkFetchedUrl
    if (linkFetchedUrl_html) {
      switch (linkType) {
        case "url":
          linkFetchedUrl = link;
          break;

        case "code":
          linkFetchedUrl = "https://meet.google.com/" + link;
          break;

        default:
          linkFetchedUrl = linkFetchedUrl_html.dataset.linkFetchedUrl;
          break;
      }
    }

    rooms.push({
      name,
      link,
      linkType,
      linkFetchedUrl,
    });
  }

  // No blanks
  rooms = rooms.filter((el) => {
    if (el.name == "") {
      return false;
    }
    return true;
  });

  // Only create links for blanks at save, the others are at runtime
  for (let i = 0; i < rooms.length; i++) {
    if (rooms[i].link == "") {
      rooms[i].linkFetchValue = await autoCreateLink();
      rooms[i].link = rooms[i].linkFetchValue;
      console.log(`Created link ${rooms[i].link}`);
    }
  }

  // await chrome.storage.local.remove("classRooms");
  myBreakout.overwriteRooms(className, rooms);

  myBreakout.myRooms = rooms;

  await myBreakout.saveBreakout();

  numRooms = document.querySelector("#meet-room-number").innerText.trim();

  myBreakout.settings.meetNumRooms = numRooms;

  // Update dropdown rooms
  // buildMeetNumRoomsDropdown(numRooms, rooms);

  // Do I need this???
  refreshMeetClassRooms();

  updateDropdownsLists();
  // refreshControlPanel();

  if (boolMsg) {
    alertMessage(
      roomsSaved,
      // "Room Links Saved",
      "alert-success",
      "#rooms-alert",
      (waitTime = 1000)
    );
  }

  await chromeRuntimeSendMessage({ action: "tellContextToUpdateTabs" }); // Jan 1 2021
};

const getRuntimeLinkUrl = (link) => {
  return linkUrl;
};

const btnRoomsDelete = () => {
  hook = document.querySelector("#list-rooms-hook");
  children = hook.children;
  length = hook.children.length;
  last = hook.children[length - 1];

  if (length == 1) {
    return;
  }
  alertMessage(
    roomsNotYetSaved,
    // "Reminder: Changes not yet saved",
    "alert-warning",
    "#rooms-alert",
    (category = "rooms"),
    (waitTime = 1000000)
  );

  hook.removeChild(last);

  // After delete check to see if that cleared up the dupes
  let boolOK = checkRoomsDupe();

  if (boolOK) {
    alertMessage(
      roomsNotYetSaved,
      // "Reminder: Changes not yet saved",
      "alert-warning",
      "#rooms-alert",
      (category = "rooms"),
      (waitTime = 1000000)
    );
  }
};

const btnRoomsRecycle = () => {
  let listRooms = document.querySelectorAll("#list-rooms-hook>[data-room-id]");

  for (let i = 0; i < listRooms.length; i++) {
    let name = listRooms[i].querySelector('[data-type="name"]');
    let link = listRooms[i].querySelector('[data-type="link"]');
    link.value = "";
  }

  alertMessage(
    roomsNotYetSaved,
    // "Reminder: Changes not yet saved",
    "alert-warning",
    "#rooms-alert",
    (category = "rooms"),
    (waitTime = 1000000)
  );
};

const btnRoomsUndo = () => {
  let element = document.querySelector('[data-rooms-class-active="active"]');
  let className = element.dataset.classNameKey;
  // let nameKey = document.querySelector("#meet-room-class").dataset.classNameKey;
  myBreakout.readRooms(className);
  rooms = myBreakout.myRooms;

  buildRoomsRoomList(rooms);

  // refreshControlPanel();

  alertMessage(
    roomsUndo,
    // "Changes undone",
    "alert-info",
    "#rooms-alert",
    "rooms",
    (waitTime = 1000)
  );
};

const handleRooms = async (evt) => {
  try {
    switch (evt.currentTarget.id) {
      case "btn-rooms-add":
        btnRoomsAdd();
        break;
      case "btn-rooms-save":
        await btnRoomsSave((boolMsg = true));
        break;
      case "btn-rooms-delete":
        btnRoomsDelete();
        break;
      case "btn-rooms-undo":
        btnRoomsUndo();
        break;
      case "btn-rooms-recycle":
        btnRoomsRecycle();
        break;

      default:
        break;
    }
  } catch (err) {}
};

const refreshMeetClassRooms = () => {
  let nameKey = document.querySelector("#meet-room-class").dataset.classNameKey;

  // Populate rooms class dropdown
  myBreakout.readRooms(nameKey);

  let rooms = myBreakout.myRooms;

  if (rooms.length) {
    numRooms = rooms.length;
  } else {
    numRooms = 1;
  }

  numRooms = myBreakout.settings.meetNumRooms;

  let selectedCourse = nameKey;
  let pairings = myBreakout.settings.pairings;
  let numBreakouts = numRooms;

  if (pairings.length > 0) {
    pairings = pairings.filter((el) => el.course == selectedCourse);
    if (pairings.length > 0) {
      numBreakouts = pairings[0].num;
    }
  }

  // Do I need this???
  buildMeetNumRoomsDropdown(numBreakouts, rooms);
};

// const autoCreateLink2 = async (codeArr) => {
//   let throwError = `Error in automatically creating the link.  Please make sure you are logged in to your teaching google account.  If you still have a problem saving the link, consider using the manual method with the Calendar create/copy/paste`;

//   // responseArr= codeArr.PromiseAll(el=>)

//   try {
//     let response;

//     if (code) {
//       response = await myFetch(`https://g.co/meet/${code}`);
//       let doc = document.createElement("document");
//       doc.innerHTML = response;
//       let linkElement = doc.querySelector('link[rel="canonical"]');
//       if (linkElement) {
//         let myString = linkElement.href.split("_meet/");
//         if (myString.length >= 2) {
//           newLink = myString[0] + myString[1];
//           return newLink;
//         } else {
//           throw throwError;
//         }
//       } else {
//         throw throwError;
//       }
//     } else {
//       response = await myFetch("https://meet.google.com/new");
//       debugger;

//       let regexMask = /https:\/\/meet.google.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}/;
//       let regexSplit = regexMask.exec(response);
//       debugger;
//       if (regexSplit && regexSplit.length > 0) {
//         newLink = regexSplit[0];
//         return newLink;
//       } else {
//         throw throwError;
//       }
//     }
//   } catch (error) {
//     alert(error);
//   }
// };

const roomsCodeUrlBackgroundColor = () => {
  try {
    let list = document.querySelectorAll("#list-rooms-hook>div");

    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      let codeField = list[i].querySelector('[data-type="code"]');
      let urlField = list[i].querySelector('[data-type="link"]');

      if (codeField.value == "") {
        urlField.classList.remove("code-url");
      } else {
        urlField.classList.add("code-url");
      }
    }
  } catch (err) {}
};

const promiseAllSaveRooms = async () => {
  let rooms = await Promise.all(
    [...document.querySelectorAll("[data-room-name]")].map(async (el) => {
      let name = "";
      let code = "";
      let nick = "";
      let link = "";

      // Get the name
      if (el.querySelector("input[data-type='room-name']")) {
        name = el.querySelector("input[data-type='room-name']").value.trim();
      }
      // Get the code
      if (el.querySelector("input[data-type='code']")) {
        code = el.querySelector("input[data-type='code']").value.trim();
        code = code.replace(/\s/g, "");
        code = code.replace(/[^a-zA-Z0-9 ]/g, "");
      }

      // Get the link
      if (el.querySelector("input[data-type='link']")) {
        link = el.querySelector("input[data-type='link']").value.trim();
      }

      // If there is a code, then get the URL since it is determined at runtime
      if (code) {
        link = await autoCreateLink(code);

        // If there is no code but there is a link then
        // a) if it is a meet link then it must be in the right format otherwise create new link
        // b) otherwise, if it is a "valid" link then keep it otherwise create a new link
      } else if (link) {
        // If there is nothing, then create a URL
        if (link && link.startsWith("https://meet.google.com/")) {
          link = link.toLowerCase();

          //If begins with meet.google.com then must be in meet format
          let regexSplit = regexMask.exec(link);
          if (regexSplit == null) {
            link = await autoCreateLink();
          }
        } else if ((link && link.startsWith("https://")) || link.startsWith("http://")) {
          link = link;
        } else {
          link = await autoCreateLink();
        }

        // If there is no code and no link then create new link
      } else {
        link = await autoCreateLink();
      }

      if (name == "" || (code == "" && link == "")) {
        el.parentElement.removeChild(el);
      }

      return { name, code, link };
    })
  );
};
