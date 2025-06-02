const buildMeetMainPptListing = async (event) => {
  if (event) {
    event.preventDefault();
    console.log("Inside buildMeetMainPptListing Event object received:", event);
  } else {
    console.log("Inside buildMeetMainPptListing no event object passed");
  }

  let hook = document.querySelector("#meet-main-ppt-hook");
  let ppt;

  let mainUrl = document.querySelector("#list-rooms-hook input[data-link-fetched-url]").dataset.linkFetchedUrl;

  hook.innerHTML = "";

  let tabId = document.querySelector("#slider-title").dataset.tabId;

  // Define the values directly
  let boolOpen = false;
  let boolFilter = true;
  let boolGetReferrer = false;
  let boolExpand = true;

  if (document.querySelector("#assign-ppts").ariaExpanded == "true") {
    boolExpand = false;
  }

  let rooms = await chromeAllOpenRooms(boolOpen, tabId, boolFilter, boolGetReferrer, boolExpand);
  rooms = filterExtensionRooms(rooms);
  rooms = sortRoomsTabOrder(rooms);

  // Beg 09/13/2020 ppt is based on ppt in all rooms because sometimes students leave the main room
  let pptMe = [];

  pptAll = [];
  for (let i = 0; i < rooms.length; i++) {
    if (rooms[i].ppt && rooms[i].ppt.length > 0) {
      let arr = rooms[i].ppt.map((el) => {
        if (el.me == true) {
          pptMe.push(el.url);
        }

        return {
          name: el.name,
          id: el.url,
          url: el.url,
        };
      });
      pptAll.push(...arr);
    }
  }

  // Sort pptAll by name
  pptAll.sort((a, b) => {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });

  // Get rid of me
  pptAll = pptAll.filter((el) => {
    let bool = true;
    for (let i = 0; i < pptMe.length; i++) {
      if (el.url == pptMe[i]) {
        bool = false;
      }
    }
    return bool;
  });

  // Get just the uniques
  ppt = pptAll.filter((el, index, self) => index === self.findIndex((t) => t.name === el.name && t.id === el.id && t.url === el.url));
  // End 09/13/2020

  // Filter on the main url
  rooms = rooms && rooms.length > 0 ? rooms.filter((el) => getMeetUrlBase(el.url) == getMeetUrlBase(mainUrl)) : [];

  // ppt = rooms.length > 0 ? rooms[0].ppt : [];

  hook.innerHTML = `<button  id="btn-copy-ppt" type="button" 
  class="offset-2 col-1 pr-0 text-right btn btn-default btn-ppt" data-type="clip" 
  data-toggle="tooltip" data-placement="top" title="Copy Students to clipboard">
    <i class="fas fa-copy white"></i> </button>`;

  hook.innerHTML =
    hook.innerHTML +
    `<button  id="btn-copy-assigned" type="button" class="offset-8 col-1 pr-0 text-right btn btn-default 
    btn-assigned" data-type="clip" data-toggle="tooltip" 
    data-placement="top" title="Copy Breakout Assignments to clipboard">
    <i class="fas fa-copy white"></i> </button>`;

  hook.innerHTML =
    hook.innerHTML +
    `<div class="row" >
        <h5 class="pl-0 col-6 mt-2 sub-title"   data-msg-lbl-students>Students</h5>
        <h5 class="col-6 mt-2 pr-0 sub-title"   data-msg-lbl-breakout-assigns>Breakout Assignments</h5>
      </div>
      <div class="col-12 pl-0 pr-0 mb-4"   data-main-ppts-hook></div>`;

  let mainHook = hook.querySelector("[data-main-ppts-hook]");
  mainHook.innerHTML = "";

  if (ppt.length > 0 && rooms.length > 0) {
    for (let i = 0; i < ppt.length; i++) {
      mainHook.innerHTML =
        mainHook.innerHTML +
        `
        <div class="row mb-1" data-main-ppts-lines>
          <div class="col-6 pl-0" data-ppt-id="${ppt[i].id}" data-link="${rooms[0].url}">
            <button class="remove"><i class="fas fa-minus-circle"></i></button>
            <img src="${ppt[i].url}" style="width: 30px; border-radius: 50%">
            <h6 class="d-inline btn-sm col-8 mr-1 text-left" data-ppt-id="${ppt[i].id}">${ppt[i].name}</h6>
          </div>
          <div class="col-6" data-ppt-id="${ppt[i].id}" data-assigned-room></div>        
        </div>`;
    }
  }

  assignHook = document.createElement("div");
  assignHook.classList.add("row", "mt-3");
  assignHook.id = "meet-main-assign-hook";
  hook.appendChild(assignHook);

  // myPpt.ppt = ppt;
  await buildBreakoutListing(ppt);

  $("#btn-copy-ppt").tooltip();
  document.querySelector("#btn-copy-ppt").addEventListener("click", handleToolTip);
  $("#btn-copy-ppt").tooltip();
  document.querySelector("#btn-copy-ppt").addEventListener("click", handleToolTip);

  $("#btn-copy-assigned").tooltip();
  document.querySelector("#btn-copy-assigned").addEventListener("click", handleToolTip);

  // add in the international
  intlMsg("btn-random", "btnRandom");
  intlMsg("lbl-breakout-rooms", "lblBreakoutRooms");
  intlMsg("lbl-students", "lblStudents");
  intlMsg("lbl-breakout-assigns", "lblBreakoutAssigns");

  // scroll if this is an event
  if (event) {
    await sleep(1);
    document.getElementById("autosend-assignments-group").scrollIntoView({ behavior: "smooth" });
  }
};

const buildBreakoutListing = async (ppt) => {
  if (ppt.length < 1) {
    return;
  }

  let hook = document.querySelector("#meet-main-assign-hook");

  if (!hook) {
    return;
  }

  hook.innerHTML = `<button id="btn-copy-breakout-groups" type="button" class="offset-10 col-1 pr-0 text-right btn btn-default btn-groups" data-type="clip" data-toggle="tooltip" data-placement="top" title="" data-original-title="Copy Breakout Groups to clipboard">
    <i class="fas fa-copy" style="color: white"></i> </button>`;

  hook.innerHTML =
    hook.innerHTML +
    `<button class="col-4 mb-2 btn" id="assign-random" data-meet-assign=""data-msg-btn-random>
    Randomly Assign</button>

      <button class="col-1 mb-2 btn btn-warning" id="assign-reset"><i class="fas fa-recycle"></i></button>

      <h5 class="col-5 mt-1 sub-title" data-msg-lbl-breakout-rooms>Breakouts</h5>

      <div class="form-group col-12 d-none">
        <input type="checkbox" id="assign-exclude-self" checked>
        <label class="d-inline" for="assign-exclude-self">Exclude yourself</label>
      </div>  
  
      <div class="col-6 pl-0 pr-0 mb-4"  data-assign-ppts-hook></div>`;

  let leftHook = hook.querySelector("[data-assign-ppts-hook]");
  leftHook.innerHTML = "";

  if (ppt.length > 0) {
    for (let i = 0; i < ppt.length; i++) {
      leftHook.innerHTML =
        leftHook.innerHTML +
        ` <div class="mt-2" data-assign-ppt data-ppt-name="${ppt[i].name}" data-ppt-id="${ppt[i].id}" data-link="${ppt[i].url}" data-ppt-me="${ppt[i].me}" data-ppt-excl="false">
          <button class="remove"><i class="fas fa-minus-circle"></i></button>
          <img src="${ppt[i].url}" style="width: 30px; border-radius: 50%">
          <h6 class="d-inline btn-sm col-8 mr-1 text-left" data-ppt-id=${ppt[i].id} >${ppt[i].name}</h6>
        </div>`;
    }
  }

  hook.innerHTML = hook.innerHTML + `<div class="col-6 mb-4 pr-0"  data-assign-rooms-hook></div>`;

  let rightHook = hook.querySelector("[data-assign-rooms-hook");
  rightHook.innerHTML = "";
  let rooms = [...document.querySelector("#meet-rooms-hook").querySelectorAll("[data-goto][data-link]")];

  // filter out resources. Only want the meets
  // let test = rooms.map((el) => {
  //   let bool = !(
  //     el.dataset.link.startsWith("https://") &&
  //     !el.dataset.link.startsWith("https://meet.google.com/")
  //   );
  //   return {
  //     link: el.dataset.link,
  //     bool: bool,
  //     linkType: getLinkType(el.dataset.link),
  //   };
  // });

  rooms = rooms.filter((el) => !(el.dataset.link.startsWith("https://") && !el.dataset.link.startsWith("https://meet.google.com/")));

  for (let i = 0; i < rooms.length; i++) {
    rightHook.innerHTML = rightHook.innerHTML + `<h6 class="breakout-rooms mt-2 btn-sm text-left" style="height: 30px;"data-assign-room=${i + 1}>${rooms[i].innerText.trim()}</h6>`;
  }

  await sleep(1);

  // Participant list and Room list
  let pptList = document.querySelector("[data-assign-ppts-hook]");
  let roomList = document.querySelector("[data-assign-rooms-hook]");

  new Sortable(pptList, {
    group: "shared", // set both lists to same group
    animation: 150,
  });

  new Sortable(roomList, {
    group: "shared",
    animation: 150,
  });

  // Update previous listing
  await reloadSavedAssign();

  // Change the order **** Test this 2020.05.21
  breakout = document.querySelector("#meet-main-assign-hook");
  breakout.parentElement.insertBefore(breakout, breakout.parentElement.firstElementChild);
  // Change the order **** Test this 2020.05.21

  $("#btn-copy-breakout-groups").tooltip();
  document.querySelector("#btn-copy-breakout-groups").addEventListener("click", handleToolTip);

  document.querySelectorAll("button.remove").forEach((el) => {
    el.addEventListener("click", handleRemoveParticipant);
  });

  document.querySelectorAll("[data-ppt-excl]").forEach((el) => {
    el.removeEventListener("click", handleExcludePptClick);
  });
  document.querySelectorAll("[data-ppt-excl]").forEach((el) => {
    el.addEventListener("click", handleExcludePptClick);
  });

  document.querySelector("#assign-random").removeEventListener("click", handleAssignRandom2);
  document.querySelector("#assign-random").addEventListener("click", handleAssignRandom2);

  document.querySelector("#assign-reset").removeEventListener("click", handleAssignReset);
  document.querySelector("#assign-reset").addEventListener("click", handleAssignReset);

  document.querySelectorAll("[data-assign-ppt]").forEach((el) => {
    el.addEventListener("dragend", (evt) => updateAssignedListing());
  });
};

const reloadSavedAssign = async () => {
  try {
    let thisClass = document.querySelector("[data-class-name-key]").dataset.classNameKey;

    let { assign, boolExcSelf } = myBreakout.assign[thisClass];
    if (assign.length < 1) {
      return;
    }

    let rooms = [...document.querySelectorAll("[data-assign-room")];
    let ppt = [...document.querySelectorAll("[data-assign-ppt]")];

    ppt = boolExcSelf ? ppt.filter((el) => el.dataset.pptMe !== "true") : ppt;

    if (ppt.length < 1) {
      return;
    }

    ppt2 = [...ppt];
    rooms2 = [...rooms];

    for (let i = 0; i < ppt2.length; i++) {
      let myItem = assign.filter((el) => el.pptId == ppt2[i].dataset.pptId);
      // 2021/01/05 Get the first one
      // let pptId = myItem.length == 1 ? myItem[0].pptId : "";
      let pptId = myItem.length >= 1 ? myItem[0].pptId : "";
      // end 2021/01/05
      if (pptId == "") continue;
      let roomName = myItem[0].roomName.trim();

      for (let j = 0; j < rooms2.length; j++) {
        if (rooms2[j].innerText.trim() == roomName) {
          rooms[j].parentNode.insertBefore(ppt[i].cloneNode(true), rooms[j].nextSibling);
          ppt[i].parentElement.removeChild(ppt[i]);
        }
      }
    }

    //Update the assigned breakouts
    await updateAssignedListing();
  } catch (err) {}
};

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
};

const handleExcludePptClick = (event) => {
  let name = event.currentTarget.querySelector("h6");

  if (event.currentTarget.dataset.pptExcl == "true") {
    name.innerText = name.innerText.slice(9);
    name.style.color = rs.getPropertyValue(backgroundText);
    event.currentTarget.dataset.pptExcl = "false";
  } else {
    name.innerText = "Exclude: " + name.innerText;
    name.style.color = rs.getPropertyValue(alertText);
    event.currentTarget.dataset.pptExcl = "true";
  }
};

const handleAssignReset = () => {
  // Clear out both sides
  let hookPpts = document.querySelector("[data-assign-ppts-hook]");
  let hookRooms = document.querySelector("[data-assign-rooms-hook]");
  let ppt = [...document.querySelectorAll("[data-assign-ppt]")];

  hookPpts.innerHTML = "";
  // hookRooms.innerHTML = "";

  ppt.sort((a, b) => {
    const nameA = a.getAttribute("data-ppt-name").toUpperCase(); // Ignore case
    const nameB = b.getAttribute("data-ppt-name").toUpperCase(); // Ignore case

    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });

  if (ppt.length > 0) {
    for (let i = 0; i < ppt.length; i++) {
      hookPpts.appendChild(ppt[i]);
    }
  }

  // Append the rooms back (in case they were also shuffled)
  // originalPptOrder.forEach((el) => {
  //   hookPpts.appendChild(el);
  // });

  // Optionally, reset the rooms to their original order as well
  // let rooms = [...document.querySelectorAll("[data-assign-room]")];
  // rooms.forEach((el) => {
  //   hookRooms.appendChild(el);
  // });

  // Update the assigned breakouts
  // updateAssignedListing();
};

const handleAssignRandom2 = async (event) => {
  // get the checkbox and save self
  let boolExclSelf = document.querySelector("#assign-exclude-self").checked;
  let exclPpts = document.querySelectorAll('[data-assign-ppt][data-ppt-excl="true"]');

  // get the ppt and shuffle it
  let ppt = [...document.querySelectorAll("[data-assign-ppt]")];

  ppt = boolExclSelf ? ppt.filter((el) => el.dataset.pptExcl !== "true") : ppt;
  ppt = shuffleArray(ppt);

  // get the rooms (optionally also shuffle rooms, but not doing that here)
  let rooms = [...document.querySelectorAll("[data-assign-room")];

  // rooms = shuffleArray(rooms);
  if (rooms.length < 1) {
    return;
  }

  // clear out both sides
  let hookPpts = document.querySelector("[data-assign-ppts-hook]");
  let hookRooms = document.querySelector("[data-assign-rooms-hook]");
  hookPpts.innerHTML = "";
  hookRooms.innerHTML = "";

  // build the room nodes
  rooms.forEach((el) => {
    hookRooms.appendChild(el);
  });

  // get the room nodes (leaf nodes)
  let roomNodes = [...hookRooms.childNodes];

  // go through and assign ppt in rotation the rooms nodes until run out of ppt
  let roomsIndex = 0;
  for (let i = 0; i < ppt.length; i++) {
    let el = roomNodes[roomsIndex];
    el.parentNode.insertBefore(ppt[i], el.nextSibling);
    roomsIndex++;
    if (roomsIndex == rooms.length) {
      roomsIndex = 0;
    }
    // roomsIndex = roomsIndex == rooms.length - 1 ? 0 : roomsIndex++;
  }

  // Show the excluded participants
  exclPpts.forEach((el) => {
    let hook = document.querySelector("[data-assign-ppts-hook]");
    hook.appendChild(el);
  });

  //Update the assigned breakouts
  await updateAssignedListing();
};

const updateAssignedListing = async () => {
  await sleep(1);

  let assign = [];
  let roster = [...document.querySelector("#meet-main-ppt-hook").querySelectorAll("[data-ppt-id][data-assigned-room]")];

  // Clear out assigned
  roster.map((el) => (el.innerText = ""));

  // Go top down to assign the room
  rooms = [...document.querySelectorAll("[data-assign-rooms-hook]>*")]; // need both the h tags and the div groups

  rooms.forEach((el, i) => {
    if (i == 0) {
      roomName = "";
    }
    if (el.dataset.assignRoom) {
      roomName = el.innerText; // breakout room h tag
    } else {
      pptId = "";
      if (el.dataset.pptId) {
        // div group
        pptId = el.dataset.pptId;
      }
      pptName = "";
      if (el.dataset.pptName) {
        // div group
        pptName = el.dataset.pptName;
      }

      roster.forEach((el2) => {
        if (pptId == el2.dataset.pptId) {
          el2.innerText = roomName;
          assign.push({ pptId, pptName, roomName });
        }
      });
    }
  });

  // Save it down
  boolExcSelf = document.querySelector("#assign-exclude-self").checked;
  thisClass = document.querySelector("[data-class-name-key]").dataset.classNameKey;
  newAssign = { assign, boolExcSelf };

  if (myBreakout.assign == undefined) {
    myBreakout.assign = {};
    myBreakout.assign[thisClass] = newAssign;
  } else if (myBreakout.assign) {
    myBreakout.assign[thisClass] = newAssign;
  }

  await myBreakout.saveBreakout();
  let { breakout: test2 } = await chromeStorageLocalGet("breakout");
};

const buildMeetClassDropdown = (meetClassName, classes = []) => {
  hook = document.querySelector("#dropdown-meet-class-hook");
  hook.innerHTML = "";

  classes.forEach((el) => {
    let flagActive = "";
    if (el.name == meetClassName) {
      flagActive = "active";
    }
    hook.innerHTML = hook.innerHTML + `<a class="dropdown-item ${flagActive}"  href="#" data-class-name-key="${el.name}">${el.name}</a>`;
  });

  // Change this !!! from here on down....
  document.querySelector("#meet-room-class").dataset.classNameKey = `${meetClassName}`;
  document.querySelector("#meet-room-class").innerText = meetClassName;
};

const buildMeetNumRoomsDropdown = (numRooms = 0, rooms = []) => {
  if (numRooms > rooms.length) {
    numRooms = rooms.length;
  }

  hook = document.querySelector("#dropdown-meet-room-hook");
  hook.innerHTML = "";
  let activeTag = "";

  // First room is main
  let roomsBreakout = rooms.slice(1);

  if (numRooms > rooms.length) {
    numRooms = rooms.length;
  }

  roomsBreakout.forEach((el, i) => {
    n = i + 1;
    if (n == numRooms) {
      activeTag = "active";
      document.querySelector("#meet-room-number").innerText = numRooms;
      document.querySelector("#meet-room-number").dataset.meetRoomNumber = numRooms;
    } else {
      activeTag = "";
    }
    hook.innerHTML = hook.innerHTML + `<a class="dropdown-item ${activeTag}" href="#" data-room-id="${n}">${n}</a>`;
  });
};

const handleMeetChooseClass = async (evt) => {
  try {
    let numRooms, nameKey, name, hook, rooms, roomsBreakout;
    let arr = [...evt.target.parentElement.childNodes];

    arr.forEach((el) => el.classList.remove("active"));
    evt.target.classList.add("active");

    nameKey = evt.target.dataset.classNameKey;
    name = evt.target.innerText;

    document.querySelector("#meet-room-class").dataset.classNameKey = `${nameKey}`;
    document.querySelector("#meet-room-class").innerText = `${name}`;

    // Add read the rooms and populate them for the chosen class
    hook = document.querySelector("#dropdown-meet-room-hook");
    hook.innerHTML = "";

    myBreakout.readRooms(nameKey);
    rooms = myBreakout.myRooms;

    roomsBreakout = rooms.slice(1);

    roomsBreakout.forEach((el, i) => {
      n = i + 1;
      hook.innerHTML = hook.innerHTML + `<a class="dropdown-item" href="#" data-room-id="${n}">${n}</a>`;
    });

    if (rooms.length) {
      numRooms = rooms.length - 1;
    } else {
      numRooms = 1;
    }

    buildMeetRoomList(numRooms, rooms);
    myBreakout.settings.meetClassName = nameKey;

    await myBreakout.saveBreakout();

    //click on class for other tabs
    if (evt.isTrusted) {
      clickRoomsClass(nameKey);
      clickClassesClass(nameKey);
    }

    await updateMeetButtonOpenClass();

    // July 25, 2020
    let selectedCourse = document.querySelector('#meet2 [data-class-id="0"]').innerText;
    let pairings = myBreakout.settings.pairings;
    let numBreakouts = 0;

    if (pairings.length > 0) {
      pairings = pairings.filter((el) => el.course == selectedCourse);
      if (pairings.length > 0) {
        numBreakouts = pairings[0].num;
      }
    }

    buildMeetNumRoomsDropdown(numBreakouts, rooms);

    // Update tab button for Start Class
    updateChooseCourseLabel(nameKey, numRooms);

    await saveCourseNumPair();

    updateSpanCourseNum();
  } catch {}
};

const handleMeetChooseNumber = async (evt) => {
  try {
    arr = [...evt.target.parentElement.childNodes];
    arr.forEach((el) => {
      if (el.classList) {
        el.classList.remove("active");
      }
    });
    evt.target.classList.add("active");

    let classHook = document.querySelector("#dropdown-meet-class-hook");
    let nameKey = [...classHook.childNodes].filter((el) => el.classList.contains("active"))[0].dataset.classNameKey;

    // let rooms = await readRooms2(nameKey);
    myBreakout.readRooms(nameKey);
    rooms = myBreakout.myRooms;
    let numRooms = evt.target.innerText;

    if (rooms.length && evt.target.innerText > rooms.length) {
      evt.target.innerText = rooms.length;
    }

    buildMeetRoomList(numRooms, rooms);

    //Save down the user's last selection for the number of rooms
    myBreakout.settings.meetNumRooms = evt.target.innerText;

    await myBreakout.saveBreakout();

    await updateMeetButtonOpenClass();

    // *** Not sure: Every time number of rooms change
    let roomsAll = await chromeAllOpenRooms();
    ppt = roomsAll.length > 0 ? roomsAll[0].ppt : [];
    await buildBreakoutListing(ppt);
    // *** Not sure: Every time number of rooms change

    // Update tab button for Start Class
    updateChooseCourseLabel();

    await saveCourseNumPair();

    updateSpanCourseNum();
  } catch (err) {}
};

const buildMeetRoomList = (numRooms, rooms) => {
  document.querySelector("#meet-room-number").innerText = numRooms;
  document.querySelector("#meet-room-number").dataset.meetRoomNumber = numRooms;

  if (numRooms > rooms.length - 1) {
    numRooms = rooms.length - 1;

    numRooms = numRooms < 0 ? 0 : numRooms;
    document.querySelector("#meet-room-number").innerText = numRooms;
    document.querySelector("#meet-room-number").dataset.meetRoomNumber = numRooms;
  }

  // Build main room
  let hookMain = document.querySelector("#meet-main-hook");

  hookMain.innerHTML = `<button type="button" class="btn btn-default btn-clipboard2" data-type="clip" 
  data-toggle="tooltip" id="btn-copy-main"
  data-placement="top" title="Copy Main Room link to clipboard"><i class="fas fa-copy" style= "color: white"></i> </button>`;

  if (rooms[0]) {
    hookMain.innerHTML =
      hookMain.innerHTML +
      `<div class="mt-2 justify-content-between row ml-0" data-meet-main-row>

        <button class="btn col-4 main" type="button" data-goto data-meet-main-btn data-type="btn"
          data-toggle="collapse2" data-link="${rooms[0].link}" aria-expanded="false"
          aria-controls="collapseExample">${rooms[0].name}
        </button>

        <button class="rooms-section btn btn-sm btn-outline-dark col-1" data-meet-main-exp data-type="exp" 
        type="button" data-toggle="collapse" data-target=""
         aria-expanded="false" data-expand-all="true" aria-controls="collapseExample" data-link="${rooms[0].link}">
        <i class="fas fa-angle-double-down" data-type="exp" data-meet-main-exp-icon></i>
        <i class="fas fa-angle-double-up d-none" data-type="exp" data-meet-main-col-icon></i>
        </button>

        <div style="font-size: 14px;" class="col-7 pt-2" data-type="link" data-meet-main-link="${rooms[0].link}">
          ${rooms[0].link}
        </div>
      </div>`;
  }

  // Build rows of rooms based on number of rooms made available (chosen by user)
  let hook = document.querySelector("#meet-rooms-hook");

  hook.innerHTML = `<button type="button" class="btn btn-default btn-clipboard2" data-type="clip"
                    data-meet-rooom-clip data-toggle="tooltip" id="btn-copy-rooms"
                    data-placement="top" data-meet-main-clip title="Copy Breakout Rooms Links to clipboard"><i class="far fa-copy"></i>
                    </button>`;

  if (rooms.length == 0) {
    return null;
  }

  numRooms++;
  numRooms = numRooms < rooms.length ? numRooms : rooms.length;

  if (rooms.length > 1) {
    for (let i = 1; i < numRooms; i++) {
      let num = i;
      hook.innerHTML =
        hook.innerHTML +
        `<div class="mt-2 justify-content-between row" data-meet-room-row>
        <button class="btn col-4 breakout" type="button" data-goto data-type="btn" data-meet-room-btn
          data-toggle="collapse2" data-link="${rooms[i].link}" data-meet-room-index="${num}" aria-expanded="false"
          aria-controls="collapseExample">${rooms[i].name}
        </button>

        <button class="rooms-section btn btn-sm btn-outline-dark col-1" type="button" data-type="exp" data-meet-room-exp data-toggle="collapse" data-target=""
        data-btn-type="exp-main" aria-expanded="false" data-expand-all="true" aria-controls="collapseExample" data-link="${rooms[i].link}">
        <i class="fas fa-angle-double-down" data-type="exp" ></i>
        <i class="fas fa-angle-double-up d-none" data-type="exp"></i>        
        </button>

        <div style="font-size: 14px;" class="col-7 pt-2" data-type="link" data-meet-room-link="${rooms[i].link}">
          ${rooms[i].link}
        </div>

        <div class="col-12" id="meet-rooms-hook"></div>
      </div>`;
    }
  }

  // Highligh dupes
  let dupes = [...hook.querySelectorAll("[data-meet-room-link]")];

  dupes = dupes.map((el) => el.dataset.meetRoomLink);

  dupes.sort();

  dupes = dupes.filter((el, index, arr) => {
    return el == arr[index - 1];
  });

  dupes.forEach((el) => {
    let items = [...document.querySelectorAll(`[data-meet-room-link="${el}"]`)];
    items.forEach((el2) => {
      el2.style.color = "red";
      // el2.parentElement.removeChild(el2);
    });
  });

  $("#btn-copy-main").tooltip();
  document.querySelector("#btn-copy-main").addEventListener("click", handleToolTip);

  // Turn on the tool tip for the dynamically added element
  $("#btn-copy-rooms").tooltip();
  document.querySelector("#btn-copy-rooms").addEventListener("click", handleToolTip);
};

// Open All
const handleMeetOpenAllRooms = async (evt) => {
  let lowMemoryFlag = document.querySelector("#low-memory-option").checked;

  let l_id = evt.currentTarget.id;

  let className = document.querySelector("#meet-room-class").dataset.classNameKey;

  myBreakout.readClass(className);

  // let classes = myBreakout.myClass;
  let settings = myBreakout.settings;

  let rooms = myBreakout.myClass.rooms;

  let numRooms = parseInt(document.querySelector("[data-meet-room-number]").dataset.meetRoomNumber);

  if (rooms) {
    rooms = rooms.slice(0, numRooms + 1);
  } else {
    return;
  }

  if (rooms.length < 1) {
    return;
  }

  //Turn on spinners
  setSpinners(true);

  // Get the meet links for the nicknames
  if (lowMemoryFlag) {
    if (l_id != "open-main") {
      l_id = "open-both";
    }
  }

  let myBouncingball = setTimeout(async () => {
    try {
      // setSpinners(false);

      let errorBouncingBallsEnglish =
        "An existing open meet window cannot be synced.  Please close this control panel and all meet windows, and then start again.  Closing a meet window will not remove students or disrupt their discussions. If you have many windows open it may be simplest to just close all windows and start again.";

      let errorBouncingBalls = chrome.i18n.getMessage("errorBouncingBalls");

      errorBouncingBalls = errorBouncingBalls ? errorBouncingBalls : errorBouncingBallsEnglish;

      throw errorBouncingBalls;
    } catch (error) {
      alert(error);
    }
  }, 5000);

  let testError = await chromeAllOpenRooms();
  clearTimeout(myBouncingball);

  // Start

  // Handle based on main, breakouts, or all
  switch (l_id) {
    case "open-main":
      if (!lowMemoryFlag) {
        rooms = rooms.slice(0, 1);
      }
      rooms = await getNicknameLinks(rooms, className);

      if (lowMemoryFlag) {
        rooms = rooms.slice(0, 1);
      }
      rooms = await openCheckForDupes(rooms);
      rooms = await getRefreshLinks(rooms, className);

      // numRooms = 1;
      if (rooms.length < 1) {
        setSpinners(false);
        await sleep(1);

        if (!lowMemoryFlag) {
          await sleep(100);
          document.querySelector("#slider-right").click();
          await sleep(100);
          document.querySelector("#slider-left").click();
        }

        await sleep(100);
        let msgMainSync = chrome.i18n.getMessage("msgMainSync") ? chrome.i18n.getMessage("msgMainSync") : "Main room synced";
        return alert(msgMainSync);

        // document.querySelector("#slider-right").click();
      }
      break;

    case "open-breakouts":
    case "open-breakouts2":
      let openBreakoutsOnly = true;
      rooms = rooms.slice(1);
      rooms = await getNicknameLinks(rooms, className);
      rooms = await openCheckForDupes(rooms, lowMemoryFlag, openBreakoutsOnly);
      rooms = await getRefreshLinks(rooms, className);
      // numRoomsOrig = numRooms;
      // numRoomsNonDupe = rooms.length;
      // numRooms = numRooms - (numRoomsOrig - numRoomsNonDupe);
      if (rooms.length < 1) {
        setSpinners(false);
        await sleep(1);
        // return alert(`${numRooms} Breakout rooms already all open`);
        await sleep(100);
        document.querySelector("#slider-right").click();
        await sleep(100);
        document.querySelector("#slider-left").click();
        await sleep(100);
        let msgBreakoutSync = chrome.i18n.getMessage("msgBreakoutSync") ? chrome.i18n.getMessage("msgBreakoutSync") : "Breakout room synced";
        return alert(msgBreakoutSync);
      }
      break;

    case "open-both":
      rooms = await getNicknameLinks(rooms, className);
      // console.log("nicknames ok");
      rooms = await openCheckForDupes(rooms, lowMemoryFlag);
      // console.log("dupes ok");
      rooms = await getRefreshLinks(rooms, className);
      // console.log("refresh ok");

      // numRoomsOrig = numRooms;
      if (rooms.length < 1) {
        setSpinners(false);
        await sleep(1);

        await sleep(100);
        document.querySelector("#slider-right").click();
        await sleep(100);
        document.querySelector("#slider-left").click();
        await sleep(100);
        let msgAllSync = chrome.i18n.getMessage("msgAllSync") ? chrome.i18n.getMessage("msgAllSync") : "All rooms synced";
        return alert(msgAllSync);
        // return alert();
        // `Main room and ${numRooms} Breakout rooms already all open`
      }
      break;

    default:
      break;
  }

  // Turn off spinners
  setSpinners(false);

  // Open based on user option
  let availLeft = window.screen.availLeft;
  let availWidth = window.screen.availWidth;
  let availHeight = window.screen.availHeight;

  if (settings.tile) {
    await chromeRuntimeSendMessage({
      action: "openWinMulti",
      rooms: rooms,
      numRooms: rooms.length,
      className: className,
      availLeft: availLeft,
      availWidth: availWidth,
      availHeight: availHeight,
      lowMemoryFlag: false,
    });

    // Tabs
  } else {
    await chromeRuntimeSendMessage({
      action: "openTabMulti",
      rooms: rooms,
      numRooms: rooms.length,
      className: className,
      availLeft: availLeft,
      availWidth: availWidth,
      availHeight: availHeight,
      lowMemoryFlag: false,
    });

    // focus on main
    let openRooms2 = await chromeAllOpenRooms();
    try {
      if (openRooms2.length > 0) {
        let tab = await focusTabById(openRooms2[0].id);
        console.log("Tab focused:", tab);
      }
    } catch (error) {
      console.log("Failed to focus tab:", error);
    }
  }
};

// finished

const handleMeetRoomsHook = (evt) => {
  switch (evt.currentTarget.dataset.type) {
    case "btn":
      handleMeetOpenOneRoom(evt);
      break;
    case "clip":
      break;
    case "exp":
      handleExpandBreakout(evt);

      break;

    default:
      break;
  }
};

const handleExpandBreakout = async (evt) => {
  let l_target = evt.target;
  if (evt.target.tagName == "I") {
    l_target = l_target.parentElement;
  }

  let hook;
  // let roomName = l_target.parentElement.querySelector("[data-goto]").innerText;
  let link = l_target.parentElement.querySelector('[data-type="link"]').innerText;
  let exp = l_target.parentElement.querySelector('[data-type="exp"]');
  let iconDown = exp.querySelector(".fa-angle-double-down");
  let iconUp = exp.querySelector(".fa-angle-double-up");
  let parent = l_target.parentElement;
  // get rid of any previous

  // l_target.parentElement.removeChild('[data-rooms-ppt-hook]');
  if (l_target.parentElement.querySelector("[data-rooms-ppt-hook]")) {
    hook = l_target.parentElement.querySelector("[data-rooms-ppt-hook]");
    hook.innerHTML = "";
  } else {
    // hook = l_target.parentElement.querySelector('[data-rooms-ppt-hook]')
    hook = document.createElement("div");
    hook.dataset.roomsPptHook = "true";
    hook.classList.add("collapse", "col-12", "row");
    // parent.appendChild(hook);
  }

  hook.innerHTML = "";

  if (hook.classList.contains("collapse")) {
    hook.classList.remove("collapse");
    hook.classList.add("expand");
    iconUp.classList.remove("d-none");
    iconDown.classList.add("d-none");

    let rooms = await chromeAllOpenRooms();

    rooms = rooms.filter((el) => el.url == link);
    ppt = rooms.length > 0 ? rooms[0].ppt : [];

    hook.innerHTML = `<h4 class="pl-0 col-6 mt-2" style="font-weight: bold">Participants</h4>
                `;
    // <div class="col-12 pl-0 pr-0 mb-4" style="background-color: white;" data-room-ppts-hook></div>

    child = document.createElement("div");
    child.classList.add("col-12");
    // let mainHook = hook.querySelector('[data-main-ppts-hook]');
    // mainHook.innerHTML = '';
    for (let i = 0; i < ppt.length; i++) {
      hook.innerHTML =
        hook.innerHTML +
        `
        <div class="col-12 pl-0 mb-1" data-rooms-ppts-lines>
          <div class="col-6 pl-0" data-ppt-id="${ppt[i].id}" data-link="${evt.target.dataset.link}">
            <button class="remove"><i class="fas fa-minus-circle"></i></button>
            <img src="${ppt[i].url}" style="width: 30px; border-radius: 50%">
            <h6 class="d-inline btn-sm col-8 mr-1 text-left" data-ppt-id="${ppt[i].id}">${ppt[i].name}</h6>
          </div>
          <div class="col-6" data-ppt-id="${ppt[i].id}" data-assigned-room></div>        
        </div>`;
    }

    // hook.appendChild(child)
    // assignHook = document.createElement('div');
    // assignHook.classList.add('row', 'mt-3');
    // assignHook.id = "meet-main-assign-hook";
    // hook.appendChild(assignHook);

    // myPpt.ppt = ppt;
    parent.appendChild(hook);
    // await buildBreakoutListing(ppt);
  } else {
    hook.classList.remove("expand");
    hook.classList.add("collapse");
    iconUp.classList.add("d-none");
    iconDown.classList.remove("d-none");
    // document.querySelector('[data-meet-main-col-icon]').classList.add('d-none')
    // document.querySelector('[data-meet-main-exp-icon]').classList.remove('d-none')
  }
};

// Open All
const handleMeetOpenOneRoom = async (evt) => {
  // Make sure this is not the tool tip
  if (!evt.target.dataset.link) {
    return true;
  }

  let nameKey = document.querySelector("#meet-room-class").dataset.classNameKey;
  myBreakout.readClass(nameKey);
  let settings = myBreakout.settings;

  let rooms = [{ link: evt.target.dataset.link, name: evt.target.innerText }];
  let numRooms = 1;

  // check for dupes
  rooms = await openCheckForDupes(rooms);
  numRooms = rooms.length;

  // Allow for single click on button to go to that room
  if (numRooms < 1) {
    // Find my room from the list
    let openRooms = await chromeAllOpenRooms();

    let myRoom = openRooms.filter((el) => el.url == evt.target.dataset.link)[0];

    windowId = myRoom.windowId;
    id = myRoom.id;

    // Make tab active
    boolActive = true;
    // chrome.tabs.update(id, { active: boolActive });

    // Make window focused
    // boolFocused = true;
    // boolAttention = false;

    boolFocused = false;
    boolAttention = true;

    // chrome.windows.update(windowId, {
    //   focused: boolFocused,
    //   drawAttention: boolAttention,
    // });

    return;
  }

  if (settings.tile) {
    chrome.runtime.sendMessage(
      {
        action: "openWinMulti",
        rooms: rooms,
        numRooms: numRooms,
        className: nameKey,
      },
      (obj) => {
        updateMeetButtonOpenClass();
      }
    );

    // Tabs
  } else {
    chrome.runtime.sendMessage(
      {
        action: "openTabMulti",
        rooms: rooms,
        numRooms: numRooms,
        className: nameKey,
      },
      (obj) => {
        updateMeetButtonOpenClass();
      }
    );
  }
};

const openCheckForDupes = async (rooms, lowMemoryFlag = false, openBreakoutsOnly = false) => {
  // if (rooms.length < 2) {
  //   return rooms;
  // }

  let dupes = [];
  let msg = "";

  let tabs = await chromeTabsQuery({});

  // Add in the url for the resources
  let gt_tabs = await chromeRuntimeSendMessage({
    action: "getTableOfTabs",
  });

  for (let i = 0; i < tabs.length; i++) {
    if (tabs[i].url == undefined) {
      for (let j = 0; j < gt_tabs.length; j++) {
        if (gt_tabs[j].tabId == tabs[i].id) {
          tabs[i].url = gt_tabs[j].url;
        }
      }
    }

    // Make sure you are dealing with the base, stripping out the ?authuser=0 etc
    tabs[i].url = getMeetUrlBase(tabs[i].url);
  }

  // look for dupes
  let rooms2 = rooms.filter((el) => {
    let flag = true;

    for (let i = 0; i < tabs.length; i++) {
      const el2 = tabs[i];
      if (el2.url === el.linkFetchedUrl) {
        dupes.push({ name: el.name, linkFetchedUrl: el.linkFetchedUrl });

        // Update the linkFetchedUrl on the html in the rooms list
        let roomHtml = document.querySelector(`#list-rooms-hook input[value="${el.name}"]`);

        if (roomHtml) {
          let linkHtml = roomHtml.parentElement.parentElement.querySelector('[data-type="link"]');

          if (linkHtml) {
            linkHtml.dataset.dataFetchedUrl = el.dataFetchedUrl;
          }
        }

        flag = false;
      }
    }

    return flag;
  });

  // Check for dupes if low memory option
  if (lowMemoryFlag) {
    let flag_main = false;
    let flag_br = false;

    for (let i = 0; i < tabs.length; i++) {
      if (tabs[i].url == rooms[0].linkFetchedUrl) {
        flag_main = true;
        continue;
      }

      if (rooms.length > 1) {
        for (let j = 1; j < rooms.length; j++) {
          if (tabs[i].url == rooms[j].linkFetchedUrl) {
            flag_br = true;
          }
        }
      }
    }

    if (openBreakoutsOnly) {
      flag_br = flag_main;
      flag_main = true;
    }

    if (flag_main == true && flag_br == true) {
      rooms2 = [];
      return rooms2;
    }
    if (flag_main == true && flag_br == false) {
      rooms2 = rooms2.slice(0, 1);
      return rooms2;
    }
    if (flag_main == false && flag_br == true) {
      rooms2 = rooms2.slice(0, 1);
      return rooms2;
    }
    if (flag_main == false && flag_br == false) {
      return rooms2;
    }
  }

  // Normal processing
  if (dupes.length > 0) {
    if (dupes.length == 1) {
      msg = "One room is already open: \n\n";
    } else {
      msg = `${dupes.length} rooms are already open: \n\n`;
    }

    dupes.forEach((el, i) => {
      msg = msg + `${i + 1}) ${el.name} \n`;
    });
    // alert(msg);
  }

  return rooms2;
};

const openCheckForDupes_old = async (rooms) => {
  // if (rooms.length < 2) {
  //   return rooms;
  // }

  let dupes = [];
  let msg = "";
  let test = [...rooms];

  let tabs = await chromeTabsQuery({});

  // Add in the url for the resources
  let gt_tabs = await chromeRuntimeSendMessage({
    action: "getTableOfTabs",
  });

  for (let i = 0; i < tabs.length; i++) {
    if (tabs[i].url == undefined) {
      for (let j = 0; j < gt_tabs.length; j++) {
        if (gt_tabs[j].tabId == tabs[i].id) {
          tabs[i].url = gt_tabs[j].url;
        }
      }
    }
  }

  // look for dupes
  let rooms2 = test.filter((el) => {
    let flag = true;

    for (let i = 0; i < tabs.length; i++) {
      const el2 = tabs[i];
      if (el2.url === el.link) {
        dupes.push({ name: el.name, link: el.link });
        flag = false;
      }
    }

    return flag;
  });

  if (dupes.length > 0) {
    if (dupes.length == 1) {
      msg = "One room is already open: \n\n";
    } else {
      msg = `${dupes.length} rooms are already open: \n\n`;
    }

    dupes.forEach((el, i) => {
      msg = msg + `${i + 1}) ${el.name} \n`;
    });
    // alert(msg);
  }

  return rooms2;
};

const updateMeetButtonOpenClass = () => {
  (async () => {
    let tabs = await chromeTabsQuery({});
    let main = document.querySelector("[data-meet-main-btn]");

    if (main) {
      main.classList.remove("room-open");
      tabs.forEach((el) => {
        if (el.url == main.dataset.link) {
          main.classList.add("room-open");
        }
      });
    }

    let rooms = document.querySelectorAll("[data-meet-room-btn]");

    rooms.forEach((el) => {
      el.classList.remove("room-open");
      tabs.forEach((el2) => {
        if (el2.url == el.dataset.link) {
          el.classList.add("room-open");
        }
      });
    });

    await sleep(1000);
    await buildSlider();

    document.querySelector("#slider").focus();
  })();

  return true;
};

const handleRemoveParticipant = (evt) => {
  try {
    (async () => {
      alert(` ${JSON.stringify(evt)} remove evt target ${evt.target.tag}, current target ${evt.currentTarget.tag}`);
      // get pptId
      let parent = evt.currentTarget.parentElement;
      let roomLink;
      let pptId;

      if (parent.dataset.pptId) {
        pptId = parent.dataset.pptId;
      } else {
        return alert("problem with remove");
      }

      if (parent.dataset.link) {
        roomLink = parent.dataset.link;
      }

      // alert(`link is ${roomLink}`)
      let roomsAll = await chromeAllOpenRooms();

      let myRoom = roomsAll.filter((el) => el.url == roomLink);

      alert(`tabId = ${myRoom[0].id}`);
      tabId = myRoom[0].id;

      payload = {
        action: "remove",
        pptId: pptId,
      };

      let msg = await chromeTabsSendMessage(tabId, payload);
    })();

    return true;
  } catch (error) {}
};
