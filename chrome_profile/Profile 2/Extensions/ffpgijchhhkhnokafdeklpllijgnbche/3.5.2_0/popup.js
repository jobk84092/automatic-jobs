import { linker } from './worker.js'

// Note: A user gesture on the action is required for Tab.title and Tab.url 
// to be populated in Chrome 122 at least (Inspect Popup denies these properties).
const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })

// Get the services.
const { all_services, user_services } = await chrome.runtime.sendMessage({ type: 'get_services' })
// Create the buttons.
init(all_services, user_services)

// Disable context menu in the popup.
document.addEventListener('contextmenu', function (e) {
	e.preventDefault()
})

// Disable highlighting in the popup.
document.addEventListener('selectstart', function (e) {
	e.preventDefault()
})

function create_link(service_obj) {
	const el = document.createElement('div')
	const el_icon_con = document.createElement('div')
	const icon = service_obj.icon
	// Custom icon "data:" URI, or an AddToAny icon name?
	const is_custom_icon = icon.substr(0, 5) === 'data:'
	
	el.className = 'row'
	
	el.onclick = async (ev) => {
		linker(service_obj, tab, null, ev)
		// Close pop-up if regular click event (Cmd or Ctrl or middle-mouse-button were not used)
		// @note Firefox needs this
		if (ev && !(ev.metaKey || ev.ctrlKey || ev.which == 2)) {
			window.close()
		}
	}
	
	if (is_custom_icon) {
		el_icon_con.style.backgroundImage = 'url(' + icon + ')'
		el_icon_con.className = 'icon'
	} else {
		el_icon_con.style.backgroundColor = service_obj.color ? '#' + service_obj.color : ''
		el_icon_con.className = 'icon a2a_s__default a2a_s_' + icon	
	}
	
	el.appendChild(el_icon_con)
	el.appendChild(document.createTextNode(service_obj.name))
	document.getElementById('services').appendChild(el)
}

async function init(all_services, user_services) {	
	// Create service links
	for (let service_index in user_services) {
		const service_name = user_services[service_index]
		const this_service = all_services[service_name]
		
		create_link(this_service)
	}
	
	// AddToAny "More" link
	create_link({
		code: "more_services",
		name: "More\u2026",
		icon: "a2a",
		color: "0166FF",
		url: "https://www.addtoany.com/share#url=${link}&title=${title}"
	})
	
	// Create "Options" link
	create_link({
		code: "options",
		name: "Options\u2026",
		icon: "extension_settings",
		url: chrome.runtime.getURL("/options.html")
	})
}