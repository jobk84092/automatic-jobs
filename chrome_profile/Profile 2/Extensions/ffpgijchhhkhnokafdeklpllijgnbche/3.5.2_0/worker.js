import { BROWSER_VENDOR } from './browser.js'

/** JSON cache of `services.json`. */
let services_json

/**
 * Retrieves the options from local storage.
 */
async function get_options() {
	let options = await chrome.storage.local.get(null)
	// Set to null if empty object
	options = Object.keys(options).length === 0 ? null : options
	return options
}

/**
 * Saves the options object to local storage.
 * @param {object} options_object - The options object to be saved in local storage.
 */
async function set_options(options_object) {
	const response = await chrome.storage.local.set(options_object)
	return response
}

/**
 * Retrieves the services JSON data.
 */
async function get_services_json() {
	// Use cached services JSON if available
	if (services_json) {
		return services_json
	}
	// Load services.json
	const response = await fetch(chrome.runtime.getURL('/services.json'))
	if (!response.ok) {
		console.error("Cannot access services.json file: " + c)
		services_json = {
			services: {},
			defaults: []
		}
	}
	// Preserve & cache original JSON
	services_json = await response.json()
	return services_json
}

/** Retrieves all services including custom services. */
const get_all_services = async function (optional_options) {
	const options = optional_options ?? await get_options()
	// Set to original services, avoiding an object reference to services
	const services = JSON.parse(JSON.stringify(await get_services_json()))

	// Add the `pref` property to each service object if the service is in service_preferences.
	for (let service_code in services.services) {
		if (options?.service_preferences?.[service_code]) {
			services.services[service_code].pref = options.service_preferences[service_code]
		}
	}

	// Add custom services
	const custom_services = await get_custom_services(options)
	for (let i = 0, len = custom_services.length; i < len; i++) {
		services.services[custom_services[i].code] = {
			name: custom_services[i].name,
			url: custom_services[i].url,
			icon: custom_services[i].icon || 'a2a',
			color: '1A1A1A'
		}
	}

	// Add custom_services property to the services object.
	services.custom_services = custom_services
	// Add service_preferences property to the services object.
	services.service_preferences = options?.service_preferences ?? {}

	return services
}

/**
 * Retrieves the custom services from the options.
 */
const get_custom_services = async function (optional_options) {
	const options = optional_options ?? await get_options()
	return ( ! options || ! options.custom_services ) ? [] : options.custom_services
}

/**
 * Retrieves user-selected services, possibly including unavailable services.
 */
const get_user_selected = async function (optional_options) {
	const options = optional_options ?? await get_options()
	return options?.user_selected ?? []
}

/** Gets user selected available services, with unavailable services filtered out. */
const get_user_services = async function (optional_options) {
	let user_services
	let user_selected = await get_user_selected(optional_options)
	const all_services = await get_all_services(optional_options)
	const services = all_services.services
	const check_services = function(value, index, array) {
			// Filter out the services not found
			for (let service_code in services) {
				if (value == service_code)
					return 1
			}
			
			return false
		}

	if (user_selected) {
		user_selected = user_selected.filter(check_services)
	}

	if ( user_selected && user_selected.length > 0 ) {
		user_services = user_selected
	}
	else {
		// Use defaults
		user_services = all_services.defaults.en; // Assume locale is 'en' for now
	}

	return user_services
}

/** Whether the passed value is a valid HTTP URL. */
const isValidHttpUrl = (possibleUrl) => {
	if (typeof URL.canParse === 'function') {
		return URL.canParse(possibleUrl)
	}
	try {
		new URL(possibleUrl)
	} catch (e) {
		return false
	}
	return true
}

/** Returns the `a2a_*` parameters such as URL, title, note, and their URL-encoded values. */
const get_a2a_params = function(tab, optional_context_info) {
	let a2a_linkname
	let a2a_linkname_enc
	let a2a_linkurl
	let a2a_linkurl_enc
	let a2a_linknote = ''
	let a2a_linknote_enc = ''
	const context_info = (typeof optional_context_info === 'object') ? optional_context_info : null
	const isHttpWithoutWhitespace = (text) => /^https?:\/\//.test(text) && ! /\s/.test(text) && isValidHttpUrl(text)

	// If context menu was opened on a link, use the URL it points to
	if (context_info && context_info.linkUrl) {
		a2a_linkname = ''
		a2a_linkurl = context_info.linkUrl
		a2a_linknote = ''
		a2a_linknote_enc = ''
	}
	// Else if opened on a text selection that is a valid URL without whitespace
	else if (context_info && context_info.selectionText && isHttpWithoutWhitespace(context_info.selectionText)) {
		a2a_linkname = ''
		a2a_linkurl = context_info.selectionText
		a2a_linknote = ''
		a2a_linknote_enc = ''
	}
	// Else if opened on a text selection
	else if (context_info && context_info.selectionText) {
		a2a_linkname = tab.title
		a2a_linkurl = tab.url
		a2a_linknote = context_info.selectionText
		a2a_linknote_enc = encodeURIComponent(a2a_linknote).replace(/'/g, '%27')
	} else {
		a2a_linkname = tab.title
		a2a_linkurl = tab.url
		a2a_linknote = ''
		a2a_linknote_enc = ''
		
		// If not context menu (because the asynchronous request is too late)
		if ( ! context_info) {
			// Execute content script, and suppress Chrome error if current active tab cannot be scripted (and just bail later when the subsequent error occurs)
			chrome.scripting.executeScript({
				files: ['/content.js'],
				target: { tabId: tab.id },
			}, () => chrome.runtime.lastError)
			
			chrome.tabs.sendMessage(tab.id, { method: 'getDescription' }, function (response) {
				if (chrome.runtime.lastError) {
					// Bail and suppress Chrome error if current active tab cannot be scripted
					return
				}
				// Note: response is asynchronous so the following variables are NOT used in popup's init(). Wait until link onclick
				if (response) {
					a2a_linknote = response.description || ''
					a2a_linknote_enc = encodeURIComponent(a2a_linknote).replace(/'/g, '%27')
				}
			})
		}
	}

	a2a_linkname_enc = encodeURIComponent(a2a_linkname).replace(/'/g, '%27')
	a2a_linkurl_enc = encodeURIComponent(a2a_linkurl).replace(/'/g, '%27')

	return {
		a2a_linkname,
		a2a_linkname_enc,
		a2a_linkurl,
		a2a_linkurl_enc,
		a2a_linknote,
		a2a_linknote_enc
	}
}

/**
 * Handles linking to a service's endpoint.
 * 
 * @param {object} service_obj - The service object containing information about the service.
 * @param {Tab} tab - The current tab object.
 * @param {OnClickData} optional_context_info - Information about the context menu item that was clicked.
 * @param {Event} optional_event - The event that triggered the linking.
 */
export const linker = function (service_obj, tab, optional_context_info, optional_event) {
	// Get a2a_* parameters.
	const {
		a2a_linkname_enc,
		a2a_linkurl_enc,
		a2a_linknote_enc
	} = get_a2a_params(tab, optional_context_info)
	const service_js = service_obj.js
	const service_code = service_obj.code
	const service_name = service_obj.name
	const service_href = service_obj.href
	const service_pref = service_obj.pref || {}
	// Is it the Options link?
	const options_link = (service_code == 'options') ? true : false
	const special_url = (service_obj.url) ? 
		service_obj.url
			.replace('${link}', a2a_linkurl_enc)
			.replace('${title}', a2a_linkname_enc)
		: false
	/** Whether the service is a protocol service like `sms:`. */
	const protocol_service = ! special_url && ! /^(https?:)?\/\//.test(service_href) ? true : false
	const explict_target_self_pref = typeof service_pref.new_tab != 'undefined' && service_pref.new_tab === false
	const target_self = service_js || protocol_service || explict_target_self_pref ? true : false
	let endpoint = (special_url) ? 
		special_url 
		: "https://www.addtoany.com/add_to/"
			+ service_code 
			+ "?linkurl=" 
			+ a2a_linkurl_enc 
			+ "&linkname=" 
			+ a2a_linkname_enc

	if (target_self) {
		if ('print' === service_code) {
			chrome.scripting.executeScript({
				func: () => window.print(),
				target: {
					tabId: tab.id,
				}
			})
		} else {
			chrome.tabs.update(tab.id, {
				url: endpoint
			})
		}
	} else {
		// Add linknote param unless this is the Options link
		if ( ! options_link && a2a_linknote_enc.length > 0) {
			endpoint += '&linknote=' + a2a_linknote_enc
		}
		
		const event = optional_event
		chrome.tabs.create({
			// If Cmd or Ctrl or middle-mouse-button used during click event,
			// open tab in background
			active: (event && (event.metaKey || event.ctrlKey || event.which == 2 ) ) ? false : true ,
			url: endpoint
		})
	}
}

/** Enables context menu icons for Firefox only, because other browsers do not support such icons. */
const firefoxOnlyIcon = (svgFilePath) => {
	return 'firefox' === BROWSER_VENDOR ? {
		icons: {
			16: svgFilePath,
		}
	} : {}
}

/**
 * Handles the click event from the action button.
 * @param {Tab} tab - The tab that was active when the icon was clicked.
 * @param {OnClickData} - Firefox only: Information about the click.
 */
async function handle_action_button_click(tab) {
	const options = await get_options()
	const user_services = await get_user_services(options)
	const all_services = (await get_all_services(options)).services
	// If "one-click" is enabled and only one service is selected
	if (options?.one_click === 1 && user_services?.length === 1) {
		const single_service = all_services[user_services[0]]
		linker(single_service, tab, null)
	}
}

/**
 * Handles the click event from an AddToAny item in the context menu.
 * @param {OnClickData} info - Information about the clicked menu item.
 * @param {Tab} tab - Information about the current tab.
 */
async function handle_context_menu_click(info, tab) {
	const id = info.menuItemId
	if (id == 'more_services') {
		linker({
			code: "more_services",
			name: "More\u2026",
			icon: "a2a",
			url: "https://www.addtoany.com/share#url=${link}&title=${title}"
		}, tab, info)
		return
	} else if (id == 'options') {
		linker({
			code: "options",
			name: "Options\u2026",
			icon: "extension_settings",
			url: chrome.runtime.getURL("/options.html")
		}, tab)
		return
	} else {
		const all_services = (await get_all_services()).services
		const this_service = all_services[id]
		linker(this_service, tab, info)
	}
}

/** Creates a context menu for AddToAny. */
async function create_context_menu() {
	const options = await get_options()
	// If the context menu is disabled
	if ( options && typeof options.context_menu != 'undefined' && options.context_menu === 0 ) {
		// Do not create it
		return
	}

	// Get services
	const all_services = (await get_all_services(options)).services
	const user_services = await get_user_services(options)

	const contexts = ['all']

	// AddToAny content menu
	const context_menu_parent = chrome.contextMenus.create({
		id: "addtoany",
		title: "AddToAny", 
		contexts,
	})

	// Create service context menu items
	for (let service_index in user_services) {
		const service_name = user_services[service_index]
		const this_service = all_services[service_name]
		const service_icon = 'data:' === this_service.icon.substr(0, 5) ? '_default' : this_service.icon
		chrome.contextMenus.create({
			contexts,
			...firefoxOnlyIcon(`icons/${service_icon}.svg`),
			id: service_name,
			title: this_service.name,
			parentId: context_menu_parent,
		})
	}

	// Create separator
	chrome.contextMenus.create({ contexts, id: 'more_separator', parentId: context_menu_parent, type: "separator" })

	// Create "More..." universal page item
	chrome.contextMenus.create({
		contexts,
		...firefoxOnlyIcon('icons/a2a.svg'),
		id: "more_services",
		title: "More\u2026",
		parentId: context_menu_parent,
	})

	// Create separator
	chrome.contextMenus.create({ contexts, id: 'options_separator', parentId: context_menu_parent, type: "separator" })

	// Create "Options" item
	chrome.contextMenus.create({
		contexts,
		...firefoxOnlyIcon('images/extension_settings.svg'),
		id: "options",
		title: "Options\u2026",
		parentId: context_menu_parent,
	})
}

/** Listens for messages from the extension. */
const handle_message = ({ type, options }, sender, sendResponse) => {
	switch (type) {
		case 'create_context_menu':
			create_context_menu()
			break
		case 'get_services':
			(async () => {
				const all_services = await get_all_services()
				const user_services = await get_user_services()
				sendResponse({
					all_services: all_services.services,
					custom_services: all_services.custom_services,
					service_preferences: all_services.service_preferences,
					user_services: user_services,
				})
			})()
			// Return `true` to have the requestor handle the request asynchronously.
			return true
			break
		case 'get_options':
			(async () => sendResponse(await get_options(options)))()
			// Return `true` to have the requestor handle the request asynchronously.
			return true
			break
		case 'set_options':
			(async () => sendResponse(await set_options(options)))()
			// Return `true` to have the requestor handle the request asynchronously.
			return true
			break
	}
}

// Note: Listeners must be registered synchronously in Manifest V3.

// Listen for messages.
chrome.runtime.onMessage.addListener(handle_message)
// Create the context menu on installation.
chrome.runtime.onInstalled.addListener(create_context_menu)
// Listen for the context menu click event.
chrome.contextMenus.onClicked.addListener(handle_context_menu_click)
// Listen for the action button click event.
chrome.action.onClicked.addListener(handle_action_button_click)
// Set the action to "one-click" sharing if enabled, or the default popup.
;(async () => {
	const options = await get_options()
	const user_services = await get_user_services(options)
	chrome.action.setPopup({
		popup: options?.one_click === 1 && user_services?.length === 1 ? '' : 'popup.html'
	})
})()