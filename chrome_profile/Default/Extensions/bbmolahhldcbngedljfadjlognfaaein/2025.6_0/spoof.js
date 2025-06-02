(function spoofFunc()
{
	// TODO: This is appropiate for newer Chrome
	if ('userAgent' in Navigator.prototype)
	{
		var oldUA = navigator.userAgent;
		var parts = oldUA.split(' ');
		for(var i=0;i<parts.length;i++)
		{
			// Replace with chromium, some sites have disabled chrome completely
			if(parts[i].startsWith("Chrome/") || parts[i].startsWith("Chromium/"))
				parts[i] = "Chromium/44";
		}
		var newUA = parts.join(' ');
		var mimes = [].slice.call(navigator.mimeTypes);
		var realMimesLen = mimes.length;
		var plugin = [];
		plugin.description = "CheerpJ Applet Runner executes Java applets.";
		plugin.name = "CheerpJ Applet Runner";
		mimes.push({description:"",type:"application/x-java-applet",enabledPlugin:plugin});
		mimes.push({description:"",type:"application/x-java-applet;version=1.8.0",enabledPlugin:plugin});
		mimes.push({description:"",type:"application/x-java-applet;jpi-version=1.8.0",enabledPlugin:plugin});
		mimes.push({description:"",type:"application/x-java-applet;deploy=10.7.2",enabledPlugin:plugin});
		// Allow direct queries from mime-types
		for(var i=0;i<mimes.length;i++)
		{
			var m=mimes[i];
			mimes[m.type] = m;
		}
		// Add mime types to the plugin object
		for(var i=realMimesLen;i<mimes.length;i++)
		{
			var m=mimes[i];
			plugin.push(m);
			plugin[m.type] = m;
		}
		Object.defineProperties(Navigator.prototype, {userAgent:{ value: newUA, configurable: false, enumerable: true, writable: false},
								javaEnabled: { value: function() { return true; }, configurable: false, enumerable: true, writable: false},
								mimeTypes: { value: mimes, configurable: false, enumerable: true, writable: false}});
		Object.defineProperty(window, "chrome", {value: null});
	}
	else
		debugger
	// Directly inject the spoof code in all subframes
	var elems = document.getElementsByTagName("frame");
	if(elems.length == 0)
		return;
	var spoofScript = spoofFunc.toString()+";spoofFunc();";
	for(var i=0;i<elems.length;i++)
	{
		var f = elems[i];
		var s = f.contentDocument.createElement("script");
		s.textContent = spoofScript;
		f.contentDocument.head.appendChild(s);
	}
})();