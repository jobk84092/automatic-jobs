const parentWindow = window.parent; // reference to the parent window

const TEN_MINS_IN_MS = 10 * 60 * 1000;

// close sidebar
const closeBtnEl = document.getElementById('extensions-wrapper-close');
const dontShowAgainEl = document.querySelector('.outline-btn');

closeBtnEl.addEventListener('click', () => {
  parentWindow.postMessage({ type: "MYLOFT_CLOSE_SIDEBAR" }, '*');
});

dontShowAgainEl.addEventListener('click', () => {
  parentWindow.postMessage({ type: "MYLOFT_BLOCK_DOMAIN_RULE", id: _htmlArr[_currIndex].id }, '*');
  parentWindow.postMessage({ type: "MYLOFT_CLOSE_SIDEBAR" }, '*');
});

// helpful dialog
const helpfulYesBtnEl = document.getElementById('helpful-yes');
const helpfulNoBtnEl = document.getElementById('helpful-no');

helpfulYesBtnEl.addEventListener('click', () => {
  sendAnalyticsData(true);
  removeHelpfulDialog();
});

helpfulNoBtnEl.addEventListener('click', () => {
  helpfulNoBtnEl.classList.add('btn-no');
  sendAnalyticsData(false);
  removeHelpfulDialog();
});

function sendAnalyticsData(reaction) {
  if (currDomainRuleId) {
    const data = {
      id: currDomainRuleId,
      reaction,
      event_type: "REACTION",
    };

    parentWindow.postMessage({ type: "MYLOFT_SEND_ANALYTICS", analyticsData: data }, '*');
    return true;
  }
  return false;
}

// institute logo & name
const instituteLogoEl = document.getElementById('institute-logo');
const instituteNameEl = document.getElementById('institute-name');

// pagination
const prevButtonEl = document.getElementById('pagination-prev');
const nextButtonEl = document.getElementById('pagination-next');

// domain rule title & content
const domainRuleTitleEl = document.getElementById('domain-rule-title');
const domainRuleContentEl = document.getElementById('domain-rule-content');

const scrollableDivEl = document.querySelector('.scrollbox');
const helpfulDivEl = document.querySelector('.extensions-help-box');

let transitionTimeoutId;

function removeHelpfulDialog() {
  // update local data
  _htmlArr[_currIndex].helpful = {
    domainRuleId: _htmlArr[_currIndex].id,
  };

  helpfulDivEl.classList.add('fadeOut');

  helpfulDivEl.addEventListener('transitionend', function () {
    helpfulDivEl.classList.add('hidden');
  }, { once: true });
  
  const thankYouDiv = document.createElement('div');
  thankYouDiv.id = 'thankyou';
  thankYouDiv.innerHTML = '<p>Thank you for the feedback!</p>';
  thankYouDiv.classList.add('thankyou-dialog', 'fadeIn');
  
  transitionTimeoutId = setTimeout(() => {
    helpfulDivEl.parentNode.appendChild(thankYouDiv);
    
    setTimeout(() => {
      thankYouDiv.classList.remove('fadeIn');
      thankYouDiv.classList.add('fadeOut');
      thankYouDiv.addEventListener('transitionend', function () {
        helpfulDivEl.parentNode.removeChild(thankYouDiv);
      }, { once: true });
    }, 1200)
  }, 1000)
}

const contentShadowRoot = domainRuleContentEl.attachShadow({ mode: 'open' });
const parser = new DOMParser();

let currDomainRuleId;

// for view analytics
let checkForView;

function sendDomainRuleViewedAnalytic(idx) {
  if (checkForView && !checkForView[idx]) {
    parentWindow.postMessage({
      type: "MYLOFT_SEND_ANALYTICS",
      analyticsData: {
        id: currDomainRuleId,
        event_type: "VIEW",
      }
    }, '*');

    checkForView[idx] = true;
  }
}

// hold references so you can update data from anywhere
let _htmlArr;
let _currIndex;

const onReceiveMessage = event => {
  try {
    const { data: { type, htmlArr, instituteInfo } = {} } = event;

    if (type === 'MYLOFT_DOMAIN_RULES' && Array.isArray(htmlArr) && htmlArr.length > 0) {
      _htmlArr = htmlArr;
      checkForView = new Array(htmlArr.length).fill(false);

      if (instituteInfo) {
        const { instituteName, instituteLogoUrl } = instituteInfo;

        if (instituteName) {
          instituteNameEl.innerText = instituteName;
          instituteLogoEl.alt = instituteName;
        }

        if (instituteLogoUrl) {
          instituteLogoEl.src = instituteLogoUrl;
        }
      }

      // incase there is not institute logo then show myloft logo
      instituteLogoEl.onerror = function () {
        instituteLogoEl.src = chrome.runtime.getURL('../../icons/icon128.png');
      };

      let currentPage = 1;
      const totalPages = htmlArr.length; // Total number of pages
      const maxPageNoVisible = 6;

      let startPage, endPage;

      function updatePagination() {
        clearTimeout(transitionTimeoutId);
        const thankYouDivEl = document.getElementById('thankyou');
        const paginationEl = document.getElementById('pagination-container');
        const elementsToRemove = paginationEl.querySelectorAll('.page-btn');

        elementsToRemove.forEach(element => {
          element.remove();
        });

        if (totalPages <= maxPageNoVisible) {
          startPage = 1;
          endPage = totalPages;
        } else if (currentPage <= Math.floor(maxPageNoVisible / 2) + 1) {
          startPage = 1;
          endPage = maxPageNoVisible;
        } else if (currentPage > totalPages - Math.floor(maxPageNoVisible / 2)) {
          startPage = totalPages - maxPageNoVisible + 1;
          endPage = totalPages;
        } else {
          startPage = currentPage - Math.floor(maxPageNoVisible / 2);
          endPage = startPage + maxPageNoVisible - 1;
        }

        for (let i = startPage; i <= endPage; i++) {
          const newPageBtnEl = document.createElement('button');
          newPageBtnEl.classList.add('rounded-btn', 'page-btn');

          if (i === currentPage) {
            newPageBtnEl.classList.add('active');
          }

          newPageBtnEl.addEventListener('click', function () {
            currentPage = i;
            updatePagination();
          });

          newPageBtnEl.textContent = String(i);
          nextButtonEl.insertAdjacentElement('beforebegin', newPageBtnEl);
        }


        // handel next and prev btn disable
        if (currentPage === htmlArr.length) {
          nextButtonEl.classList.add('disabled-btn')
        } else {
          nextButtonEl.classList.remove('disabled-btn')
        }

        if (currentPage === 1) {
          prevButtonEl.classList.add('disabled-btn')
        } else {
          prevButtonEl.classList.remove('disabled-btn')
        }

        const currIndex = currentPage - 1;
        _currIndex = currIndex;
        // update domain rule html
        domainRuleTitleEl.innerText = htmlArr[currIndex].name;

        const parsedContent = parser.parseFromString(htmlArr[currIndex].value, 'text/html');
        contentShadowRoot.innerHTML = '';

        // Remove autofocus attribute from all elements - because of cross-origin subframe issue
        parsedContent.querySelectorAll('[autofocus]').forEach((element) => {
          element.removeAttribute('autofocus');
        });
        
        // Open all <a> tag links in a new tab
        parsedContent.querySelectorAll('a').forEach((link) => {
          link.setAttribute('target', '_blank');
        });
        
        contentShadowRoot.appendChild(parsedContent.documentElement);
        
        currDomainRuleId = htmlArr[currIndex].id;
        sendDomainRuleViewedAnalytic(currIndex);
        
        // helpful
        if (thankYouDivEl) {
          thankYouDivEl.remove();
        }
        
        helpfulDivEl.classList.remove('fadeOut');

        if (htmlArr[currIndex]?.helpful?.domainRuleId) {
          helpfulDivEl.classList.add('hidden');
        } else {
          helpfulDivEl.classList.remove('hidden');
        }

        // handling masking based on content size
        if (scrollableDivEl.scrollHeight > scrollableDivEl.clientHeight) {
          scrollableDivEl.classList.add('masking')
        } else {
          scrollableDivEl.classList.remove('masking')
        }

        scrollableDivEl.addEventListener('scroll', function () {
          const isAtBottom = scrollableDivEl.scrollHeight - scrollableDivEl.scrollTop <= scrollableDivEl.clientHeight + 1;

          if (isAtBottom) {
            scrollableDivEl.classList.remove('masking');
          } else {
            scrollableDivEl.classList.add('masking');
          }
        });
      }

      updatePagination()

      const paginationContainer = document.querySelector('.extensions-pagination');
      htmlArr.length > 1 && paginationContainer.classList.remove('hidden');

      prevButtonEl.addEventListener('click', function () {
        if (currentPage > 1) {
          currentPage--;
          updatePagination();
        }
      });

      nextButtonEl.addEventListener('click', function () {
        if (currentPage < totalPages) {
          currentPage++;
          updatePagination();
        }
      });
    }
  } catch (error) {
    console.error("Domain rule script error :", error);
  }
};

window.addEventListener('message', onReceiveMessage);
