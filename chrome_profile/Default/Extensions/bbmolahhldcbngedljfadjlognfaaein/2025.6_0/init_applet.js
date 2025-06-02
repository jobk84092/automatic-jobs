var initOptions = {};
var loaderElem = document.getElementById("cj3loader");
var loaderElemOptions = loaderElem.getAttribute("data-options");
if (loaderElemOptions)
{
	initOptions = JSON.parse(loaderElemOptions);
	if (initOptions.overrideAllShortcuts == true)
	{
		delete initOptions.overrideAllShortcuts;
		initOptions["overrideShortcuts"] = function (e) {return true;};
	}
}
cj3AttachBodyObserver(/*appletRunnerMode*/true, initOptions);