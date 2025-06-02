const jsonContentType = /^application\/([\w!#$&.\-^+]+\+)?json($|;)/;
/**
 * Look for JSON if the content type is "application/json",
 * or "application/whatever+json" or "application/json; charset=utf-8"
 */
function isJSONContentType(contentType) {
    return jsonContentType.test(contentType);
}

function isRedirect(status) {
    return status >= 300 && status < 400;
}
function isEventJSON(event) {
    if (!event.responseHeaders ||
        event.type !== "main_frame" ||
        event.tabId === -1 ||
        isRedirect(event.statusCode)) {
        return undefined;
    }
    let contentTypeHeader = undefined;
    for (const header of event.responseHeaders) {
        if (header.name.toLowerCase() === "content-type") {
            if (header.value && isJSONContentType(header.value)) {
                // It's JSON, but it might be a Sharepoint page which is not actually
                // JSON. So save it, but don't return yet.
                contentTypeHeader = header;
            }
            else {
                // It's not JSON
                return undefined;
            }
        }
        else if (header.name.toLowerCase() === "microsoftsharepointteamservices") {
            // This is a Sharepoint page. Sharepoint's service worker will fetch JSON
            // page contents and turn it into HTML, but fails to change the
            // content-type of the response to be text/html. We must special case this
            // or else Sharepoint pages will be treated as JSON. See
            // https://github.com/bhollis/jsonview/issues/210
            return undefined;
        }
    }
    return contentTypeHeader;
}
// Install a message listener that listens for messages from the content script.
// The content script will ask if the page is JSON. We load our saved info and
// respond accordingly.
function installMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message !== "jsonview-is-json") {
            return;
        }
        if (!sender.url) {
            sendResponse(false);
            return;
        }
        if (sender.url.startsWith("file://") && sender.url.endsWith(".json")) {
            sendResponse(true);
            return;
        }
        hasJsonUrl(sender.url).then(sendResponse);
        return true; // this means "we're going to call sendResponse asynchronously"
    });
}
// Add a URL to the session storage. This is used to remember that we
// have seen a JSON page.
async function addJsonUrl(url) {
    await chrome.storage.session.set({ [url]: true });
}
// Check if we have a URL in the session storage. This is used to
// remember that we have seen a JSON page.
async function hasJsonUrl(url) {
    const stored = await chrome.storage.session.get(url);
    const present = url in stored;
    await chrome.storage.session.remove(url);
    return present;
}

/**
 * This is the background script that runs independent of any document. It
 * listens to main frame requests and records if the headers indicate the URL is
 * JSON. When the content script runs, it can ask this script if the page is
 * JSON, and if so, it will format the page.
 */
function detectJSON(event) {
    if (isEventJSON(event)) {
        addJsonUrl(event.url);
    }
    return { responseHeaders: event.responseHeaders };
}
// Listen for onHeaderReceived for the target page.
chrome.webRequest.onHeadersReceived.addListener(detectJSON, { urls: ["<all_urls>"], types: ["main_frame"] }, ["responseHeaders"]);
installMessageListener();
