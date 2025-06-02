// Core Functions
// common functions
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const chromeWindowProperties = async (windowId) => {
  return new Promise((resolve, reject) => {
    chrome.windows.get(windowId, { populate: true }, (window) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(window);
      }
    });
  });
};

const chromeDetectLanguage = async () => {
  return new Promise((resolve, reject) => {
    chrome.tabs.detectLanguage((obj) => {
      resolve(obj);
    });
  });
};

const chromeWindowsGetAll = async (payload) => {
  return new Promise((resolve, reject) => {
    chrome.windows.getAll(payload, (obj) => {
      if (chrome.runtime.lastError) {
        console.log(`Error reading chromeTabsQuery ${JSON.parse(chrome.runtime.lastError)} `);
      }
      resolve(obj);
    });
  });
};

const chromeWindowsGetCurrent = async (payload) => {
  return new Promise((resolve, reject) => {
    chrome.windows.getCurrent(payload, (obj) => resolve(obj));
  });
};

const chromeWindowsGet = async (winId, payload) => {
  return new Promise((resolve, reject) => {
    chrome.windows.get(winId, payload, (obj) => resolve(obj));
  });
};

const chromeTabsQuery = async (payload) => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query(payload, (tab) => {
      if (chrome.runtime.lastError) {
        console.log(`Error reading chromeTabsQuery ${JSON.parse(chrome.runtime.lastError)} `);
      }
      return resolve(tab);
    });
  });
};

const getTabById = (tabId) => {
  return new Promise((resolve, reject) => {
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError));
      } else {
        resolve(tab);
      }
    });
  });
};

const focusTabById = (tabId) => {
  return new Promise((resolve, reject) => {
    chrome.tabs.update(tabId, { active: true }, (tab) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError));
      } else {
        resolve(tab);
      }
    });
  });
};

const chromeTabsQuery2 = async (payload) => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query(payload, (tab) => resolve(tab));
  });
};

const chromeTabsGet = async (tabId) => {
  return new Promise((resolve, reject) => {
    chrome.tabs.get(tabId, (tab) => resolve(tab));
  });
};

const chromeTabsExecuteScript = async (tabId, payload) => {
  return new Promise((resolve, reject) => {
    // chrome.tabs.executeScript(tabId, payload, (tab) => resolve(tab));
    chrome.scripting.executeScript(tabId, payload, (tab) => resolve(tab));
  });
};
const chromeTabsExecuteScriptFunction = async (payload) => {
  return new Promise((resolve, reject) => {
    // chrome.tabs.executeScript(tabId, payload, (tab) => resolve(tab));
    chrome.scripting.executeScript(payload);
  });
};
const chromeTabsSendMessage = async (tabId, payload) => {
  return new Promise((resolve, reject) => {
    // chrome.tabs.sendMessage(tabId, payload, (obj) => resolve(obj));
    chrome.tabs.sendMessage(tabId, payload, (obj) => {
      if (chrome.runtime.lastError) {
        console.log(`Error creating window ${chrome.runtime.lastError} `);
      } else {
        return resolve(obj);
      }
    });
  });
};

const chromeTabsGetCurrent = async () => {
  return new Promise((resolve, reject) => {
    // chrome.tabs.getCurrent((tab) => resolve(tab));
    chrome.tabs.getCurrent((tab) => {
      if (chrome.runtime.lastError) {
        console.log(`Error creating window ${JSON.parse(chrome.runtime.lastError)} `);
      } else {
        return resolve(tab);
      }
    });
  });
};

const chromeWindowActive = async (windowId) => {
  return new Promise((resolve, reject) => {
    chrome.windows.update(windowId, { focused: true }, (window) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(window);
      }
    });
  });
};

const chromeTabsUpdate = async (payload) => {
  return new Promise((resolve, reject) => {
    if (payload.tabId) {
      chrome.tabs.update(payload.tabId, payload.updateProperties, (obj) => resolve(obj));
    } else {
      // alert(`chromeTabsUpdate: ${JSON.stringify(payload)}`);
      chrome.tabs.update(payload.updateProperties, (obj) => resolve(obj));
    }
  });
};

const chromeTabsUpdate2 = async (tabId, payload) => {
  return new Promise((resolve, reject) => {
    chrome.tabs.update(tabId, payload, (obj) => resolve(obj));
  });
};

const chromeTabsMove = async (tabId, payload) => {
  return new Promise((resolve, reject) => {
    chrome.tabs.move(tabId, payload, (obj) => resolve(obj));
  });
};

const chromeWindowsCreate = async (payload) => {
  return new Promise((resolve, reject) => {
    // chrome.windows.create(payload, (tab) => resolve(tab));
    chrome.windows.create(payload, (tab) => {
      if (chrome.runtime.lastError) {
        console.log(`Error creating window ${JSON.parse(chrome.runtime.lastError)} `);
      } else {
        return resolve(tab);
      }
    });
  });
};

const chromeWindowsUpdate = async (payload) => {
  return new Promise((resolve, reject) => {
    chrome.windows.update(payload.id, payload.params, (obj) => resolve(obj));
  });
};

const chromeWindowsUpdate2 = async (winId, payload) => {
  return new Promise((resolve, reject) => {
    chrome.windows.update(winId, payload, (obj) => resolve(obj));
  });
};

const chromeTabsCreate = async (payload) => {
  return new Promise((resolve, reject) => {
    chrome.tabs.create(payload, (obj) => resolve(obj));
  });
};

const chromeTabsCreate2 = async (payload) => {
  return new Promise((resolve, reject) => {
    chrome.tabs.create(payload, (obj) => resolve(obj));
  });
};

const chromeStorageLocalGet = (key) => {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(key, (obj) => resolve(obj));
    } catch (err) {
      reject(`lost context apparently... ${err}`);
    }
  });
};

const chromeStorageLocalSet = (obj) => {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.set(obj, () => resolve());
    } catch (err) {
      reject(`lost context apparently... ${err}`);
    }
  });
};

const chromeRuntimeSendMessage = async (payload) => {
  return new Promise((resolve, reject) => {
    // chrome.runtime.sendMessage(payload, (obj) => resolve(obj));
    chrome.runtime.sendMessage(payload, (obj) => {
      if (chrome.runtime.lastError) {
        return reject(console.log(`Error creating window ${chrome.runtime.lastError.message} `));
      } else {
        return resolve(obj);
      }
    });
  });
};

const chromeDownload = (url, filename) => {
  return new Promise((resolve, reject) => {
    let options = filename
      ? {
          url,
          filename,
        }
      : {
          url,
        };
    chrome.downloads.download(options, (id) => resolve(id));
  });
};

const myFetch = (url) => {
  return new Promise((resolve, reject) => {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function () {
      if (this.readyState == 4) {
        if (this.status == 200) {
          // var doc = document.createElement('html');
          // doc.innerHTML = req.responseText;
          resolve(req.responseText);
        } else {
          reject(this.statusText);
        }
      }
    };
    req.open("GET", url, true);
    req.send();
  });
};

// const myFetch2 = (url) => {
//   return new Promise((resolve, reject) => {
//     fetch(url, (obj) => resolve(obj));
//   });
// };

const myFetchArr = (list) => {
  return Promise.all(
    list.map(async (el) => {
      return { name: el.name, result: await myFetch2(el.url) };
    })
  );
};

const autoCreateLink = async (nick = "") => {
  // debugger;

  let throwError = `Error in automatically creating the link.  If you are not logged in to your teaching account please log in and try again.  However, if you are already logged in then please log out of all your accounts and then log in again using this link: https://accounts.google.com/SignoutOptions`;

  let throwErrorNick = `Error in creating the link for nickname ${nick}.  You might be getting this error because you did not login using your google suite account. Please note that only google suite accounts can create a meet using nicknames. If you do not have a suite account, then you may only create static urls (purple color) or codes (blue) in the Rooms tab.  If you do have a google suite account and are logged in, then please log out and log in again using this link: https://accounts.google.com/SignoutOptions`;

  let errorAutoCreateLink = chrome.i18n.getMessage("errorAutoCreateLink");
  let errorNick1 = chrome.i18n.getMessage("errorNick1");
  let errorNick2 = chrome.i18n.getMessage("errorNick2");

  throwError = errorAutoCreateLink ? errorAutoCreateLink : throwError;

  throwErrorNick = errorNick1 && errorNick2 ? errorNick1 + nick + errorNick2 : throwErrorNick;

  try {
    let response;

    if (nick) {
      // response = await myFetch(`https://g.co/meet/${nick}`);
      // response = await fetch(`https://meet.google.com/lookup/${nick}`, {
      //   credentials: "include",
      //   headers: { "Content-Type": "application/text" },
      // }).then((response) => response.text());
      response = await fetch(`https://meet.google.com/lookup/${nick}`).then((response) => response.text());

      let doc = document.createElement("document");
      doc.innerHTML = response;
      let linkElement = doc.querySelector('link[rel="canonical"]');
      // if (linkElement?.href?.includes('meet.google.com')) {
      if (linkElement && linkElement.href && linkElement.href.includes("meet.google.com")) {
        if (linkElement.href.includes("_meet/")) {
          debugger;
          let myString = linkElement.href.split("_meet/");
          if (myString.length >= 2) {
            newLink = myString[0] + myString[1];
            return newLink;
          } else {
            throw throwErrorNick;
          }
        } else {
          debugger;
          return linkElement.href;
        }

        // let myString = linkElement.href.split("_meet/");
        // if (myString.length >= 2) {
        //   newLink = myString[0] + myString[1];
        //   return newLink;
        // } else {
        //   throw throwErrorNick;
        // }
      } else {
        throw throwErrorNick;
      }
    } else {
      // response = await fetch("https://meet.google.com/new", {
      //   credentials: "include",
      //   headers: { "Content-Type": "application/text" },
      // }).then((response) => response.text());
      response = await fetch("https://meet.google.com/new").then((response) => response.text());

      let regexMask = /https:\/\/meet.google.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}/;
      let regexSplit = regexMask.exec(response);

      if (regexSplit && regexSplit.length > 0) {
        newLink = regexSplit[0];
        return newLink;
      } else {
        throw throwError;
      }
    }
  } catch (error) {
    alert(error);
  }
};

const autoCreateLinkArr = (list) => {
  return Promise.all(
    list.map(async (el) => {
      let name = el.name;
      let link = el.link;
      let linkType = el.linkType;
      let linkFetchedUrl;

      switch (linkType) {
        case "nick":
          linkFetchedUrl = await autoCreateLink((nick = link));
          break;

        case "nickGC":
          let myNick = getNickFromLookup(link);
          linkFetchedUrl = await autoCreateLink((nick = myNick));
          break;

        case "code":
          linkFetchedUrl = "https://meet.google.com/" + link;
          break;

        case "url":
          if (link) {
            linkFetchedUrl = link;
          } else {
            link = await autoCreateLink((nick = link));
            linkFetchedUrl = link;
          }
          break;

        default:
          break;
      }

      console.log(`name= ${name}, linkFetchedUrl = ${linkFetchedUrl}`);

      return {
        linkFetchedUrl: linkFetchedUrl,
        name: name,
      };
      // return {
      //   linkFetchedUrl: await autoCreateLink((nick = el.nick)),
      //   name: el.name,
      // };
    })
  );
};
