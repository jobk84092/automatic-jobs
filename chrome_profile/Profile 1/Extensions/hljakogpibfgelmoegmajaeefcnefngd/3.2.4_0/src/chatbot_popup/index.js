const startChatElm = document.getElementById("start-chat");
const extensionBoxElm = document.getElementById("extension-box");
const mainElm = document.getElementById('main');
const accessUrlElm = document.getElementById('access-url');
const chatElm = document.getElementById('start-chat');

const chatbotPopupInfoKey = 'chatbotPopupInfo';

let config = {};

startChatElm.addEventListener("click", function (event) {
  event.preventDefault();
  extensionBoxElm.classList.toggle("active");
  extensionBoxElm.style.padding = '0px';

  const iframe = document.createElement('iframe');
  iframe.allow = 'fullscreen;microphone';
  iframe.title = 'myloft chatbot popup window';
  iframe.id = 'myloft-chatbot-popup-window';
  iframe.src = config.url
  config.continueChat = true;

  mainElm.replaceWith(iframe);
  reportEvent('open', 'true', 'eResourceNotLoading')
});

// for passing pop-up closing to the service worker
window.addEventListener("blur", async function () {
  await setSessionStorage(chatbotPopupInfoKey, config);
  sendPopUpClosedMsg();
  reportEvent('close', 'true', 'eResourceNotLoading')
});

async function getSessionStorage(key) {
  try {
    const data = await chrome.storage.session.get(key);
    if (chrome.runtime.lastError) {
      throw new Error('chrome runtime error');
    }
    return data[key]
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function setSessionStorage(key, value) {
  try {
    await chrome.storage.session.set({ [key]: value });
    if (chrome.runtime.lastError) {
      throw new Error('chrome runtime error');
    }
    return true;
  } catch (error) {
    console.error(error);
    return null;
  }
}

function sendPopUpClosedMsg() {
  chrome.runtime.sendMessage({ action: "popupClosed" }, (r) => {
    if (chrome.runtime.lastError) {
      return;
    }
  });
}

function reportEvent(type, isTriggered, triggerName) {
  const obj = {
    type,
    isTriggered,
    TriggerName: triggerName
  }

  chrome.runtime.sendMessage({ chatbot_report: obj }, (r) => {
    if (chrome.runtime.lastError) {
      return;
    }
  });
}

(async function () {
  const data = await getSessionStorage(chatbotPopupInfoKey);
  if (!data) {
    // no config loaded so close popup
    sendPopUpClosedMsg()
  }

  config = data;
  accessUrlElm.innerHTML = `${data.forUrl} ?`;

  if (data.continueChat) {
    chatElm.innerText = 'Continue Chat'
  } else {
    chatElm.innerText = 'Start Chat'
  }
}())