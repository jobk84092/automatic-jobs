const readFile = async (filename) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    // reader.onloadend = event => resolve(event.target.result)
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsText(filename);
  });
};

function ImportExportError(message) {
  this.message = message;
  this.name = "Breakout Import/Export";
}

// Handler to read file from user's computer
const handleRoomsExport = async (evt) => {
  try {
    let rooms = myBreakout.myRooms;
    rooms = { breakoutDownloadType: "rooms", rooms };
    let filename = document.querySelector("#rooms-export-filename").value;
    filename = filename ? filename : "download";
    filename = filename.endsWith(".txt") ? filename : filename + ".txt";
    let dataStr = "data:text/text;charset=utf-8,";
    dataStr += JSON.stringify(rooms);

    let link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", filename);
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);

    document.querySelector("#downloadMessage").innerText =
      "Successfully Downloaded...";
    await sleep(1000);
    document.querySelector("#downloadMessage").innerText = "";
  } catch (err) {
    alert(`Error in downloading the file ${JSON.stringify(err)}`);
  }
};

const handleRoomsImport = async (evt) => {
  const SELECTFILE = `Please click on "Choose File" button and select a file`;
  const GENERIC = `Error reading the file.  There are two import/exports: one in the Rooms tab and one in the Courses tab.  This file cannot be imported because it is not a Rooms tab exported file`;
  const MYERRORS = "Breakout Import/Export";
  const NOCLASS = "Please select a class in the Rooms tab";

  try {
    let myImport;

    // Make sure you have a class
    nameKey = document.querySelector("#setup-rooms-class[data-class-name-key]")
      .dataset.classNameKey;

    if (!nameKey) {
      throw new ImportExportError(NOCLASS);
    }

    // Make sure the user selected a file
    let filename = document.querySelector("#rooms-import-filename").files[0];
    if (!filename) {
      throw new ImportExportError(SELECTFILE);
    }

    if (filename.type != "text/plain") {
      throw new ImportExportError(GENERIC);
    }

    // Read the file
    let result = await readFile(filename);

    try {
      myImport = JSON.parse(result);
    } catch (err) {
      throw new ImportExportError(GENERIC);
    }

    // Make sure it is in the right file format, otherwise throw error
    if (
      myImport.breakoutDownloadType &&
      myImport.breakoutDownloadType === "rooms"
    ) {
      rooms = myImport.rooms;
    } else {
      throw new ImportExportError(
        `Error reading the file "${filename.name}".  ${GENERIC}`
      );
    }

    if (rooms.length < 1) {
      throw new ImportExportError(`The imported file has no rooms`);
    }

    meetNumRooms = rooms.length;

    // Assign the rooms to breakout, save, and refresh
    myBreakout.overwriteRooms(nameKey, rooms);
    myBreakout.settings.meetNumRooms = meetNumRooms;
    await myBreakout.saveBreakout();
    updateDropdownsLists();

    // Give message
    document.querySelector("#roomsUploadMessage").innerText =
      "Successfully Uploaded...";
    await sleep(1000);
    document.querySelector("#roomsUploadMessage").innerText = "";

    // Catch errors
  } catch (e) {
    if (e.name === MYERRORS) {
      alert(e.message);
    } else {
      alert(GENERIC);
    }
  }
};

const handleClassesExport = async (evt) => {
  try {
    let classes = myBreakout.classes;
    classes = { breakoutDownloadType: "classes", classes };
    let filename = document.querySelector("#classes-export-filename").value;
    filename = filename ? filename : "download";
    filename = filename.endsWith(".txt") ? filename : filename + ".txt";
    let dataStr = "data:text/text;charset=utf-8,";
    dataStr += JSON.stringify(classes);

    let link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", filename);
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);

    document.querySelector("#downloadMessage").innerText =
      "Successfully Downloaded...";
    await sleep(1000);
    document.querySelector("#downloadMessage").innerText = "";
  } catch (err) {
    alert(`Error in downloading the file ${JSON.stringify(err)}`);
  }
};

const handleClassesImport = async (evt) => {
  const SELECTFILE = `Please click on "Choose File" button and select a file`;
  const GENERIC = `Error reading the file.  There are two import/exports: one in the Rooms tab and one in the Courses tab.  This file cannot be imported because it is not a Courses tab exported file`;
  const MYERRORS = "Breakout Import/Export";

  try {
    debugger;
    // Make sure the user selected a file
    let filename = document.querySelector("#classes-import-filename").files[0];
    if (!filename) {
      throw new ImportExportError(SELECTFILE);
    }

    if (filename.type != "text/plain") {
      throw new ImportExportError(GENERIC);
    }

    // Read the file
    let result = await readFile(filename);

    try {
      myImport = JSON.parse(result);
    } catch (err) {
      throw new ImportExportError(GENERIC);
    }

    // Make sure it is in the right file format, otherwise throw error
    if (
      myImport.breakoutDownloadType &&
      myImport.breakoutDownloadType === "classes"
    ) {
      classes = myImport.classes;
    } else {
      throw new ImportExportError(
        `Error reading the file "${filename.name}".  ${GENERIC}`
      );
    }

    if (classes.length < 1) {
      throw new ImportExportError(`The imported file has no classes`);
    }

    // Assign the rooms to breakout, save, and refresh
    myBreakout.classes = classes;
    await myBreakout.saveBreakout();
    updateDropdownsLists();

    // Give message
    document.querySelector("#classesUploadMessage").innerText =
      "Successfully Uploaded...";
    await sleep(1000);
    document.querySelector("#classesUploadMessage").innerText = "";

    // Catch errors
  } catch (e) {
    if (e.name === MYERRORS) {
      alert(e.message);
    } else {
      alert(GENERIC);
    }
  }
};
