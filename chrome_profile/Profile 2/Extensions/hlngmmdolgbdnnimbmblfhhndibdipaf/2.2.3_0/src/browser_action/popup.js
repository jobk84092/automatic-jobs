/* global chrome */

function getCurrentTabUrl (callback) {
  let queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function (tabs) {
    let tab = tabs[0];
    let url = tab.url;

    chrome.action.setIcon({
      path: {
          "16": "../../icons/icon-warning16.png",
          "32": "../../icons/icon-warning32.png"
        }, 
        tabId: tab.id
    });
    window.addEventListener("message", (event) => {
      if(event.origin === 'https://www.woorank.com' && /com\.woorank\.height_[0-9\.]*/.test(event.data)) {
        chrome.action.setIcon({
          path: {
              "16": "../../icons/icon-success16.png",
              "32": "../../icons/icon-success32.png"
            }, 
            tabId: tab.id
        });
      }
    });

    callback(url);
  });
}

function getWoorankLanguage () {
  const language = window.navigator.userLanguage || window.navigator.language;
  if (language.indexOf('es') !== -1) {
    return 'es';
  } else if (language.indexOf('fr') !== -1) {
    return 'fr';
  } else if (language.indexOf('de') !== -1) {
    return 'de';
  } else if (language.indexOf('pt') !== -1) {
    return 'pt';
  } else if (language.indexOf('nl') !== -1) {
    return 'nl';
  }
  return 'en';
}

function parseUrl (url) {
  if (url instanceof URL) {
    return new URL(url);
  } else if (url && (typeof url === 'string')) {
    return new URL(url.trim());
  } else {
    throw new Error(`Invalid url: ${JSON.stringify(url)}`);
  }
}

function getReviewUrl (url) {
  const lang = getWoorankLanguage();
  return 'https://www.woorank.com/' + lang + '/extensionv2/?url=' + url.hostname + '&href=' + url.href;
}

function insertIframe () {
  let iframe = document.createElement('iframe');
  iframe.setAttribute('class', 'woorank-review');
  document.getElementsByClassName('woo-js-popup')[0].appendChild(iframe);
}

function loadReviewInIframe (url) {
  let iframe = document.getElementsByClassName('woorank-review')[0];
  iframe.src = url;
}

document.addEventListener('DOMContentLoaded', function () {
  insertIframe();
  getCurrentTabUrl(url => {
    const parsedUrl = parseUrl(url);
    if (/https?/.test(parsedUrl.protocol) && parsedUrl.hostname.length > 0) {
      loadReviewInIframe(getReviewUrl(parsedUrl));
    } else {
      window.close();
    }
  });
});
