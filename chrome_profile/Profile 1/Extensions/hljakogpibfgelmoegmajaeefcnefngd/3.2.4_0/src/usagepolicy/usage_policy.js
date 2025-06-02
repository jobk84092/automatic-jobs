var apiURL = 'https://api.myloft.xyz/';
var reportingapiURL = 'https://reporting.myloft.xyz/';
var appURL = 'https://app.myloft.xyz/';


window.onload = async function () {
    var currentToken = await getFromLocalStorage('token')
    if (currentToken) {
        //get usage policy now
        winloadmiddleware()
    } else {

    }
}


async function winloadmiddleware() {

    //get my usage policy data and check institute usage policy date

    var querydata = JSON.stringify({ "query": "query{getUserProfile{data{email institute{usagePolicyDate instituteName usagePolicy} usagePolicyAcceptDate} success msg msgId}}" })

    var userData = await simpleFetchQueryUsagePolicy(querydata, true, 'getUserProfile');

    if (userData) {
        if (userData['success']) {

            var tempUserData = userData['data'];
            var tempInstituteData = tempUserData['institute'];

            var userPolicyDate = tempUserData['usagePolicyAcceptDate'];
            var institutePolicyDate = tempInstituteData['usagePolicyDate'];
            var institutePolicy = tempInstituteData['usagePolicy'];
            var instituteName = tempInstituteData['instituteName'];
            var cleanHTML = DOMPurify.sanitize(institutePolicy, { SAFE_FOR_JQUERY: true });
            if (!userPolicyDate || (userPolicyDate && (new Date(userPolicyDate).getTime() < new Date(institutePolicyDate).getTime()))) {
                //show policy and ask user to accept it.
                document.getElementById('policy-not-accepted').style.display = "block";
                $('.ui.fullscreen.modal')
                    .modal({
                        closable: false,
                        onDeny: function () {
                            //please accept the usage policy to access subscribed content
                            var opt = {
                                iconUrl: '../../icon.png',
                                title: chrome.i18n.getMessage('usage_policy_declined'),
                                type: 'basic',
                                message: chrome.i18n.getMessage('usage_policy_reject')
                            }
                            chrome.notifications.create('', opt)
                            return false;
                            // window.location.reload();
                        },
                        onApprove: async function () {
                            //update policy date
                            var data = await updatePolicyDate();
                            if (data) {
                                //policy accepted.
                                document.getElementById('main-policy').style.display = "block";
                                document.getElementById('policy-already-accepted').style.display = "block";
                                document.getElementById('policy-institute-name').innerText = instituteName + ' Library Team';
                                //send msg to background to get the proxy settings again
                                sendMessagetoBg()
                            } else {
                                var opt = {
                                    iconUrl: '../../icon.png',
                                    title: chrome.i18n.getMessage('something_went_wrong'),
                                    type: 'basic',
                                    message: chrome.i18n.getMessage('please_try_again')
                                }
                                chrome.notifications.create('', opt)
                                window.location.reload();
                            }
                        }
                    })
                    .modal('show');
                $('#usage-policy-text').html(cleanHTML);

            } else {
                //policy already accepted.
                document.getElementById('main-policy').style.display = "block";
                document.getElementById('policy-already-accepted').style.display = "block";
                document.getElementById('policy-institute-name').innerText = instituteName + ' Library Team';
            }
        }
    }

}


//send message to background

async function sendMessagetoBg() {
    chrome.runtime.sendMessage({ getDomainsListing: true })
}


async function updatePolicyDate() {
    var variables = {
        "input": {
            "usagePolicyAcceptDate": new Date().toISOString()
        }
    }
    var queryData = JSON.stringify({
        "query": "mutation($input: UserUpdateInput!){editUserProfile(updateInput:$input){msgId msg success} }", "variables": variables
    });
    var policyResponseData = await simpleFetchQueryUsagePolicy(queryData, true, 'editUserProfile');
    if (policyResponseData.success) {
        //request success
        return true;
    } else {
        // request fail
        return false;
    }
}



//one function for all http fetch queries
async function simpleFetchQueryUsagePolicy(queryData, withAuth, queryName) {
    var localTempData = queryData;
    var localAuthStatus = withAuth;
    var localQueryName = queryName;
    var url = apiURL;
    var deviceId = await getFromLocalStorage('deviceId');
    try {
        var settings = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-DeviceID': deviceId,
                'X-Device': 'CHROMEEXTENSION'
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

        if (data['data'][queryName]['msgId'] == "INVALIDTOKEN") {
            //refresh token first as msg received from server says invalid token
            var refreshTokenNow = await refreshPolicyToken();
            if (refreshTokenNow['success']) {
                var reData = await simpleFetchQueryUsagePolicy(localTempData, localAuthStatus, localQueryName);
                return reData;
            } else {
                return { 'success': false, 'msgId': "FAILEDREQ" }
            }
        } else {
            return data['data'][queryName];
        }
    } catch (err) {
        return { 'success': false, 'msgId': "FAILEDREQ" }
    }
}


async function refreshPolicyToken() {
    // function to refresh the current token when it has expired
    const { globalRefreshTokenProcess } = await chrome.storage.session.get('globalRefreshTokenProcess') || {};    
    if (!globalRefreshTokenProcess) {
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
            var data = await simpleFetchQueryUsagePolicy(queryData, true, 'refreshToken');
            if (data.success) {
                if (data.token) {
                    chrome.storage.local.set({ "token": data.token });
                }
                await chrome.storage.session.set({ 'globalRefreshTokenProcess': false });
                return { 'success': true }
            } else {
                if (data.msgId) {
                    if (data.msgId == "FAILEDREQ") {
                        await chrome.storage.session.set({ 'globalRefreshTokenProcess': false });
                        return { 'success': false }
                    }
                }
                if (!data.token) {
                    chrome.storage.local.clear();
                    clearProxySettings()
                    await chrome.storage.session.set({ 'globalRefreshTokenProcess': false });
                    return { 'success': false }
                }
                await chrome.storage.session.set({ 'globalRefreshTokenProcess': false });
                return { 'success': false }
            }
        } catch (error) {
            await chrome.storage.session.set({ 'globalRefreshTokenProcess': false });
            return { 'success': false }
        }

    } else {
        await waitUntil(() => {
            return chrome.storage.session.get(["globalRefreshTokenProcess"]).then((result) => {
                return result;
            });
        });

        return { 'success': true };
    }
}

function waitUntil(conditionFn, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();

        function checkCondition() {
            conditionFn()
                .then(result => {
                    if (!result || !result.globalRefreshTokenProcess) {
                        resolve();
                    } else if (Date.now() - startTime >= timeout) {
                        resolve();
                    } else {
                        setTimeout(checkCondition, 300);
                    }
                })
                .catch(error => {
                    resolve();
                });
        }

        checkCondition();
    });
}


//clear proxy settings

function clearProxySettings() {
    chrome.proxy.settings.clear({ scope: 'regular' },
        function (data) {
            return { 'success': true }
        }
    );
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