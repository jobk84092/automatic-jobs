var apiURL = 'https://api.myloft.xyz/';
var reportingapiURL = 'https://reporting.myloft.xyz/';
var appURL = 'https://app.myloft.xyz/';


//global tag list var
var tagsList = []

//current article url

var currentArticleURL = "";


// current article tags 

let currentArticleTagsList = [];

// selected article collection

let selectedCollectionId = null;

let currentBrowser = new UserAgent.UAParser(navigator.userAgent).getBrowser().name;
let defaultBrowserName = "CHROME_EXTENSION";
let platformName = "CHROMEEXTENSION";
let deviceName = "Chrome";
let uidGen = "CHROME_EXT_";

if (currentBrowser && currentBrowser == "Edge") {
    defaultBrowserName = "MICROSOFTEDGE_EXTENSION";
    platformName = "MICROSOFTEDGEEXTENSION";
    deviceName = "Microsoft Edge";
    uidGen = "MICROSOFTEDGE_EXT_"
}

window.onload = async function () {
    //first check if user is authenticated or not , if not then redirect to login page.
    //do basic check with token from localStorage;
    const currentTokenTemp = await getLocalStorageValue('token');
    const currentToken = currentTokenTemp['token']
    const deviceIdTemp = await getLocalStorageValue('deviceId');
    const deviceId = deviceIdTemp['deviceId']
    if (currentToken && currentToken != undefined && currentToken.length > 0) {
        //close loading screen here
        $('#loading_myloft').addClass('hide');
        $('#myloft_popup_container').addClass('show');
        const currentTabData = await getCurrentTab();
        if (currentTabData.url) {
            //Check if URL is valid or Invalid of the Tab (to avoid chrome new page being saved)
            const url_check = is_url(currentTabData.url);
            if (url_check) {
                //set title of the page
                const myloft_title = document.getElementById('myloft_title');
                const page_title = await getandsetPageTitle(currentTabData);
                myloft_title.textContent = page_title;
                const decodedToken = parseJwt(currentToken);
                var currentTime = new Date().getTime();
                if (decodedToken['exp'] <= currentTime) {
                    //refresh token first and then other requests should follow;
                    await chrome.runtime.sendMessage({ refreshToken: true })
                }
                //Initiate Tag-Chips
                loadTags(currentTabData);
                //Initiate collections
                await loadCollections(currentTabData);
                document.getElementById('saveButton').addEventListener('click', function () { saveTagsandCollection(currentTabData) }, false);
                //Save HTML (Send to Background Script)
                saveHTML(currentTabData);
            } else {
                chrome.tabs.create({ url: appURL });
                window.close();
            }
        } else {
            chrome.tabs.create({ url: appURL });
            window.close();
        }
    }
    else {
        //request user to login;
        //send to webapp login page
        if (!deviceId || deviceId == 'null') {
            const data = await generateUUID()
            await setLocalStorageValue({ 'deviceId': data });
            $('#loading_myloft').addClass('hide');
            chrome.tabs.create({ url: appURL + 'user/login?deviceId=' + data });
        } else {
            $('#loading_myloft').addClass('hide');
            chrome.tabs.create({ url: appURL + 'user/login?deviceId=' + deviceId });
        }

    }
    document.getElementById('error').style.display = 'none';
}


//use to set collections of the user
async function loadCollections(data) {
    const whitelistCollections = await getFromLocalStorage('allCollectionsofUser');
    $('.ui.search').search({
        source: whitelistCollections, searchFields: ['title'], fullTextSearch: false, onSelect: (coldata) => {
            if (coldata['id']) {
                selectedCollectionId = coldata['id']
            }
        }
    });
}

function setPopupTitle(title) {
    $('#popup_title').text(title)
    return true;
}


//function to generate a random UUID
async function generateUUID() {
    const fp = await FingerprintJS.load();
    const data = await fp.get();
    let tokenData = data.visitorId
    if (!tokenData) {
        let d = new Date().getTime();
        const uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        
        return uidGen + uuid;
    }
    return uidGen + tokenData;
};


async function loadTags() {
    try {
        const ErrorText = document.getElementById('error');
        const inputElm = document.querySelector('input[name=tag_input]');

        //get tags of the user
        const all_tags = await getFromLocalStorage('allTagsofUser');
        // initialize Tagify on the above input node reference
        var tagify = new Tagify(inputElm, {
            position: "input",
            editTags: false,
            keepInvalidTags: false,
            maxTags: 10,
            pattern: /^.{2,32}$/,
            dropdown: {
                position: "text",
                classname: "tags-look",
                maxItems: 10,
                highlightFirst: true
            },
            whitelist: inputElm.value.trim().split(/\s*,\s*/) // Array of values. stackoverflow.com/a/43375571/104380
        })

        var mockAjax = (function mockAjax() {
            var timeout;
            return function (duration) {
                clearTimeout(timeout); // abort last request
                return new Promise((resolve, reject) => {
                    timeout = setTimeout(resolve, duration || 500, all_tags) // update with the default list
                })
            }
        })()

        // on character(s) added/removed (user is typing/deleting)
        function onInput(e) {
            let element = document.querySelectorAll('.tagify');
            const value = e.detail.value;

            if (e.detail.isValid === 'pattern mismatch') {
                if (element) {
                    element.forEach(ele => {
                        ele.style.borderWidth = '1px';
                        ele.style.borderStyle = 'solid';
                        ele.style.borderColor = '#ff0000';
                    });
                    ErrorText.style.display = 'block';
                }
            } else {
                if (element) {
                    element.forEach(ele => {
                        ele.style.borderWidth = '1px';
                        ele.style.borderStyle = 'solid';
                        ele.style.borderColor = '#ccc';
                    });
                    ErrorText.style.display = 'none';
                }
            }

            // only show the dropdown and search when the input char len is > 1
            if (value.length > 1) {
                tagify.whitelist = null; // reset current whitelist
                tagify.loading(true) // show the loader animation

                // get new whitelist from a delayed mocked request (Promise)
                mockAjax()
                    .then(function (result) {
                        tagify.settings.whitelist = result.concat(tagify.value) // add already-existing tags to the new whitelist array

                        tagify
                            .loading(false)
                            // render the suggestions dropdown.
                            .dropdown.show(e.detail.value);
                    })
                    .catch(err => tagify.dropdown.hide())
            }
        }

        // tag added callback
        function onAddTag(e) {
            currentArticleTagsList.push(e.detail.data.value);
            let element = document.querySelectorAll('.tagify');
            if (element) {
                element.forEach(ele => {
                    ele.style.borderWidth = '1px';
                    ele.style.borderStyle = 'solid';
                    ele.style.borderColor = '#ccc';
                });
                ErrorText.style.display = 'none';
            }
        }

        // tag removed callback
        function onRemoveTag(e) {
            currentArticleTagsList = tagify.value.map(tag => tag.value);
        }

        // tag invalid callback
        function onInvalidTag(e) {
            setTimeout(() => {
                let element = document.querySelectorAll('.tagify');
                if (element) {
                    element.forEach(ele => {
                        ele.style.borderWidth = '1px';
                        ele.style.borderStyle = 'solid';
                        ele.style.borderColor = '#ccc';
                    });
                    ErrorText.style.display = 'none';
                }
            }, 1500)
        }

        const parentComponent = document.getElementById('tagInput');
        const parentMarginBottom = parentComponent.style.marginBottom;

        function adjustParentMarginBottom(resultsCount) {
            const minMarginBottom = 20;
            const maxMarginBottom = 200;
            const resultMarginBottom = resultsCount * 20;
            const newMarginBottom = Math.min(maxMarginBottom, Math.max(minMarginBottom, resultMarginBottom));
            parentComponent.style.marginBottom = newMarginBottom + 'px';
        }

        function dropdownShow(e) {
            const el = document.getElementsByClassName('tagify__dropdown__item');
            adjustParentMarginBottom(el.length);
        }

        function dropdownHide(e) {
            parentComponent.style.marginBottom = parentMarginBottom;
        }

        // Chainable event listeners
        tagify.on('add', onAddTag)
            .on('remove', onRemoveTag)
            .on('input', onInput)
            .on('invalid', onInvalidTag)
            .on('dropdown:show', dropdownShow)
            .on('dropdown:hide', dropdownHide)

    } catch (error) {
        ;
    }
}

//function to decode a jwt token
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
};

//function to check if the url is valid or not
function is_url(string) {
    try {
        const url = new URL(string);
        // Check for a valid protocol (http or https)
        if (url.protocol !== "http:" && url.protocol !== "https:") {
            return false;
        }
        return true;
    } catch (_) {
        return false;
    }
}

(function () {

    window.addEventListener('load', function () {
        var needsTranslation = document.querySelectorAll("[data-i18n]"),
            t = chrome.i18n.getMessage;
        for (var i = 0, l = needsTranslation.length; i < l; i++) {
            if (needsTranslation[i]) {
                var element = needsTranslation[i],
                    targets = element.dataset.i18n.split(/\s*,\s*/);
                for (var j = 0, m = targets.length; j < m; j++) {
                    var parameters = targets[j].split(/\s*=\s*/);
                    if (parameters.length === 1 || parameters[0] === 'textContent') {
                        element.textContent = t(element.dataset.i18n);
                    }
                    else if (parameters[0] === 'innerHTML') {
                        element.innerHTML = t(element.dataset.i18n);
                    }
                    else {
                        element.setAttribute(parameters[0], t(parameters[1]));
                    }
                }
            }
        }
    });

}).call(this);

//function to get value of a key from local storage
function getFromLocalStorage(key) {
    return new Promise(function (resolve, reject) {
        chrome.storage.local.get(key, function (response) {
            resolve(response[key]);
            return;
        })
    });

}

//function to get value of key and update in local storage (only works for values that have json format)
function getAndUpdateInLocalStorage(key, value) {
    return new Promise(function (resolve, reject) {
        chrome.storage.local.get(key, async function (response) {
            let key_value = response[key];
            for (let i in value) {
                key_value[i] = value[i];
            }
            let article_init_json = {};
            article_init_json[key] = key_value;
            await setLocalStorageValue(article_init_json);
            resolve(true);
        })
    });

}

/** returns current tab info */
async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

/** gets and sets the title of the page */
async function getandsetPageTitle(tab) {
    try {
        if (tab.title) {
            return tab.title;
        } else {
            return "Title Not Found"
        }
    } catch (error) {
        return "Title Not Found"
    }
}

async function saveHTML(tab) {
    try {
        //Save Article URL base64 encoded string in local storage to track progress of article
        let encoded_url = btoa(tab.url);
        let article_init_json = {};
        article_init_json[encoded_url] = { 'status': 'INPROGRESS', 'ts': new Date().getTime() }
        await setLocalStorageValue(article_init_json);
        let tabId = tab.id;
        chrome.scripting.executeScript(
            {
                target: { tabId: tabId },
                files: [
                    '/src/bg/bundle_myloft.js'
                ],
            },
            () => { 
                chrome.scripting.executeScript(
                    {
                        target: { tabId: tabId },
                        files: [
                            '/src/content/reporting.js'
                        ],
                    },
                    () => {
                        
                        chrome.tabs.sendMessage(tabId, {
                            tabId:tabId, tabUrl: tab.url, report_url: tab.url, articleType: "HTML"
                        });
                    });
            });

    } catch (error) {

    }
}


async function saveTagsandCollection(tab_data) {
    try {
        //Send Tags and Collection to background
        let encoded_url = btoa(tab_data.url)
        if (currentArticleTagsList.length > 0 || selectedCollectionId) {
            if (currentArticleTagsList.length > 0) {
                const enTagUrl = encoded_url + '_TAGS';
                await setLocalStorageValue({ [enTagUrl]: JSON.stringify({ 'tagsList': currentArticleTagsList }) });
            }
            if (selectedCollectionId) {
                const enColUrl = encoded_url + "_COLLECTION"
                await setLocalStorageValue({ [enColUrl]: JSON.stringify({ 'collectionId': selectedCollectionId }) });
            }
            await chrome.runtime.sendMessage({ saveTags: { id: encoded_url, url: tab_data.url, tagsList: currentArticleTagsList, collectionId: selectedCollectionId } })
            window.close();
        } else {
            window.close();
        }
    } catch (error) {

        $('#myloft_popup_container').addClass('hide');
        //Clear global vars and close window
        setTimeout(function () {
            currentArticleTagsList = [];
            selectedCollectionId = null;
            window.close();
        }, 500)
    }
}

async function getLocalStorageValue(key) {
    try {
        const data = await chrome.storage.local.get(key); 
        return data   
    } catch (error) {
        return null
    }
}

async function setLocalStorageValue(object) {
    try {
        await chrome.storage.local.set(object);
        return true;
    } catch (error) {
        return false;
    }
}

//Dev: Vineet Deshpande
//Author : Eclat Engineering Pvt. Ltd.
//Copyright Eclat Engineering Pvt. Ltd.