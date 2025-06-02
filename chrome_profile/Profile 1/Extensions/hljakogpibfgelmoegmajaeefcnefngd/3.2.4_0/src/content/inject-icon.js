const icon_url = 'https://cdn.myloft.xyz/search-engines/ml-icon.svg';

//add listener for sending response to recommendation eng

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {

    if (request.domainsList) {
        injectSearchIcons()
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

//access icon
async function injectSearchIcons() {
	Array.from(document.getElementsByClassName('myloft_access')).forEach((data) => { data.remove() });
	var domains = await getFromLocalStorage('eresource_domains');
	let proxy_domains_to_exclude = ['google.com', 'baidu.com', 'scholar.google.', 'cse.google.com']
	domains = domains.filter((data) => !proxy_domains_to_exclude.some((d) => data.includes(d)));
	var targetDomains = ['.google.', 'xueshu.baidu.com'];
	let mainUrlhost = document.location.hostname;

	var shouldGoAhead = false;
	targetDomains.forEach((aHost) => {
		if ((mainUrlhost.includes(aHost))) {
			shouldGoAhead = true;
		}
	});
	if (!shouldGoAhead) {
		return;
	}
	var googleArr = [];
	var domainNameWithDot = "";
	Array.from(document.links).forEach((e) => {
		if (e) {
			domainNameWithDot = "." + e.hostname;
			domains.forEach((aDomain) => {
				aDomain = "." + aDomain;
				if ((domainNameWithDot.includes(aDomain)) && domainNameWithDot.endsWith(aDomain)) {
					googleArr.push(e)
				}
			});
		}
	});
	googleArr.forEach((data) => {
		var t = document.createElement('div');
		t.className = 'myloft_access';
		t.style.display = 'inline';
		t.style.width = '24px';
		var imgHght = "24px";
		if (mainUrlhost.includes('cse.google.com')) {
			imgHght = "18px";
		}
		t.innerHTML = '<img height="' + imgHght + `" src="${icon_url}">`;
		data.appendChild(t);
	});
	googleArr.forEach((data) => {
		var url = data.querySelector('a');
		if (url) {
			var finalURL = url.getAttribute('href');
		}
	})
}
