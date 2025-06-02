const dynamicValues = {
    //new tab mapper JSON initiate
    newTabMapJSON: {},
    // initate current and prev tab variables
    previousTabId: 0,
    previousUrl: "",
    currentTabId: 0,
    currentUrl: "",
    //global flag to check on and off campus
    isOnCampus: false,
    // initiate institute hostname
    instituteHostname: "",
    //initiate institute ip addd
    instituteIpAddress: "",
    //initiate institute proxy port
    instituteProxyPort: null,
    // intiate list of all user tags
    allTagsofUser: [],
    // intiate list of all user collections
    allCollectionsofUser: [],
    // intiate the variable for checking the state of refreshtoken process
    globalRefreshTokenProcess: false,
    pdfArray: [],
    firstLoad: false,
    disableExtList: JSON.stringify({ saveDisableList: [] }),
    eresource_domains: []
};

export const setValueInChromeStrorage = (async () => {
    /** protects the variables form the reset when service worker is re-loaded */
    let items = await chrome.storage.local.get(null);//get all
    const promise = [];
    Object.keys(dynamicValues).find(async key => {
        if (!Object.keys(items).includes(key)) {// set only required
            promise.push(await chrome.storage.local.set({ [key]: dynamicValues[key] }));
        }
    })
    return  Promise.all(promise);
});

export const resetValuesInChromeStorage = (async () => {
    const promise = [];
    Object.keys(dynamicValues).forEach(async key => {
        promise.push(await chrome.storage.local.set({ [key]: dynamicValues[key] }));
    })
    return Promise.all(promise);
});

export const generateCustomUUID = () => {
  let d = new Date().getTime();
  const uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });

  return uuid;
};

// DOMAIN RULES 

/**
 * match url against domain rule patterns
 *
 * @export
 * @param {Array<string>} urlPatterns
 * @param {string} urlToCheck
 * @returns {{ pattern: string | null; match: boolean; }}
 */
export function matchUrlForDomainRule(urlPatterns, urlToCheck) {
  try {
    for (const pattern of urlPatterns) {
      if (validateCustomUrl(pattern, urlToCheck)) {
        return { pattern, match: true };
      }
    }
    return { pattern: null, match: false };
  } catch (error) {
    return { pattern: null, match: false };
  }
}

/**
 * break down domain into parts
 *
 * @param {string} domain
 * @returns {({ subDomain?: string | undefined; secondLevelDomain: string; topLevelDomain: string; })}
 */
function breakDomain(domain) {
  const domainProp = domain.split('.');

  if (domainProp.length > 2) {
    return {
      subDomain: domainProp[0],
      secondLevelDomain: domainProp[1],
      topLevelDomain: domainProp[2],
    };
  }

  return {
    secondLevelDomain: domainProp[0],
    topLevelDomain: domainProp[1],
  };
}


/**
 * validate a domain rule url pattern with an url
 * 
 * @param {string} patternToCheck
 * @param {string} url
 * @returns {boolean}
 */
function validateCustomUrl(patternToCheck, url) {
  if (url.endsWith('/')) {
    url = url.slice(0, url.length - 1);
  }

  if (patternToCheck.endsWith('/')) {
    patternToCheck = patternToCheck.slice(0, patternToCheck.length - 1);
  }

  const patternParts = patternToCheck.trim().split('/');
  patternParts.splice(1, 1);

  const urlParts = url.trim().split('/');
  urlParts.splice(1, 1);

  if (patternParts.length >= 2 && urlParts.length >= 2) {
    const [patternProtocol, patternDomain, ...patternPathParts] = patternParts;
    const [protocol, domain, ...pathParts] = urlParts;

    const patternPath = patternPathParts.join('/');
    const urlPath = pathParts.join('/');

    if (patternProtocol !== '*:' && patternProtocol !== protocol) {
      return false;
    }

    const brokenPatternDomain = breakDomain(patternDomain);
    const brokenUrlDomain = breakDomain(domain);

    if (Object.keys(brokenPatternDomain).length !== Object.keys(brokenUrlDomain).length) {
      return false;
    }

    if (brokenPatternDomain.subDomain && brokenPatternDomain.subDomain !== '*') {
      if (brokenPatternDomain.subDomain !== brokenUrlDomain.subDomain) {
        return false;
      }
    }

    if (brokenPatternDomain.secondLevelDomain !== brokenUrlDomain.secondLevelDomain) {
      return false;
    }

    if (brokenPatternDomain.topLevelDomain !== brokenUrlDomain.topLevelDomain) {
      return false;
    }

    if (patternPath && patternPath.includes('*')) {
      const findMatch = patternPath.split('*');

      if (!urlPath.startsWith(findMatch[0])) {
        return false;
      }
    } else if (patternPath !== urlPath) {
      return false;
    }
  } else {
    return false;
  }

  return true;
}

//

/**
 * @typedef {Object} ChromeLocalStorageItem
 * @property {string} key - The key of the item to store.
 * @property {T} value - The value of the item to store.
 *
 * @template T
 */

/**
 * A helper class to use local storage and store things.
 * You can use different types of stores with compatible 
 * APIs by passing a storageEngine.
 *
 * @export
 * @class ChromeStorageLocal
 * @constructor
 * @template T
 *
 * @param {ChromeLocalStorageItem<T>} item The item to store.
 */
export class ChromeLocalStorage {
  constructor(key, storageEngine) {
    this._key = key;
    let engine;
    
    if (storageEngine === 'session') {
      engine = chrome.storage.session;
    } else {
      engine = chrome.storage.local;
    }

    this._storage = engine
  }

  async exists() {
    const items = await this._storage.get(this._key);
    return items[this._key] !== undefined;
  }

  async append(value) {
    let existingValue = await this.get();
    if (Array.isArray(existingValue)) {
      existingValue.push(value);
    } else {
      existingValue = [value];
    }
    await this.set(existingValue);
    return true;
  }

  async removeItemUsingIndex(index) {
    let existingValue = await this.get();
    if (Array.isArray(existingValue) && index >= 0 && index <= existingValue.length) {
      existingValue.splice(index, 1);
      await this.set(existingValue);
    }
    return true;
  }

  async get() {
    const items = await this._storage.get(this._key);
    return items[this._key];
  }

  async set(value) {
    await this._storage.set({ [this._key]: value });
    return true;
  }

  async remove() {
    await this._storage.remove(this._key);
    return true;
  }
}

/**
 * Pem to array buffer
 *
 * @param {string} pem
 * @returns {Uint8Array}
 */
function pemToArrayBuffer(pem) {
  const b64 = pem.replace(/(-----(BEGIN|END) PUBLIC KEY-----|\s)/g, '');
  const binaryDerString = atob(b64);
  const binaryDer = new Uint8Array(binaryDerString.length);
  for (let i = 0; i < binaryDerString.length; i++) {
    binaryDer[i] = binaryDerString.charCodeAt(i);
  }
  return binaryDer.buffer;
}

/**
 * Encrypt data
 *
 * @export
 * @async
 * @param {string} plainText
 * @param {string} publicKeyPEM
 * @returns {Promise<string|null>}
 */
export async function encryptRSA(plainText, publicKeyPEM) {
  const publicKeyArrayBuffer = pemToArrayBuffer(publicKeyPEM);
  const publicKey = await crypto.subtle.importKey(
    'spki',
    publicKeyArrayBuffer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256'
    },
    true,
    ['encrypt']
  );

  const encoded = new TextEncoder().encode(plainText);
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP'
    },
    publicKey,
    encoded
  );

  // Convert the encrypted data to a Base64 string 
  const base64Encrypted = btoa(String.fromCharCode.apply(null, new Uint8Array(encrypted)));
  return base64Encrypted;
}