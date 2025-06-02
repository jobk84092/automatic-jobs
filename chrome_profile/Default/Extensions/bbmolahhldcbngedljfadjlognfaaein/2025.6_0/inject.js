async function getInitOptions()
{
	var storageData = await chrome.storage.managed.get("initOptions");
	var initOptions = storageData.initOptions;
	if (!initOptions)
	{
		// No GPO's present, use the popup settings
		var systemClipboard = await chrome.storage.local.get(["systemClipboard"]);
		if (systemClipboard["systemClipboard"])
			initOptions = {clipboardMode:isSecureContext?'permission':'system'};
	}
	// Check if user is licensed
	const storage = await chrome.storage.local.get(['licenseData', 'licensed']);
	if (storage.licensed)
	{
		initOptions = initOptions || {};
		initOptions.licenseKey = storage.licenseData.initToken;
	}
	if (initOptions)
		initOptions = JSON.stringify(initOptions);
	return initOptions;
}
async function inject()
{
	var initOptions = await getInitOptions();
	// Add cheerpj.css
	var cssScript = document.createElement("link");
	cssScript.href = chrome.runtime.getURL("cheerpj/cheerpj.css");
	cssScript.type = "text/css";
	cssScript.rel = "stylesheet";
	cssScript.id = "cj3css";
	document.head.appendChild(cssScript);
	// Add loader.js
	var loaderScript = document.createElement("script");
	loaderScript.src = chrome.runtime.getURL("cheerpj/loader.js");
	loaderScript.id = "cj3loader";
	if (initOptions)
		loaderScript.setAttribute("data-options", initOptions);
	loaderScript.onload = function()
	{
		// We need to add init_applet.js after loader.js is loaded
		// to avoid the error that cj3AttachBodyObserver() is not a function
		var initScript = document.createElement("script");
		initScript.src = chrome.runtime.getURL("init_applet.js");
		document.head.appendChild(initScript);
	}
	document.head.appendChild(loaderScript);
}
inject();
