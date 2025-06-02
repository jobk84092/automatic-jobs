var apiURL = 'https://api.myloft.xyz/';
var reportingapiURL = 'https://reporting.myloft.xyz/';
var appURL = 'https://app.myloft.xyz/';

var currentBrowser =  new UserAgent.UAParser(navigator.userAgent).getBrowser().name;
var defaultBrowserName = "CHROME_EXTENSION";
var platformName = "CHROMEEXTENSION";
var deviceName = "Chrome";
var uidGen = "CHROME_EXT_";
var globalRefreshTokenProcessMain = false;

if (currentBrowser && currentBrowser == "Edge") {
    defaultBrowserName = "MICROSOFTEDGE_EXTENSION";
    platformName = "MICROSOFTEDGEEXTENSION";
    deviceName = "Microsoft Edge";
    uidGen = "MICROSOFTEDGE_EXT_"
}


window.onload = async function () {
    document.getElementById('logout').addEventListener('click', logoutUser);
    // Initialize Semantic UI checkbox
    $('.ui.checkbox').checkbox();
    const toggleCheckbox = document.querySelector('.ui.toggle.checkbox');
    if (toggleCheckbox) {
        toggleCheckbox.addEventListener('change', toggleProxy);
    }
    var currentToken = await getFromLocalStorage('token');
    if (currentToken) {
        //get user profile now
        winloadmiddleware()
    } else {
        document.getElementById('login').style.display = "block";
        document.getElementById('login').addEventListener('click', loginUser);
    }
}

async function toggleProxy() {
    const proxyToggleContainer = document.getElementById('proxyToggleContainer');
    if (proxyToggleContainer.querySelector('input[type="checkbox"]').checked) {
        //turn on the proxy
        //request background service worker to fetch the proxy on the next call to set the proxy
        chrome.storage.local.set({ 'proxyStatusUser': true });
        sendMessagetoBg({ 'refreshProxy': true });
        //inform the user using a notification
        chromeNotification('MyLOFT Institute/Organization Proxy is now turned ON, Please wait for a few seconds.', "MyLOFT Proxy has been manually enabled");
    } else {
        //turn off the proxy
        chrome.storage.local.set({ 'proxyStatusUser': false });
        chromeNotification('MyLOFT Institute/Organization Proxy is now turned OFF.', "MyLOFT Proxy has been manually disabled");
        clearProxySettings();
    }
}

async function loginUser() {
    let deviceId =await getFromLocalStorage('deviceId');
    if (!deviceId || deviceId == 'null') {
        generateUUID().then((data) => {
            deviceId = data;
            chrome.storage.local.set({'deviceId': deviceId});
            chrome.tabs.create({ url: appURL + 'user/login?deviceId=' + deviceId });
        });

    }else{
        chrome.tabs.create({ url: appURL + 'user/login?deviceId=' + deviceId });
    }

}

async function winloadmiddleware() {
    document.getElementById('logout').style.display = "block";
    await getUserAccountProfile();

    const proxyToggleContainer = document.getElementById('proxyToggleContainer');
    const allowUserstoManage = await getLocalStorageValue('allowUserstoManage');

    if (allowUserstoManage && allowUserstoManage.allowUserstoManage) {
        chrome.proxy.settings.get({}, function (details) {
            if (details.levelOfControl === 'controlled_by_this_extension' && details.value.mode === 'pac_script') {
                proxyToggleContainer.querySelector('input[type="checkbox"]').checked = true;
            } else {
                proxyToggleContainer.querySelector('input[type="checkbox"]').checked = false;
            }
        });
        proxyToggleContainer.style.display = "block";
    }
}

async function getUserAccountProfile() {
    var querydata = JSON.stringify({ "query": "query{getUserProfile{data{email associatedAccount{firstName currentInstitute{instituteName}}} success msg msgId}}" })

    var userData = await simpleFetchQuery(querydata, true, 'getUserProfile');

    if (userData) {
        if (userData['success']) {
            //set name , email , institute
            document.getElementById('fullname').innerText = userData['data']['associatedAccount']['firstName'];
            document.getElementById('emailId').innerText = userData['data']['email'];
            if (userData['data']['associatedAccount']['currentInstitute']) {
                document.getElementById('currentInstitute').innerText = userData['data']['associatedAccount']['currentInstitute']['instituteName'];
            }
            return true;
        }
    }
    return false;
}

async function clearChromeLocalStorage() {
    const localData = await chrome.storage.local.get(null);
    const promise = [];
    Object.keys(localData).forEach(async key => {
        if (key.toLocaleLowerCase() !== 'deviceid') {
            promise.push(await chrome.storage.local.remove(key))
        }
    });
    const responses = await Promise.all(promise);
    return true;
}

async function logoutUser() {
    var querydata = JSON.stringify({ "query": "mutation{logout{msgId msg success}}" });
    var logoutData = await simpleFetchQuery(querydata, true, 'logout');

    document.getElementById('fullname').innerText = "";
    document.getElementById('emailId').innerText = "";
    document.getElementById('currentInstitute').innerText = "";
    document.getElementById('logout').style.display = "none"
    chromeNotification('Logout Success');
    logoutMiddleware();
}

async function logoutMiddleware() {
    await clearChromeLocalStorage();
    setMyLOFTIcon(false);
    clearProxySettings();
    sendMessagetoBg();
    document.getElementById('login').style.display = "block";
    document.getElementById('login').addEventListener('click', loginUser);
    document.getElementById('proxytoggle').style.display = "none";
}

function chromeNotification(passMessage, passTitle) {
    const title = passTitle ? passTitle : 'Logout';
    var opt = {
        iconUrl: '../../icon.png',
        title: title,
        type: 'basic',
        message: passMessage
    }
    chrome.notifications.create('', opt)
    return true;
}

//one function for all http fetch queries

async function simpleFetchQuery(queryData, withAuth, queryName) {
    var localTempData = queryData;
    var localAuthStatus = withAuth;
    var localQueryName = queryName;
    var url = apiURL
    var deviceId = await getFromLocalStorage('deviceId');
    try {
        var settings = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-DeviceID': deviceId,
                'X-Device': platformName
            },
            body: queryData
        };

        if (withAuth) {
            var token = await getFromLocalStorage('token');
            settings.headers['X-Authorization'] = token;
        }

        var data = await fetch(url, settings)
            .then(response => response.json())
            .then(json => {
                return json;
            })
            .catch(e => {
                return { 'success': false, 'msgId': "FAILEDREQ" }
            })

        if (queryName != 'refreshToken' && data['data'][queryName]['msgId'] == "INVALIDTOKEN") {
            //refresh token first as msg received from server says invalid token
            var refreshTokenNow = await refreshOptionsToken();
            if (refreshTokenNow['success']) {
                var reData = await simpleFetchQuery(localTempData, localAuthStatus, localQueryName);
                return reData;
            } else {
                return { 'success': false, 'msgId': "FAILEDREQ" }
            }
        } else if (queryName != 'refreshToken') {
            return data['data'][queryName];
        } else if (queryName == 'refreshToken' && data['data'][queryName]['token']) {
            return data['data'][queryName];
        } else {
            return { 'success': false, token: null }
        }
    } catch (err) {
        return { 'success': false, 'msgId': "FAILEDREQ" }
    }
}

//Refresh Token Function
let TOKEN_QUEUE = [];

async function resolveTokenRefreshQueue(withSuccess) {
    if (TOKEN_QUEUE?.length > 0) {
        for (let i = 0; i < TOKEN_QUEUE.length; i++) {
            TOKEN_QUEUE[i].resolve({ 'success': withSuccess });
        }

        TOKEN_QUEUE = []
    }
}

async function refreshOptionsToken() {
    // function to refresh the current token when it has expired
    if (!globalRefreshTokenProcessMain) {
        globalRefreshTokenProcessMain = true;
        await chrome.storage.session.set({ 'globalRefreshTokenProcess': true });
        var queryData = JSON.stringify({
            query: `mutation{
                        refreshToken{
                            token
                            success
                            msg
                            msgId
                        }
                    }`
        });
        try {
            var data = await simpleFetchQuery(queryData, true, 'refreshToken');
            if (data.success) {
                if (data.token) {
                    chrome.storage.local.set({ 'token': data.token });
                }
                globalRefreshTokenProcessMain = false;
                await resolveTokenRefreshQueue(true);
                return { 'success': true }
            } else {
                if (data.msgId) {
                    if (data.msgId == "FAILEDREQ") {
                        globalRefreshTokenProcessMain = false;
                        await resolveTokenRefreshQueue(false);
                        return { 'success': false };
                    }
                }
                if (!data.token) {
                    logoutMiddleware();
                    globalRefreshTokenProcessMain = false;
                    await resolveTokenRefreshQueue(false);
                    return { 'success': false };
                }
                globalRefreshTokenProcessMain = false;
                await resolveTokenRefreshQueue(false);
                return { 'success': false };
            }
        } catch (error) {
            globalRefreshTokenProcessMain = false;
            await resolveTokenRefreshQueue(false);
            return { 'success': false };
        }
    } else {
        return new Promise((resolve, reject) => {
            TOKEN_QUEUE.push({ resolve, reject });
        });
    }
}

//function to generate a random UUID
function generateUUID() {
    return new Promise((resolve, reject) => {
        FingerprintJS.load().then(fp => fp.get()).then((data) => {
            const tokenData = data.visitorId;
            if (!tokenData) {
                let d = new Date().getTime();
                const uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                    const r = (d + Math.random() * 16) % 16 | 0;
                    d = Math.floor(d / 16);
                    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
                });
                resolve(uidGen + uuid);
            }
            resolve(uidGen + tokenData);
        })
    });
};

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    if (request.loginSuccess) {
        //update options tabs
        const token  = await getFromLocalStorage('token');
        if (token) {
            document.getElementById('login').style.display = "none";
            winloadmiddleware();
        }
    }
});

//send message to background

async function sendMessagetoBg(customMessage) {
    let message = customMessage ? customMessage : { logoutFromOptions: true };
    chrome.runtime.sendMessage(message)
}

//clear proxy settings

function clearProxySettings() {
    chrome.proxy.settings.clear({ scope: 'regular' },
        function (data) {
            return { 'success': true }
        }
    );
}

//implementing localization in html

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


//function to set the icon to show login status

function setMyLOFTIcon(isLoggedIn) {
    if (isLoggedIn) {
        chrome.action.setIcon({
            path: {
                "16": "./../../icons/icon16.png",
                "19": "./../../icons/icon19.png",
                "48": "./../../icons/icon48.png",
                "128": "./../../icons/icon128.png"
            }
        });
    } else {
        chrome.action.setIcon({
            path: {
                "16": "./../../icons/icon_myloftbw16.png",
                "19": "./../../icons/icon_myloftbw19.png",
                "48": "./../../icons/icon_myloftbw48.png",
                "128": "./../../icons/icon_myloftbw128.png"
            }
        });
    }
}


//function to get value of a key from local storage
function getFromLocalStorage(key) {
    return new Promise(function (resolve, reject) {
        chrome.storage.local.get(key, function (response) {
            resolve(response[key]);
            return;
        })
    });

}

async function getLocalStorageValue(key) {
    try {
        const data = await chrome.storage.local.get(key); 
        return data   
    } catch (error) {
        return null
    }
}

//Dev: Vineet Deshpande
//Author : Eclat Engineering Pvt. Ltd.
//Copyright Eclat Engineering Pvt. Ltd.