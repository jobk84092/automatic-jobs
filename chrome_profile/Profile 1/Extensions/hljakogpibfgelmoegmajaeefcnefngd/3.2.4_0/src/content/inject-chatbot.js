(async () => {
  try {
    if (window.__MYLOFT_CHATBOT_SCRIPT_LOADED__) {
      return;
    }

    window.__MYLOFT_CHATBOT_SCRIPT_LOADED__ = true;

    const iframeId = 'myloft-chatbot-bubble-window'
    const iframeEle = document.getElementById(iframeId)
    // if chatbot already exists then stop execution
    if (iframeEle) {
      return
    }

    const chatbotConfigKey = 'chatbotInjectTempInfo'
    const chatbotUrlAccessCountKey = 'chatbotUrlAccessCount'
    const showTooltipOnCount = 5
    let showHelpTooltip = false

    let [config, urlAccessCount] = await Promise.all([getLocalStorageValue(chatbotConfigKey), getLocalStorageValue(chatbotUrlAccessCountKey)])
    // if config not passed then stop execution
    if (!config) {
      return
    }

    let pageURL = location.href;
    if (pageURL.length > 256) {
      pageURL = pageURL.slice(0, 256)
    }
    config.input.currentUrl = pageURL;

    let currUrlAccessCount = urlAccessCount?.[pageURL] || 0;  
    currUrlAccessCount++;

    if (currUrlAccessCount >= showTooltipOnCount) {
      showHelpTooltip = true;
    }

    const buttonId = 'myloft-chatbot-bubble-button'
    const buttonTooltipId = 'myloft-chatbot-bubble-button-tooltip'
    const buttonContent = {
      open: `<svg width="21" height="21" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_15055_457685)">
        <g clip-path="url(#clip1_15055_457685)">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M23.8125 2.33951L11.9719 7.88951L0.140625 2.33951V8.35826L5.4 13.1958L11.9719 19.1395L17.7094 14.3114L22.2268 14.3253L23.8125 12.8466V2.33951Z" fill="url(#paint0_linear_15055_457685)"/>
        <path d="M11.9719 5.70768L23.8125 0.157684V12.1483L17.7094 12.1296L11.9719 16.9577L5.4 11.0139L0.140625 6.17643V0.157684L11.9719 5.70768Z" fill="white"/>
        <path d="M17.8781 12.8983L11.9813 18.0733L0.140625 7.07645V12.8046L11.9813 23.8389L23.8125 12.8702L17.8781 12.8983Z" fill="#C6C6C6"/>
        </g>
        </g>
        <defs>
        <linearGradient id="paint0_linear_15055_457685" x1="23.8125" y1="10.7395" x2="0.140625" y2="10.7395" gradientUnits="userSpaceOnUse">
        <stop stop-color="#EB479D"/>
        <stop offset="0.93" stop-color="#7169F0"/>
        </linearGradient>
        <clipPath id="clip0_15055_457685">
        <rect width="24" height="24" fill="white"/>
        </clipPath>
        <clipPath id="clip1_15055_457685">
        <rect width="24" height="24" fill="white"/>
        </clipPath>
        </defs>
      </svg>`,
      close: `<svg id="closeIcon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 18L6 6M6 18L18 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
    }

    function objectToQueryParams(obj) {
      return Object.keys(obj)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
        .join('&')
    }

    async function initializeChatbot() {
      const iframeEle = document.getElementById(iframeId)
      if (iframeEle) {
        return
      }
        
      if (Object.keys(config).length > 0) {
        const chatbotUrl = (config.input && Object.keys(config.input).length > 0) ? `${config.baseUrl}/?${objectToQueryParams(config.input)}` : config.baseUrl

        // css for the iframe is in the inject-chatbot.css file
        function createIframe() {
          const iframe = document.createElement('iframe');
          iframe.allow = 'fullscreen;microphone';
          iframe.title = 'myloft chatbot bubble window';
          iframe.id = iframeId;
          iframe.src = chatbotUrl;
          document.body.appendChild(iframe);
        }

        function adjustIframePosition() {
          const iframe = document.getElementById(iframeId);
          const button = document.getElementById(buttonId);
          if (iframe && button) {
            const buttonRect = button.getBoundingClientRect();
            const bottomSpace = window.innerHeight - buttonRect.bottom;
            const leftSpace = buttonRect.left;

            iframe.style.bottom = `${bottomSpace + buttonRect.height + 5 + iframe.clientHeight > window.innerHeight
              ? bottomSpace - iframe.clientHeight - 5
              : bottomSpace + buttonRect.height + 5
              }px`;
            iframe.style.left = `${leftSpace + iframe.clientWidth > window.innerWidth
              ? window.innerWidth - buttonRect.right - iframe.clientWidth
              : leftSpace
              }px`;
          }
        }

        function createChatButton() {
          const main = document.createElement('div');
          main.id = `${buttonId}-main`
          const tooltip = document.createElement('div');
          tooltip.id = buttonTooltipId
          const button = document.createElement('div')
          button.id = buttonId

          const styleTag = document.createElement('style')
          document.head.appendChild(styleTag)
          styleTag.sheet.insertRule(`
            #${main.id} {
              position: fixed;
              z-index: 2147483647;
              bottom: 100px;
              left: 16px;
            }
          `)
          styleTag.sheet.insertRule(`
          #${button.id} {
              box-sizing: border-box;
              --angle: 0deg;
              width: 48px;
              height: 48px;
              border-radius: 50%;
              background-color: black;
              box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 8px 0px;
              cursor: pointer;
              transition: all 0.2s ease-in-out;
              border: 3px solid #0000;
              background: linear-gradient(#131219, #131219) padding-box, linear-gradient(var(--angle), #EB479D, #7169F0) border-box;
              animation: 4s myloft-rotate linear infinite;
            }
          `)
          styleTag.sheet.insertRule(`
            #${button.id}:hover {
              transform: scale(1.1);
            }
          `)
          styleTag.sheet.insertRule(`
            #${tooltip.id} {
              display: none;
              width: 220px;
              background-color: rgba(37, 38, 39, 1);
              box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.4);
              color: #fff;
              text-align: center;
              border-radius: 6px;
              padding: 10px 0;
              position: absolute;
              z-index: 2147483647;
              border-radius: 20px 20px 20px 0%;
              bottom: 48px;
              font-size: 13px;
              font-weight: 600;
              margin-bottom: 5px;
            }
          `)

          const buttonInner = document.createElement('div')
          buttonInner.style.cssText
            = 'display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;'
          buttonInner.innerHTML = buttonContent.open
          button.appendChild(buttonInner)

          tooltip.innerText = 'Need help? Chat with AI Buddy!'
          main.appendChild(button)
          main.appendChild(tooltip)
          document.body.appendChild(main)
          
          if (showHelpTooltip) {
            tooltip.style.display = 'block';
            reportEvent('tooltipShown', 'true', 'eResourceNotAccess')
          }

          button.addEventListener('click', function () {
            const iframe = document.getElementById(iframeId)
            if (iframe) {
              let type_r = null;
              let isTriggered_r = null;
              let triggerName_r = null;

              if (iframe.style.display === 'none') {
                iframe.style.display = 'block';
                tooltip.style.display = 'none';

                button.style.background = 'linear-gradient(#131219, #131219) padding-box, linear-gradient(var(--angle), #ffffff, #ffffff) border-box';
                button.style.animation = 'none';

                type_r = 'open';
                isTriggered_r = 'false';
              } else {
                iframe.style.display = 'none';
                
                button.style.background = 'linear-gradient(#131219, #131219) padding-box, linear-gradient(var(--angle), #EB479D, #7169F0) border-box';
                button.style.animation = '4s myloft-rotate linear infinite';
                
                type_r = 'close';
                isTriggered_r = 'false';
              }
              
              reportEvent(type_r, isTriggered_r, triggerName_r)

              buttonInner.innerHTML = iframe.style.display === 'none' ? buttonContent.open : buttonContent.close
              if (iframe.style.display === 'none')
                document.removeEventListener('keydown', closeOnEsc)
              else
                document.addEventListener('keydown', closeOnEsc)

              adjustIframePosition()
            }
            else {
              createIframe()
              adjustIframePosition()
              this.title = 'Exit (ESC)'
              buttonInner.innerHTML = buttonContent.close
              document.addEventListener('keydown', closeOnEsc)
            }
          })
        }

        if (chatbotUrl.length > 2048) {
          throw new Error(
            'The URL is too long, please reduce the number of inputs to prevent the bot from failing to load',
          )
        }

        if (!document.getElementById(buttonId))
          createChatButton()

        createIframe()
        document.getElementById(iframeId).style.display = 'none'
      }
      else {
        throw new Error(`${config} is empty or token is not provided`)
      }
    }

    function closeOnEsc(event) {
      if (event.key === 'Escape') {
        const iframe = document.getElementById(iframeId)
        const button = document.getElementById(buttonId)
        if (iframe && iframe.style.display !== 'none') {
          iframe.style.display = 'none'
          button.querySelector('div').innerHTML = buttonContent.open
        }
      }
    }

    async function getLocalStorageValue(key) {
      const data = await chrome.storage.local.get(key);
      if (chrome.runtime.lastError) {
        throw new Error('chrome runtime error');
      }
      return data[key]
    }

    async function setLocalStorageValue(key, value) {
      await chrome.storage.local.set({ [key]: value });
      if (chrome.runtime.lastError) {
        throw new Error('chrome runtime error');
      }
      return true;
    }

    async function reportEvent(type, isTriggered, triggerName) {
      const obj = {
        type,
        isTriggered,
      }

      if (triggerName) {
        obj.TriggerName = triggerName;
      }

      chrome.runtime.sendMessage({ chatbot_report: obj }, (r) => {
        if (chrome.runtime.lastError) {
          return;
        }
      });
    }

    document.addEventListener('keydown', closeOnEsc)

    initializeChatbot()

    // set page count for "need help" tooltip
    if (!urlAccessCount) {
      urlAccessCount = {
        [pageURL]: currUrlAccessCount
      };
    } else {
      urlAccessCount[pageURL] = currUrlAccessCount;
    }

    if (currUrlAccessCount >= showTooltipOnCount) {
      urlAccessCount[pageURL] = 0;
    }

    setLocalStorageValue(chatbotUrlAccessCountKey, urlAccessCount)
  } catch (error) {
    console.error('MyLOFT: error injecting chatbot - ', error)
  }
})()
