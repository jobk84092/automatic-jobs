const buildClassesClassList = (classes = []) => {
  let hook = document.querySelector("#list-classes-hook");
  hook.innerHTML = "";

  let msgText = chrome.i18n.getMessage("myCourse");
  let myCourse = msgText ? msgText : "My Course";

  switch (classes.length) {
    case 0:
      hook.innerHTML =
        hook.innerHTML +
        `     <div class="row ml-1 mr-0" data-class-name-key2='${myCourse}'>
                  <div class="col-5 px-0">
                      <input data-class-name type="text" class="form-control" >
                  </div>
                  <div class="col-7 px-0">
                    <input data-class-desc type="text" class="form-control" required>
                  </div>
                </div> `;
      break;

    default:
      classes.forEach((el, i) => {
        hook.innerHTML =
          hook.innerHTML +
          `     <div class="row ml-1 mr-1" data-class-name-key2='${el.name}'>
                  <div class="col-5 px-0">
                      <input data-class-name type="text" class="form-control" >
                  </div>
                  <div class="col-7 px-0">
                    <input data-class-desc type="text" class="form-control" required>
                  </div>
                </div> `;
      });

      break;
  }

  // Populate Value fields
  listInputName = hook.querySelectorAll("input[data-class-name]");
  listInputDesc = hook.querySelectorAll("input[data-class-desc]");

  classes.forEach((el, i) => {
    listInputName[i].value = el.name;
    listInputDesc[i].value = el.desc;
  });
};

// New Stuff here...

const handleClasses = async (evt) => {
  switch (evt.currentTarget.id) {
    case "btn-classes-add":
      btnClassesAdd();
      break;
    case "btn-classes-save":
      await btnClassesSave((boolMsg = true));
      break;
    case "btn-classes-delete":
      await btnClassesDelete();
      break;
    case "btn-classes-undo":
      await btnClassesUndo();
      break;

    default:
      break;
  }
};

// Add classes
const btnClassesAdd = () => {
  alertMessage(
    roomsNotYetSaved,
    // "Reminder: Changes not yet saved",
    "alert-warning",
    "#classes-alert",
    (category = "classes"),
    (waitTime = 1000000)
  );

  let hook = document.querySelector("#list-classes-hook");
  let i = [...hook.querySelectorAll("*>div>input")].length;
  lastChild = hook.lastElementChild.cloneNode(true);
  lastChild.dataset.classNameKey2 = "";

  [...lastChild.querySelectorAll("input")].map((el) => (el.value = ""));
  document.querySelector("#list-classes-hook").appendChild(lastChild);
};

// Delete classes
const btnClassesDelete = async () => {
  hook = document.querySelector("#list-classes-hook");
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
    "#classes-alert",
    (category = "classes"),
    (waitTime = 1000000)
  );

  hook.removeChild(last);
};

// Undo classes
const btnClassesUndo = async () => {
  classes = myBreakout.classes;

  buildClassesClassList(classes);

  alertMessage(
    roomsUndo,
    // "Changes undone",
    "alert-info",
    "#classes-alert",
    "classes",
    (waitTime = 1000)
  );
};

// Check for classes dupe
const checkClassesDupe = () => {
  let listNames = [];
  let dupeNames = [];

  let listClasses = [...document.querySelectorAll("input[data-class-name]")];

  listClasses.forEach((el) => {
    el.style.color = "";
    listNames.push(el.value.trim());
  });

  // Look for dupes
  dupeNames = listNames.reduce(function (acc, el, i, arr) {
    if (arr.indexOf(el) !== i && acc.indexOf(el) < 0) acc.push(el);
    return acc;
  }, []);

  dupeNames.forEach((el) => {
    for (let i = 0; i < listClasses.length; i++) {
      if (listClasses[i].value.trim() == el) {
        listClasses[i].style.color = "red";
      }
    }
  });

  if (dupeNames.length > 0) {
    return false;
  }
  return true;
};

// Handle input
const handleClassesEditInput = (evt) => {
  let boolOK = checkClassesDupe();

  if (boolOK) {
    alertMessage(
      coursesNotYetSaved,
      // "Reminder: Changes not yet saved",
      "alert-warning",
      "#classes-alert",
      (category = "classes"),
      (waitTime = 1000000)
    );
  } else {
    alertMessage(
      coursesDupe,
      // "Cannot save: Duplicate Meeting Names",
      "alert-warning",
      "#classes-alert",
      (category = "classes"),
      (waitTime = 1000000)
    );
  }
};

// Save Classes
const btnClassesSave = async (boolMsg) => {
  // Check for dupes
  let boolOK = checkClassesDupe();

  if (!boolOK) {
    alertMessage(
      coursesDupe,
      // "Cannot save: Duplicate Class Names",
      "alert-warning",
      "#classes-alert",
      (category = "classes"),
      (waitTime = 1000000)
    );
    return;
  }

  // Read the rooms from the input elements
  let updateClasses = [];
  let list = [];

  [...document.querySelectorAll("[data-class-name-key2]")].forEach((el) => {
    let classNameOld = el.dataset.classNameKey2;
    myBreakout.readClass(classNameOld);
    let myClass = myBreakout.myClass;

    name = el.querySelector("[data-class-name]").value.trim();
    desc = el.querySelector("[data-class-desc]").value.trim();

    if (name == "") {
      el.parentElement.removeChild(el);
    } else {
      myClass.name = name;
      myClass.desc = desc;

      updateClasses.push({ nameKey: name, class: myClass });

      list.push({ name: name, desc: desc });

      el.dataset.classNameKey2 = name;
    }
  });

  // No blanks
  list = list.filter((el) => {
    if (el.name == "" || el.desc == "") {
      return false;
    }
    return true;
  });

  myBreakout.overwriteClasses(updateClasses);

  await myBreakout.saveBreakout();

  updateDropdownsLists();

  if (boolMsg) {
    alertMessage(
      coursesSaved,
      // "Courses Saved",
      "alert-success",
      "#classes-alert",
      (category = "classes"),
      (waitTime = 1000)
    );
  }
};
