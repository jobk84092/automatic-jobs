/** used for only key word search analytics */
const currentUrl = document.location;

getFromLocalStorage('searchConfigs').then((searchEngines) => {
    if (searchEngines && searchEngines.length) {
        const currentSearchEngine = searchEngines.map(config => {
            if (config.searchURL.indexOf(currentUrl.hostname) > -1) {
                const url = new URL(config.searchURL);
                const urlObject = url.searchParams;
                let query;
                urlObject.forEach((value, key) => {
                    if (value == '{param}' && !query) {
                        query = key;
                    }
                })
                return { query: query, title: config.title }
            }
        }).find(config => !!config);
        if (currentSearchEngine && currentSearchEngine.query && currentSearchEngine.title) {
            const data = searchQuery(currentSearchEngine.query);
            if (data) {
                reportMessenger(data, currentSearchEngine.title);
            }
        }
    }
})

//function to get value of a key from local storage
function getFromLocalStorage(key) {
    return new Promise(function (resolve, reject) {
        chrome.storage.local.get(key, function (response) {
            resolve(response[key]);
            return;
        })
    });
}

function reportMessenger(keywordText, searchEngineText) {
    var sendobject = {
        keyword: keywordText,
        source: 'Browser',
        searchEngine: searchEngineText
    }
    chrome.runtime.sendMessage({ search_report: sendobject }, (response) => {
        if (chrome.runtime.lastError) {
            return;
        }
    });
}


function searchQuery(val) {
    try {
        let params = (new URL(document.location)).searchParams;
        let name = params.get(val);
        return name;
    } catch (error) {
        return null;
    }
}