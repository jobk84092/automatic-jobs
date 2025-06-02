// make sure the script is running on the main window
// check for element to make sure it doesn't run twice 
if (window.self === window.top && !document.getElementById('shadowHostContainer')) {
  let shadowHost;
  let closeTimer;
  let cursorInsideIframe = false;

  let iframe;

  const CLOSE_SIDE_PANEL_IN_MS = 5000;
  const SIDE_PANEL_WIDTH_IN_PX = 350;

  function createShadowHost() {
    if (typeof shadowHost === 'undefined') {
      shadowHost = document.createElement('div');
      shadowHost.id = 'shadowHostContainer';
      shadowHost.style.cssText = `
        position: fixed;
        top: 0;
        right: -${SIDE_PANEL_WIDTH_IN_PX}px;
        height: 100%;
        z-index: 2147483647 !important;
        display: block;
        transition: right 0.5s ease;
        box-shadow: rgba(169, 179, 203, 0.64) -20px 0px 46px;
        -webkit-box-shadow: rgba(169, 179, 203, 0.64) -20px 0px 46px;
      `;

      const shadowRoot = shadowHost.attachShadow({ mode: 'open' });

      iframe = document.createElement('iframe');
      iframe.style.cssText = `
        height: 100% !important;
        width: ${SIDE_PANEL_WIDTH_IN_PX}px !important;
        border: 0;
        background-color: white !important;
      `;
      iframe.src = chrome.runtime.getURL("src/domain-rules/domain-rules.html");

      // Add mouseenter event listener to the shadowHost
      shadowHost.addEventListener('mouseenter', () => {
        cursorInsideIframe = true;
      });

      shadowRoot.appendChild(iframe);
      document.documentElement.appendChild(shadowHost);

      // Trigger a reflow to apply the transition
      setTimeout(() => {
        shadowHost.style.right = "0";
      }, 0);

      startCloseTimer();
    }
  }

  function closeShadowHost() {
    if (shadowHost) {
      shadowHost.style.right = `-${SIDE_PANEL_WIDTH_IN_PX}px`;
      shadowHost.addEventListener('transitionend', function handleTransitionEnd() {
        // Remove the event listener to avoid multiple calls
        shadowHost.removeEventListener('transitionend', handleTransitionEnd);

        // Remove the shadow host from the DOM
        if (shadowHost.parentNode) {
          shadowHost.parentNode.removeChild(shadowHost);
        }
      });

      clearTimeout(closeTimer);
    }
  }

  function startCloseTimer() {
    clearTimeout(closeTimer);

    closeTimer = setTimeout(() => {
      if (!cursorInsideIframe) {
        closeShadowHost();
      }
    }, CLOSE_SIDE_PANEL_IN_MS);
  }

  const onReceiveMessage = event => {
    try {
      const { data: { type, analyticsData, id } = {} } = event;

      if (type === 'MYLOFT_CLOSE_SIDEBAR') {
        closeShadowHost()
      }

      if (type === 'MYLOFT_BLOCK_DOMAIN_RULE') {
        chrome.runtime.sendMessage({ blockDomainRule: { id } }, (response) => {
          if (chrome.runtime.lastError) {
            return;
          }
        });
      }

      if (type === 'MYLOFT_SEND_ANALYTICS') {
        chrome.runtime.sendMessage({ domainRuleAnalyticsData: analyticsData }, (response) => {
          if (chrome.runtime.lastError) {
            return;
          }
        });
      }
    } catch (error) {
      ;
    }
  };

  // receive messages from the iframe
  window.addEventListener('message', onReceiveMessage);

  (async () => {
    try {
      const { tempDomainRuleStore = {} } = await chrome.storage.local.get('tempDomainRuleStore');

      if (!tempDomainRuleStore) {
        return;
      }

      const storeData = JSON.parse(JSON.stringify(tempDomainRuleStore));
      const { instituteInfo, helpfulData, htmlToShow } = storeData;

      if (helpfulData && Array.isArray(helpfulData) && helpfulData.length > 0) {
        helpfulData.forEach((data) => {
          const findIdx = htmlToShow.findIndex(({ id }) => id === data.domainRuleId);
          if (findIdx !== -1) {
            htmlToShow[findIdx].helpful = data;
          }
        })
      }

      if (htmlToShow && Array.isArray(htmlToShow) && htmlToShow.length > 0) {
        // create the shadow host
        createShadowHost();
        // send the html data to the iframe after it loads
        iframe.addEventListener('load', () => {
          iframe.contentWindow.postMessage({ type: "MYLOFT_DOMAIN_RULES", htmlArr: htmlToShow, instituteInfo }, '*');
        });
      }

      await chrome.storage.local.remove('tempDomainRuleStore');
    } catch (error) {
      console.error("Failed to initialize MyLOFT slider :", error)
    }
  })()
}
