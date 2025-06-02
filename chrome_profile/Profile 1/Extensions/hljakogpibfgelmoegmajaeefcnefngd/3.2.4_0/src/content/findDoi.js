let browser;
if (typeof chrome !== 'undefined' && chrome.runtime) {
  browser = chrome;
} else if (typeof browser !== 'undefined' && browser.runtime) {
  browser = browser;
}

const myHost = window.location.hostname;
const devMode = false;
const requestedByURL = window.location.href;

let doi;
let docAsStr;
let tempPpaFoundData;

const devLog = function (str, ...obj) {
  if (devMode && navigator.userAgent.indexOf("Chrome") > -1) {
    console.log("MyLOFT: " + str, ...obj);
  }
};

devLog("script is running!");

function isValidDOI(doi) {
  const doiRegex = /^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;

  if (typeof doi !== 'string') {
    return false;
  }

  const trimmedDOI = doi.trim().toLowerCase();
  return doiRegex.test(trimmedDOI);
}

function getFirstMatchFromXPaths(xpathArray) {
  if (!Array.isArray(xpathArray)) {
    throw new Error('Input must be an array of XPaths.');
  }

  for (const xpath of xpathArray) {
    const result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;

    if (result) {
      return result.textContent.trim();
    }
  }

  return null;
}

function deleteByXPaths(xpathArray) {
  if (!Array.isArray(xpathArray)) {
    throw new Error('Input must be an array of XPath strings');
  }

  let deletedCount = 0;

  xpathArray.forEach(xpath => {
    try {
      const matchingElements = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
        null
      );

      for (let i = 0; i < matchingElements.snapshotLength; i++) {
        const element = matchingElements.snapshotItem(i);
        if (element && element.parentNode) {
          element.parentNode.removeChild(element);
          deletedCount++;
        }
      }
    } catch (error) {
      devLog(`Error processing XPath "${xpath}":`, error);
    }
  });

  devLog('deletedCount', deletedCount)

  return deletedCount;
}

async function getLocalStorageValue(key) {
  try {
    const data = await browser.storage.local.get(key);
    if (browser.runtime.lastError) {
      throw new Error('browser runtime error');
    }
    return data[key];
  } catch (error) {
    return null;
  }
}

// ---------------------------------- PPA ---------------------------------- //

let shadowRoot;

let ppaFoundData;
let feeAmount;
let requestItem = false;
let requestReasonValue = '';
let priceEstimateData;
let openedByIcon = false;
let BuyBtn;

let getPriceEstimatePayloadObj;

let selectedIntendedUseId = null;

const orderContainerClassName = 'myloft-order-container';
const orderDetailContainerClassName = 'myloft-order-detail-container';
const requestReasonId = 'myloft-request-reason';

const orderButtonSvg = `<svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.20435 5.08052L5.90151 0.46875C5.90151 0.46875 13.5031 0.46875 16.8616 0.46875C17.2765 0.46875 17.6757 0.630537 17.9693 0.919149C18.2629 1.20738 18.4273 1.59826 18.4273 2.00597C18.4273 6.19845 18.4273 17.7979 18.4273 21.9903C18.4273 22.3981 18.2629 22.7889 17.9693 23.0771C17.6757 23.3657 17.2765 23.5275 16.8616 23.5275C13.5853 23.5275 6.04636 23.5275 2.77009 23.5275C1.90505 23.5275 1.20435 22.8393 1.20435 21.9903C1.20435 17.5599 1.20435 5.08052 1.20435 5.08052Z" fill="white"/>
<path d="M3.18562 5.22811C3.18562 4.46496 3.24989 3.71663 3.37154 2.98721L1.23706 5.08284C1.23706 5.08284 1.23706 17.5623 1.23706 21.9926C1.23706 22.8416 1.93809 23.5299 2.8028 23.5299C6.07793 23.5299 13.6192 23.5299 16.8943 23.5299C17.3095 23.5299 17.7079 23.3681 18.0014 23.0795C18.2951 22.7913 18.4601 22.4004 18.4601 21.9926C18.4601 21.2043 18.4601 20.1542 18.4601 18.9407C18.0476 18.9765 17.6303 18.9959 17.2084 18.9959C9.46382 18.9959 3.18562 12.8318 3.18562 5.22811Z" fill="#D2DCFD"/>
<path d="M6.68655 4.31191C6.68655 2.7216 6.68655 0.46875 6.68655 0.46875C6.19417 0.46875 5.90371 0.46875 5.90371 0.46875L1.20654 5.08052C1.20654 5.08052 1.20654 5.35977 1.20654 5.84913C1.20654 5.84913 3.50034 5.84913 5.12087 5.84913C5.98587 5.84913 6.68655 5.16085 6.68655 4.31191Z" fill="#D2DCFD"/>
<path d="M18.3105 0.58847C17.9301 0.214495 17.4027 0 16.8636 0H5.90352C5.77641 0 5.65448 0.0496 5.56461 0.137835L0.867439 4.7496C0.77757 4.83789 0.727051 4.95755 0.727051 5.08235V21.9922C0.727099 23.0992 1.64449 24 2.77209 24H16.8636C17.4027 24 17.9301 23.7855 18.3103 23.4118C18.6962 23.0329 18.9086 22.5287 18.9086 21.9922V2.00786C18.9086 1.4713 18.6962 0.967106 18.3105 0.58847ZM6.1021 0.941176H6.20711V4.31374C6.20711 4.90188 5.71975 5.38037 5.12072 5.38037H1.6857V5.27732L6.1021 0.941176ZM17.9501 21.9922C17.9501 22.2773 17.8373 22.5452 17.6322 22.7464C17.4303 22.945 17.1502 23.0589 16.8636 23.0589H2.77209C2.17301 23.0589 1.68565 22.5803 1.68565 21.9922V6.32156H5.12068C6.24829 6.32156 7.16566 5.42085 7.16566 4.31374V0.941176H16.8636C17.1502 0.941176 17.4303 1.05501 17.6324 1.25379C17.8372 1.45483 17.9499 1.72269 17.9499 2.00786L17.9501 21.9922Z" fill="#052A75"/>
<path d="M13.2877 12.4312C13.1005 12.2475 12.7971 12.2475 12.6098 12.4312L10.2966 14.7024V8.92088C10.2966 8.66097 10.082 8.45029 9.81732 8.45029C9.55259 8.45029 9.33802 8.66097 9.33802 8.92088V14.7024L7.0248 12.4311C6.83758 12.2475 6.53414 12.2474 6.34693 12.4311C6.15975 12.615 6.15975 12.9129 6.34693 13.0967L9.47835 16.1713C9.50083 16.1926 9.52489 16.2122 9.55073 16.2296C9.70779 16.3348 9.92674 16.3348 10.0838 16.2296C10.1097 16.2122 10.1337 16.1927 10.1562 16.1713L13.2876 13.0967C13.4748 12.913 13.4748 12.615 13.2877 12.4312Z" fill="#052A75"/>
<path d="M12.9487 19.3886H6.68584C6.42112 19.3886 6.20654 19.1779 6.20654 18.918C6.20654 18.6581 6.42112 18.4475 6.68584 18.4475H12.9487C13.2135 18.4475 13.4281 18.6581 13.4281 18.918C13.4281 19.1779 13.2134 19.3886 12.9487 19.3886Z" fill="#052A75"/>
</svg>`;

// listener for messaging 
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // build price estimate payload and request for the estimate data from the service worker
  if (request?.type === 'ppaFound' && request?.data !== null) {
    devLog('PPA found data received: ', request.data);
    ppaFoundData = request.data;
    const ppaConfigId = ppaFoundData.ppa.id;
    const ppaType = ppaFoundData.ppa.masterPPAConfig.serviceName;
    devLog('PPA type: ', ppaType);

    const priceEstimateInput = {};

    switch (ppaType) {
      case 'REPRINT_DESK': {
        if (request.data.crossRefData?.ISSN.length > 0) {
          priceEstimateInput.issn = request.data.crossRefData.ISSN[0];
        }
        if (doi) {
          priceEstimateInput.doi = doi;
        }
        if (request.data.crossRefData?.page) {
          const pageCount = getCrossRefPageDiff(request.data.crossRefData?.page);

          if (pageCount) {
            priceEstimateInput.totalPages = pageCount;
          }
        }
        if (request.data.crossRefData?.issued['date-parts']?.length > 0) {
          priceEstimateInput.year = request.data.crossRefData.issued['date-parts'][0][0];
        }
        if (!priceEstimateInput.totalPages) {
          priceEstimateInput.totalPages = null;
        }

        devLog('PPA price estimate payload : ', ppaConfigId, priceEstimateInput);

        if (ppaConfigId && Object.keys(priceEstimateInput).length >= 4) {
          getPriceEstimatePayloadObj = { ppaPriceEstimateData: { ppaConfigId, priceEstimateInput, requestedByURL } };
          browser.runtime.sendMessage(getPriceEstimatePayloadObj, (r) => {
            if (browser.runtime.lastError) {
              return;
            }
          });
        }
        break;
      }
    }
  }

  // when price estimate data is received from the service worker
  if (request?.type === 'ppaPriceEstimateFound' && request?.data !== null) {
    devLog('PPA price estimate data received: ', request.data);
    devLog('PPA host name: ', myHost);
    priceEstimateData = request.data.data;
    const ppaType = ppaFoundData.ppa.masterPPAConfig.serviceName;
    devLog('PPA type: ', ppaType);

    if (request?.data?.success === false) {
      return;
    }

    switch (ppaType) {
      case 'REPRINT_DESK': {
        devLog('ppaPriceEstimateFound', request.data.data.priceEstimate)
        feeAmount = getArticleFeeAmount(request.data?.data?.priceEstimate);
        requestItem = request.data?.data?.overPriceCap || false;
        createShadowDomAndInjectCSS();
        if (!openedByIcon) {
          injectOrderSection();
        }
        break;
      }
    }
  }

  // when place order data is received form the service worker
  if (request?.type === 'ppaOrderData' && request?.data !== null) {
    const responseData = request.data;
    devLog('PPA order data: ', responseData);

    removeInjectOrderDetails();
    const el = shadowRoot.querySelector(`.${orderContainerClassName}`);
    if (el) {
      el.remove();
    }

    // if (responseData.success) {
    //   createPopupNotification('Order placed successfully!');
    // } else {
    //   createPopupNotification('Something went wrong! Failed to place the order.', '#ff3a3a');
    // }

    browser.runtime.sendMessage({ ...getPriceEstimatePayloadObj, requestedByURL }, (r) => {
      if (browser.runtime.lastError) {
        return;
      }
    });
  }

  // when order download data is received
  if (request?.type === 'ppaOrderDownloadData' && request?.data !== null) {
    const responseData = request.data.data;
    if (responseData.status === 'READY' && responseData.pdfUrl) {
      window.open(responseData.pdfUrl, '_blank');
    }
  }
});

// creates the main shadow dom element and injects the css
function createShadowDomAndInjectCSS() {
  if (document.querySelector('.myloft-shadow-main')) {
    return;
  }

  const container = document.createElement('div');
  container.className = 'myloft-shadow-main';
  document.body.appendChild(container);

  shadowRoot = container.attachShadow({ mode: 'open' });

  const styleSheet0 = document.createElement('link');
  styleSheet0.rel = 'stylesheet';
  styleSheet0.href = 'https://fonts.googleapis.com/css?family=Mulish';
  shadowRoot.appendChild(styleSheet0);

  const styleSheet = document.createElement('link');
  styleSheet.rel = 'stylesheet';
  styleSheet.href = browser.runtime.getURL('../../src/content/findDoi.css');

  shadowRoot.appendChild(styleSheet);
}

// build & inject order section in the bottom
function injectOrderSection() {
  const orderContainer = document.createElement('div');
  orderContainer.className = orderContainerClassName;

  const orderImage = document.createElement('img');
  orderImage.src = browser.runtime.getURL('../../assets/ppa-myloft.png');
  orderImage.alt = 'Place order via MyLOFT';
  orderImage.className = 'myloft-order-header-image';

  const orderButton = document.createElement('button');
  orderButton.className = 'myloft-order-button';
  if (priceEstimateData?.ppaOrderId) {
    orderButton.textContent = 'View Order';
  } else if (requestItem) {
    orderButton.textContent = 'Request';
  } else {
    orderButton.textContent = 'Order';
  }

  orderButton.addEventListener("click", function () {
    onOrderClick(false)
  });

  const closeButton = document.createElement('button');
  closeButton.className = 'myloft-close-button';
  closeButton.innerHTML = `
  <svg width="22" height="22" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M12.3536 4.35355C12.5488 4.15829 12.5488 3.84171 12.3536 3.64645C12.1583 3.45118 11.8417 3.45118 11.6464 3.64645L8 7.29289L4.35355 3.64645C4.15829 3.45118 3.84171 3.45118 3.64645 3.64645C3.45118 3.84171 3.45118 4.15829 3.64645 4.35355L7.29289 8L3.64645 11.6464C3.45118 11.8417 3.45118 12.1583 3.64645 12.3536C3.84171 12.5488 4.15829 12.5488 4.35355 12.3536L8 8.70711L11.6464 12.3536C11.8417 12.5488 12.1583 12.5488 12.3536 12.3536C12.5488 12.1583 12.5488 11.8417 12.3536 11.6464L8.70711 8L12.3536 4.35355Z" fill="#363D4D"/>
  </svg>
  `;

  closeButton.addEventListener("click", function () {
    orderContainer.remove();
    injectSideIconForOrder();
  })
  orderContainer.appendChild(orderImage);
  orderContainer.appendChild(orderButton);
  orderContainer.appendChild(closeButton);

  shadowRoot.appendChild(orderContainer)
}

// injects the order details section to the web page
function injectOrderDetails() {
  const detailContainer = document.createElement('div');
  detailContainer.className = orderDetailContainerClassName;

  const blurBackground = document.createElement('div');
  blurBackground.className = 'myloft-order-detail-blur-bg';

  const formHtml = createOrderForm();

  detailContainer.appendChild(blurBackground);
  detailContainer.appendChild(formHtml);

  shadowRoot.appendChild(detailContainer);
}

// removes the order details form + resets selected intended use Id
function removeInjectOrderDetails() {
  const el = shadowRoot.querySelector(`.${orderDetailContainerClassName}`);
  if (el) {
    el.remove()
  }
  selectedIntendedUseId = null;
}

// builds the journal details form
function buildHeaderForForm() {
  const data = ppaFoundData.crossRefData;

  const headerWrapper = document.createElement('div');
  headerWrapper.className = "myloft-order-header-wrapper";

  const title = document.createElement("h2");
  title.innerText = data.title[0];
  title.className = "myloft-order-title";
  headerWrapper.appendChild(title);

  let authorsStr = data?.author?.map((x) => (`${x.given} ${x.family}`))?.join(', ');
  if (authorsStr && authorsStr?.length > 200) {
    authorsStr = authorsStr.slice(0, 180) + '...';
  }

  const journalDetailObj = {
    Journal: data?.['container-title']?.at(0),
    Publisher: data?.publisher,
    'Issue year': data.issued?.dateParts?.at(0),
    ISSN: data?.['ISSN']?.join(','),
    DOI: data['DOI'],
    'Page(s)': data?.page,
    Volume: data?.volume,
    Authors: authorsStr,
  }

  const journalDetails = document.createElement("div");
  journalDetails.className = "myloft-order-journal-details";
  let journalHtml = '';
  for (const [key, value] of Object.entries(journalDetailObj)) {
    if (value) {
      journalHtml += `<p><strong>${key}:</strong> ${value}</p>\n`
    }
  }
  journalDetails.innerHTML = journalHtml;
  headerWrapper.appendChild(journalDetails);

  return headerWrapper;
}

// builds the intended use form
function buildIntendedUseForForm() {
  const data = ppaFoundData.ppa;

  const intendedUseWrapper = document.createElement('div');
  intendedUseWrapper.className = "myloft-order-buy-wrapper";

  const title1 = document.createElement("h2");
  title1.innerText = "Article Intended Use:";
  title1.className = "myloft-buy-title";

  const hrSection1 = document.createElement('hr');
  hrSection1.className = 'myloft-order-hr';

  if (priceEstimateData.ppaOrderId) {
    if (Number.isInteger(priceEstimateData.intendedUseId) && data.orderConfig.intended_use) {
      const d = data.orderConfig.intended_use.find((x) => x.id === priceEstimateData.intendedUseId);
      if (d) {
        const useUl = document.createElement('ul');
        useUl.className = 'myloft-order-placed-indented-use'
        const useLi = document.createElement('li');
        useLi.innerHTML = `<strong>${d.title}</strong>`;

        const desc = document.createElement('p');
        desc.innerText = d.onSelectedDescription || d.description;

        useUl.appendChild(useLi);
        useUl.appendChild(desc);

        intendedUseWrapper.appendChild(title1);
        intendedUseWrapper.appendChild(useUl);
        if (feeAmount) {
          intendedUseWrapper.appendChild(hrSection1);
        }
      }
    }
  } else {
    let formSection;

    if (data?.orderConfig?.intended_use?.length > 1) {
      const form = document.createElement('form');
      form.className = 'myloft-buy-form';

      data.orderConfig.intended_use.forEach((item, index) => {
        const wrapperDiv = document.createElement('div');
        wrapperDiv.id = `myloft-form-item-wrapper-${index}`
        wrapperDiv.className = 'myloft-form-item-wrapper';

        const itemDiv = document.createElement('div');
        itemDiv.className = 'myloft-form-item';

        const label = document.createElement('label');
        label.innerText = item.title;
        label.htmlFor = item.id;

        const radioInput = document.createElement('input');
        radioInput.type = 'radio';
        radioInput.name = `title-${item.id}`;
        radioInput.id = item.id;
        radioInput.value = item.id;

        const descriptionDiv = document.createElement('p');
        descriptionDiv.className = 'myloft-form-item-desc myloft-hidden';
        descriptionDiv.id = `myloft-form-item-desc-${item.id}`;
        descriptionDiv.innerText = item.description;

        // mark the first one as selected
        if (index === 0) {
          radioInput.checked = true;
          descriptionDiv.classList.remove('myloft-hidden');
          descriptionDiv.classList.add('myloft-block');
          selectedIntendedUseId = radioInput.id
        }

        radioInput.addEventListener('click', () => {
          const radios = shadowRoot.querySelectorAll('.myloft-buy-form input[type="radio"]');
          const desc = shadowRoot.querySelectorAll('.myloft-form-item-desc');

          radios.forEach((radio) => {
            if (radio.id === radioInput.id) {
              radio.checked = true;
              selectedIntendedUseId = radio.id
            } else {
              radio.checked = false;
            }
          });

          desc.forEach((d) => {
            if (d.id === `myloft-form-item-desc-${selectedIntendedUseId}`) {
              d.classList.remove('myloft-hidden');
              d.classList.add('myloft-block');
            } else {
              d.classList.add('myloft-hidden');
              d.classList.remove('myloft-block');
            }
          });
        });

        itemDiv.appendChild(radioInput);
        itemDiv.appendChild(label);
        wrapperDiv.append(itemDiv)
        wrapperDiv.appendChild(descriptionDiv);
        form.appendChild(wrapperDiv);
      });

      formSection = form;
    } else {
      const d = data.orderConfig.intended_use.at(0);
      const useUl = document.createElement('ul');
      useUl.className = 'myloft-order-placed-indented-use'
      const useLi = document.createElement('li');
      useLi.innerHTML = `<strong>${d.title}</strong>`;

      const desc = document.createElement('p');
      desc.innerText = d.description;
      selectedIntendedUseId = d.id

      useUl.appendChild(useLi);
      useUl.appendChild(desc);
      formSection = useUl;
    }

    intendedUseWrapper.appendChild(title1);
    intendedUseWrapper.appendChild(formSection);
    if (feeAmount) {
      intendedUseWrapper.appendChild(hrSection1);
    }
  }

  return intendedUseWrapper;
}

const orderStateMap = {
  FAILED: "My Orders",
  SUCCESS: "Download",
  PENDING: "My Orders",
  REQUESTED: "My Orders",
};

// build main order form
function createOrderForm() {
  const wrapper = document.createElement('div');
  wrapper.className = 'myloft-order-detail-wrapper';

  const headerWrapper = buildHeaderForForm();

  const hrSection = document.createElement('hr');
  hrSection.className = 'myloft-order-hr';
  headerWrapper.appendChild(hrSection);

  const intendedUseWrapper = buildIntendedUseForForm();

  const footerWrapper = document.createElement('div');

  if (!priceEstimateData.ppaOrderId) {
    const title2 = document.createElement("h2");
    title2.innerText = "Article Fee:";
    title2.className = "myloft-buy-title";
    footerWrapper.appendChild(title2);

    const feeUl = document.createElement('ul');
    feeUl.className = 'myloft-article-buy-ul';
    const feeLi = document.createElement('li');
    if (!feeAmount) {
      feeLi.innerHTML = `<p><strong>Buy Article: Not Available</p>`
    } else {
      feeLi.innerHTML = `<p><strong>Buy Article:</strong> $${feeAmount}</p>`
    }
    feeUl.appendChild(feeLi);
    footerWrapper.appendChild(feeUl);

    if (requestItem) {
      const feeLi = document.createElement('li');
      feeLi.className = 'exceed-limit';
      feeLi.innerHTML = `<p><strong>Note:</strong> This article exceeds your approved purchase limit. You can request approval from your institution’s administrator to proceed with the order.</p>`;

      feeUl.appendChild(feeLi);
      footerWrapper.appendChild(feeUl);

      const requestDiv = document.createElement('div');
      requestDiv.className = 'request-container';

      const requestTitle = document.createElement('p');
      requestTitle.innerText = 'Purpose of Request';
      requestTitle.className = 'request-title';

      const MAX_LENGTH = 500;

      const requestInput = document.createElement('input');
      requestInput.type = 'text';
      requestInput.placeholder = 'Please describe why you need this article (max 500 characters)';
      requestInput.className = 'request-input';
      requestInput.id = requestReasonId;

      const charCountMessage = document.createElement('p');
      charCountMessage.className = 'max-text-size-warn'

      requestInput.addEventListener('input', (event) => {
        let inputValue = event.target.value;

        if (inputValue.length > MAX_LENGTH) {
          requestInput.value = inputValue.substring(0, MAX_LENGTH);
          charCountMessage.textContent = `Maximum limit of ${MAX_LENGTH} characters reached!`;
          charCountMessage.style.display = 'block';
          BuyBtn.disabled = true;
        } else {
          charCountMessage.style.display = 'none';
          BuyBtn.disabled = false;
        }

        requestReasonValue = requestInput.value;
      });

      requestDiv.appendChild(requestTitle);
      requestDiv.appendChild(requestInput);
      requestDiv.appendChild(charCountMessage);

      footerWrapper.appendChild(requestDiv);
    }
  }

  if (priceEstimateData.ppaOrderId) {
    const title3 = document.createElement("h2");
    title3.innerText = "Order Details:";
    title3.className = "myloft-buy-title";
    footerWrapper.appendChild(title3);

    const details = document.createElement("div");
    details.className = "myloft-order-status-details";

    const date = new Date(priceEstimateData.createdAt);
    const formattedDate = date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    let colorClass;
    let orderStateV;

    const { formSubmissionStatus, orderState } = priceEstimateData;
    switch (orderState) {
      case "FAILED":
        colorClass = "red-text";
        orderStateV = 'Failed';
        break;
      case "SUCCESS":
        colorClass = "green-text";
        orderStateV = 'Completed';
        break;
      case "PENDING":
        colorClass = "orange-text";
        orderStateV = 'Pending';
        break;
      default:
        colorClass = "";
    }

    let bottomPoint;

    if (formSubmissionStatus === 'PENDING' && orderState === 'REQUESTED') {
      colorClass = "orange-text";
      orderStateV = 'Pending for Approval';
      bottomPoint = `Your article request is awaiting approval from your institution’s administrator. Click "My Orders" to view the latest status.`;
    }

    if (formSubmissionStatus === 'APPROVED' && orderState === 'PENDING') {
      colorClass = "orange-text";
      orderStateV = 'Pending';
      bottomPoint = `Your article request has been approved, but download access is not yet available. Click "My Orders" to check the latest status.`;
    }

    if (formSubmissionStatus === 'APPROVED' && orderState === 'SUCCESS') {
      colorClass = "green-text";
      orderStateV = 'Completed';
      bottomPoint = `Your article request has been approved! Click the button below to download your article now.`;
    }

    let detailData = '';

    if (priceEstimateData.orderId) {
      detailData += `<p><strong>Order ID :</strong> ${priceEstimateData.orderId}</p>`
    }

    detailData += `<p><strong>Order Date :</strong> ${formattedDate}</p>`;
    if (priceEstimateData.requestReason && priceEstimateData.requestReason.length > 0) {
      detailData += `<p><strong>Order Justification :</strong> <span class="order-justification">${priceEstimateData.requestReason}</span></p>`;
    }
    detailData += `<p><strong>Status :</strong> <span class="bold-text ${colorClass}">${orderStateV} </span></p>`;

    details.innerHTML = detailData;
    footerWrapper.appendChild(details);

    if (bottomPoint) {
      const bp = document.createElement('p');
      bp.classList.add("bottom-text-for-request", colorClass);
      bp.textContent = bottomPoint;
      footerWrapper.appendChild(bp);
    }
  }

  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'myloft-order-form-btn-container';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'myloft-order-form-cancel-btn';
  cancelBtn.innerText = 'Cancel';
  cancelBtn.addEventListener('click', function () {
    removeInjectOrderDetails();
    controlElDisplay(orderContainerClassName, false);
  })

  BuyBtn = document.createElement('button');
  BuyBtn.className = 'myloft-order-form-buy-btn';
  if (priceEstimateData.ppaOrderId) {
    if (priceEstimateData.orderState === "SUCCESS") {
      BuyBtn.classList.add('green-background');
    }

    BuyBtn.innerText = orderStateMap[priceEstimateData.orderState] || "My Orders";
  } else if (requestItem) {
    BuyBtn.innerText = 'Request Article';
  } else {
    BuyBtn.innerText = 'Buy';
  }

  BuyBtn.addEventListener('click', function () {
    if (priceEstimateData.ppaOrderId) {
      if (priceEstimateData.orderState === "SUCCESS") {
        browser.runtime.sendMessage({ ppaOrderDownload: { ppaConfigId: tempPpaFoundData.data.ppa.id, ppaOrderId: priceEstimateData.ppaOrderId, requestedByURL } }, (r) => {
          if (browser.runtime.lastError) {
            return;
          }
        })
      } else {
        openMyOrdersInMyLoft()
      }
    } else {
      if (!selectedIntendedUseId) {
        // createPopupNotification('Please select an intended use for the following article.', '#ff3a3a')
      } else {
        placeOrderPPA()
      }
    }
  })

  buttonContainer.appendChild(cancelBtn);
  buttonContainer.appendChild(BuyBtn);

  footerWrapper.appendChild(buttonContainer);

  wrapper.appendChild(headerWrapper);
  wrapper.appendChild(intendedUseWrapper);
  wrapper.appendChild(footerWrapper);

  return wrapper;
}

// inject order icon to the screen
function injectSideIconForOrder() {
  const main = document.createElement('div');
  main.className = `myloft-order-bubble-button-main`

  const button = document.createElement('div')
  button.className = 'myloft-order-bubble-button'

  const buttonInner = document.createElement('div')
  buttonInner.className = 'myloft-order-bubble-button-inner'
  const buttonGif = browser.runtime.getURL('../../assets/ppa-order.gif');
  buttonInner.innerHTML = `<img src="${buttonGif}" id="hover-img" alt="Order" width="30" height="30" />`;
  button.appendChild(buttonInner);
  button.addEventListener('click', function () {
    openedByIcon = true;
    if (shadowRoot.querySelector(`.${orderDetailContainerClassName}`)) {
      removeInjectOrderDetails();
    } else {
      onOrderClick(true);
    }
  })
  main.appendChild(button);

  shadowRoot.append(main);
}

// pop up notification
// function createPopupNotification(message, backgroundColor = null) {
//   const prevNotification = shadowRoot.querySelector('.myloft-popup-notification');
//   if (prevNotification) {
//     prevNotification.remove();
//   }

//   const notificationDiv = document.createElement('div');
//   notificationDiv.id = 'myloft-popup-notification';
//   notificationDiv.className = 'myloft-popup-notification';
//   if (backgroundColor) {
//     notificationDiv.style.backgroundColor = backgroundColor;
//   }
//   notificationDiv.innerText = message;

//   shadowRoot.appendChild(notificationDiv);

//   setTimeout(() => {
//     const popup = shadowRoot.querySelector('.myloft-popup-notification');
//     if (popup) {
//       popup.remove();
//     }
//   }, 3000);
// }

// controls elements display
function controlElDisplay(elName, hide) {
  const el = shadowRoot.querySelector(`.${elName}`);
  if (!el) {
    return;
  }

  if (hide) {
    el.style.display = 'none';
  } else {
    el.style.display = 'flex';
  }
}

// on order click
function onOrderClick(fromOrderBubbleButton) {
  if (!fromOrderBubbleButton) {
    controlElDisplay(orderContainerClassName, true);
  }

  injectOrderDetails();
}

// place order fn
function placeOrderPPA() {
  try {
    const orderBtn = shadowRoot.querySelector('.myloft-order-form-buy-btn');
    const spinner = document.createElement('div');
    spinner.className = 'myloft-order-btn-spinner';

    orderBtn.innerText = '';
    orderBtn.prepend(spinner);
    orderBtn.disabled = true;

    const ppaConfigId = ppaFoundData.ppa.id;
    const placeOrderInput = {};
    const articleDetails = ppaFoundData.crossRefData;

    if (articleDetails.title[0]) {
      placeOrderInput.title = articleDetails.title[0];
    }

    if (articleDetails['container-title'][0]) {
      placeOrderInput.biblioTitle = articleDetails['container-title'][0];
    }

    placeOrderInput.doi = doi;
    placeOrderInput.estimatedPrice = Number(feeAmount);
    placeOrderInput.intendedUseId = Number(selectedIntendedUseId);

    if (Object.keys(placeOrderInput).length !== 5 || !ppaConfigId || !articleDetails) {
      throw new Error('failed to build proper payload');
    }

    if (requestItem && requestReasonValue && requestReasonValue.length > 0) {
      placeOrderInput.requestReason = requestReasonValue;
    }

    browser.runtime.sendMessage({ ppaPlaceOrder: { ppaConfigId, placeOrderInput, articleDetails, requestedByURL } }, (r) => {
      if (browser.runtime.lastError) {
        return;
      }
    });
  } catch (error) {
    devLog('PPA place order failed: ', error);
    // createPopupNotification('Something went wrong! Failed to place an order.', '#ff3a3a');
  }
}

function getCrossRefPageDiff(pageString) {
  try {
    const parts = pageString.split('-');

    if (parts.length === 2) {
      let startPage = null;
      let endPage = null;

      // this may not be right
      if (pageString.startsWith('o')) {
        startPage = parseInt(parts[0].substring(1));
        endPage = parseInt(parts[1].substring(1));
      }

      if (!startPage && !endPage) {
        startPage = parseInt(parts[0]);
        endPage = parseInt(parts[1]);
      }

      // Calculate the difference, adding 1 to make it inclusive
      const pageCount = endPage - startPage + 1;

      return pageCount;
    } else if (parts.length === 1 && !isNaN(+parts[0])) {
      return 1;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

function getArticleFeeAmount(priceEstimate) {
  try {
    if (!priceEstimate) {
      return null;
    }

    if (priceEstimate.copyrightCharge === -1) {
      return null;
    }

    return (priceEstimate.copyrightCharge + priceEstimate.serviceCharge).toFixed(2);
  } catch (error) {
    return null;
  }
}

function openMyOrdersInMyLoft() {
  window.open('https://app.myloft.xyz/browse/my-orders', '_blank');
}

// -------------------------------- main -------------------------------- //

async function main() {
  if (!tempPpaFoundData) {
    return;
  }

  devLog("tempPpaFoundData", tempPpaFoundData);

  const doiPaths = tempPpaFoundData?.data?.searchConfig?.PPAInjectionConfig?.pathToDOI?.web;
  if (!doiPaths) {
    return;
  }

  let ppaInstituteConfig = tempPpaFoundData?.data?.searchConfig?.PPAInstituteConfig;
  if (!ppaInstituteConfig) {
    return;
  }

  ppaInstituteConfig = Object.keys(ppaInstituteConfig).at(0);

  // Setting globally. Used when we search the doc with regex for DOI.
  docAsStr = document.documentElement.innerHTML;

  let doiFound = getFirstMatchFromXPaths(doiPaths);
  if (isValidDOI(doiFound)) {
    doi = doiFound;
  }

  if (!doi) {
    devLog("doi not found");
    return;
  }

  if (ppaInstituteConfig.startsWith('REQUEST')) {
    let ranCheck = false;
    let valid = false;
    const detect = tempPpaFoundData?.data?.searchConfig?.PPAInjectionConfig?.detect;
    if (!detect) {
      return;
    }

    const byClass = detect?.class;
    if (byClass) {
      ranCheck = true;
      const q = document.querySelector(byClass);
      if (q) {
        valid = true;
      }
    }

    const byXPath = detect?.xPath;
    if (byXPath) {
      ranCheck = true;
      const r = document.evaluate(
        byXPath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );

      const node = r?.singleNodeValue;
      if (node) {
        valid = true;
      }
    }

    if (!ranCheck || !valid) {
      return;
    }
  }

  const removeEls = tempPpaFoundData?.data?.searchConfig?.PPAInjectionConfig?.web?.deleteElement;
  if (removeEls) {
    deleteByXPaths(removeEls);
  }

  browser.runtime.sendMessage({ ppaDoi: doi, requestedByURL }, (r) => {
    if (browser.runtime.lastError) {
      return;
    }
  });
}

(async () => {
  if (document.contentType && document.contentType.toLowerCase() == "text/xml") {
    return;
  }

  tempPpaFoundData = await getLocalStorageValue('tempPpaFound');
  let executionDelay = 200;  // in ms

  // for SPA
  const longDelayHosts = [];

  if (longDelayHosts.includes(myHost)) {
    executionDelay = 3000;
  }

  setTimeout(main, executionDelay);
})();
