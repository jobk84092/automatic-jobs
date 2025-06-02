var currentOrigin = null;
var currentTab = null;
async function changeSystemClipboard(e)
{
	var checkbox = e.target;
	let clipboardStorage = {};
	clipboardStorage["systemClipboard"] = checkbox.checked;
	chrome.storage.local.set(clipboardStorage);
}
async function enableAppletRunner(e)
{
	var enableExtension = e.target;
	if (enableExtension.checked && currentOrigin)
		await chrome.runtime.sendMessage({type: "enableOnTab", currentOrigin: currentOrigin, currentTab: currentTab});
	else if (!enableExtension.checked && currentOrigin)
		await chrome.runtime.sendMessage({type: "disableOnTab", currentOrigin: currentOrigin, currentTab: currentTab});
}
async function initSettings()
{
	const systemClipboard = await chrome.storage.local.get(["systemClipboard"]);
	var checkbox = document.getElementById("systemClipboard");
	checkbox.checked = systemClipboard["systemClipboard"] ? true : false;
}
async function initSlider()
{
	if (currentOrigin)
	{
		var granted = await chrome.permissions.contains({ origins: [currentOrigin] });
		var checkbox = document.getElementById("enableExtension");
		checkbox.checked = granted ? true : false;
	}
}
async function initLicense()
{
	const result = await chrome.storage.local.get(['licenseData', 'licensed']);
	const licenseData = result.licenseData || {};
	const isLicensed = result.licensed || false;

	if (isLicensed) {
		document.getElementById("licenseKeyContent").innerHTML = "Licensed to: <span style=\"font-weight: bold;\">" + licenseData.ownerName + "</span>";
		document.getElementById("infoContent").style.display = "none";
		document.getElementById("manageLicense").style.display = "block";
	} else {
		document.getElementById("licenseKeyContent").style.display = "none";
		document.getElementById("infoContent").style.display = "block";
		document.getElementById("manageLicense").style.display = "none";
	}
	document.getElementById("contactSales").addEventListener("click", () => {
		window.open("mailto:sales@leaningtech.com");
	});
}
// Get the current permission status for this origin
async function initPopup(tabs)
{
	initLicense();

	if(tabs[0].url.startsWith("file://"))
	{
		document.getElementById("fileurl").style.display = "inline-block";
		document.getElementById("appletSwitch").style.display = "none";
		return;
	}
	if(!tabs[0].url.startsWith("http://") && !tabs[0].url.startsWith("https://"))
		return;
	var url = new URL(tabs[0].url);
	currentOrigin = url.origin + "/*";
	currentTab = tabs[0];
	// Add Github issues query url and unset any existing searchParams from the applet url
	url.search = "";
	document.getElementById("githubLink").href = "https://github.com/leaningtech/cheerpj-applet-runner/issues/new?&title=Bug+report+for:+" + url.toString();
	// Init slider and settings
	initSlider();
	initSettings();
}
document.addEventListener("DOMContentLoaded", function()
{
	var manifestData = chrome.runtime.getManifest();
	if (manifestData.update_url)
	{
		document.getElementById("callToAction").style.display = "list-item";
		if (manifestData.update_url.includes("edge"))
			document.getElementById("reviewLink").href = "https://microsoftedge.microsoft.com/addons/detail/cheerpj-applet-runner/" + chrome.runtime.id;
		else
			document.getElementById("reviewLink").href = "https://chromewebstore.google.com/detail/cheerpj-applet-runner/" + chrome.runtime.id + "/reviews";
	}
	chrome.tabs.query({active:true, currentWindow: true}, initPopup);
	document.getElementById("systemClipboard").addEventListener("change", changeSystemClipboard);
	document.getElementById("enableExtension").addEventListener("change", enableAppletRunner);
	document.getElementById("manageLicense").addEventListener("click", () => chrome.runtime.sendMessage({ type: "openLicensePage" }));
	document.getElementById("manageLicenseButton").addEventListener("click", () => chrome.runtime.sendMessage({ type: "openLicensePage" }));
});
