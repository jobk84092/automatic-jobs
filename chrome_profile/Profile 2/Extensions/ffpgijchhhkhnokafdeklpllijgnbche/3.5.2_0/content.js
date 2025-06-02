// Listen for messages
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if ('getDescription' === request.method) {
		const user_selection = window.getSelection().toString()
		let description = ''
		let meta_description = () => {
			// Get element meta[name="description"] or meta[property="og:description"] or null.
			const el = document.querySelector('meta[name="description"],meta[property="og:description"]')
			// Cache value.
			meta_description = () => el
			return el
		}
		
		if (user_selection.length > 0) {
			description = user_selection
		} else if ( meta_description() ) {
			description = meta_description().getAttribute('content')
		}
		
		sendResponse({
			description: description.substring(0, 1200) // Limit characters.
		})
	}
})