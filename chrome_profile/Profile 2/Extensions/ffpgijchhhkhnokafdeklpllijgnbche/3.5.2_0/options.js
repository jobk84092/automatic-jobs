$(document).ready(function() {
	
	let currents_loaded = false;
	let services

	const $user_services_container = $('#services')
	
	$user_services_container.sortable({
		axis: 'y',
		items: 'div.row',
		placeholder: 'ui-sortable-placeholder',
		opacity: .6,
		update: function() {
			save_options();
		}
	});
	
	// Service click = move to sortable list
	const moveToSortableList = function() {
		$(this).off('click', moveToSortableList).on('click', moveToSelectableList).clone().attr('id', $(this).attr('id').substr(6)).appendTo($user_services_container).fadeIn('fast');
		$(this).toggleClass('selected');
		//$(this).attr('id', 'old_' + $(this).attr('id'));
		
		$('#services div.row:last').fadeTo('fast', 1);
		
		save_options();
	};
	
	// Service click again = move back to selectable list
	const moveToSelectableList = function() {
		$(this).toggleClass('selected').off('click', moveToSelectableList).on('click', moveToSortableList);
		
		$('#' + $(this).attr('id').substr(6).replace(/\./, '\\.')).hide('fast', function() {
			$(this).remove();
			save_options();
		});
	};
	
	// Show custom service fields
	const add_custom_service = function(optional_event) {
		const data = optional_event.data || {}
		const data_name = data.name || ''
		const data_url = data.url || ''
		const data_icon = data.icon ? 
			'<img src="' + data.icon + '" height="24" width="24">' : 
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><g fill="#FFF"><path d="M14 7h4v18h-4z"/><path d="M7 14h18v4H7z"/></g></svg>'
		const bg_color = data.icon ? '' : ' style="background-color:#1A1A1A"'
		
		// Are we initiating from optional_event.data?
		const initiating = data_name ? true : false;
		
		const new_service = $('#custom_services').append(
			'<div class="custom_service">' +
				'<input class="file_input" type="file" accept="image/*">' +
				'<div class="custom_icon"' + bg_color + '>' + data_icon + '</div> <div class="custom_icon_error"></div>' +
				'<label><span>Name:</span><input class="custom_name" type="text" placeholder="Example Service" size="25" value="' + data_name + '" required></label>' +
				'<label><span>URI scheme:</span><input class="custom_url" type="url" placeholder="https://www.example.com/share?link=${link}&title=${title}" size="50" value="' + data_url + '" required> <a class="custom_url_tip_show" href="#" required>[?]</a></label>' +
				'<div class="custom_url_tip">You can specify <code>${link}</code> and <code>${title}</code> placeholders in the service\'s URI scheme.</div>' +
				'<button class="custom_save">Save</button> <button class="custom_delete">Delete</button>' +
			'</div>'
		)
		.children().last('.custom_service');
		
		if (initiating) {
			new_service.children('.custom_delete').show();
			$('#custom_services, .custom_service').show();
		} else { // "Add custom service" button clicked
			new_service.children('.custom_delete, .custom_save').show();
			$('#custom_services').fadeIn('fast');
			$('.custom_service').slideDown('fast');
		}
		
		new_service.find('input.file_input').first().change(function() {
			const file = $(this).get(0).files[0]
			const custom_icon_error = new_service.find('.custom_icon_error').first()
			
			if ( file.size >= 50000 ) {
				custom_icon_error.text('File size must be less than 50 kilobytes.')
				return
			}
			
			if ( ! /^image\//.test(file.type) ) {
				custom_icon_error.text('File type must be a valid image.')
				return
			}
			
			custom_icon_error.text('');
			
			const img = document.createElement('img');
			img.height = 24;
			img.width = 24;
			
			const reader = new FileReader();
			reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
			reader.readAsDataURL(file);
			
			new_service.find('.custom_icon').css('background-color', 'transparent').html(img);
		});
		new_service.find('.custom_icon').first().click(function() {
			$(this).prev('.file_input').first().click();
		});
		
		function show_save() {
			new_service.children('.custom_save').first().fadeIn();
		}
		new_service.find('input.custom_name, input.custom_url, input.file_input').change(show_save);
		new_service.find('input.custom_name, input.custom_url').focus(show_save);
		
		new_service.find('.custom_url_tip_show').first().click(function(e) {
			e.preventDefault();
			$(this).hide().parent().next('.custom_url_tip').show();
		});
		
		new_service.children('.custom_save').click(function() {
			const custom_name = new_service.find('input.custom_name').first();
			const custom_url = new_service.find('input.custom_url').first();
			if ( custom_name.val().length < 1 ) {
				custom_name.focus();
				return;
			}
			if ( custom_url.val().length < 1 ) {
				custom_url.focus();
				return;
			}
			save_options();
			nice_reload();
		});
		
		new_service.children('.custom_delete').click(function() {
			new_service.slideUp('fast', function() { 
				$(this).remove();
				save_options();
				nice_reload();
			});
		});
	}

	/** Whether a single service is selected. */
	const single_service_selected = ($services_children) => ($services_children ?? $user_services_container.children()).length === 1;

	/** Handles the showing & hiding of options. */
	const handle_options_display = function() {
		// Show the "one-click" option if a single service is selected.
		const $services_children = $user_services_container.children();
		const $one_click_option = $('#one_click_option');
		if (single_service_selected($services_children)) {
			$one_click_option.children('.one_click_single_service:eq(0)').text($services_children.first().text());
			$one_click_option.slideDown('fast');
		} else {
			$one_click_option.slideUp('fast');
		}

		// Show the "open email in tab" options if the `email` service is selected.
		const email_selected = $user_services_container.children('#email').length == 1;
		const $email_new_tab_option = $('#email_new_tab_option');
		if (email_selected) {
			$email_new_tab_option.slideDown('fast');
		} else {
			$email_new_tab_option.slideUp('fast');
		}
	}
	
	const nice_reload = function() {
		jQuery('body').fadeTo('fast', 0, function() { location.reload(); });
	};
	
	const save_and_close = function() {
		save_options();
		chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
			chrome.tabs.remove(tabs[0].id);
		});
	};
	
	const save_options = async function() {
		// If currently selected services haven't been loaded yet
		if ( ! currents_loaded) {
			// Don't save yet
			return;
		}

		handle_options_display();
		
		const new_options = {};
		
		// Set user-selected services
		new_options.user_selected = $user_services_container.sortable('toArray');
		
		// Set custom services
		const custom_services = [];
		$('.custom_service').each(function(index) {
			const num = index + 1,
				custom_name = $(this).find('input.custom_name').first().val(),
				custom_url = $(this).find('input.custom_url').first().val(),
				custom_icon = $(this).find('.custom_icon').first().children('img').first().prop('src');
				
			if (custom_name.length > 0 && custom_url.length > 0) {
				custom_services.push({
					code: 'custom_service_' + num,
					name: custom_name,
					url: custom_url,
					icon: custom_icon
				});	
			}
		});
		new_options.custom_services = custom_services;
		
		new_options.context_menu = ( $('#context_menu').is(':checked') ) ? 1 : 0;
		new_options.one_click = ( $('#one_click').is(':checked') ) ? 1 : 0;
		
		// Set service preferences (a one-off for the `email` service right now).
		new_options.service_preferences = {};
		new_options.service_preferences.email = {
			new_tab: $('#email_new_tab').is(':checked')
		};

		// Save options
		await chrome.runtime.sendMessage({ type: 'set_options', options: new_options });
		
		// Remove context menu
		chrome.contextMenus.removeAll(function() {
			// Create context menu again (if the option is enabled)
			chrome.runtime.sendMessage({ type: 'create_context_menu' })
		});

		// Set the action to "one-click" sharing if enabled, or the default popup.
		chrome.action.setPopup({
			popup: new_options.one_click === 1 && single_service_selected() ? '' : 'popup.html'
		})
	};
	
	const reset_options = function() {
		const answer = confirm("Are you sure you want to reset all AddToAny options?");
		if (answer) {
			// Doesn't return a Promise in at least Chrome 65,
			// so using Chrome's documented callback method
			chrome.storage.local.clear(async function() {
				nice_reload();
			})
		}
	};
	
	async function init() {
		// Get all services from JSON
		const options = await chrome.runtime.sendMessage({ type: 'get_options' })
		const services_obj = await chrome.runtime.sendMessage({ type: 'get_services' })
		services = services_obj.all_services
		const custom_services = services_obj.custom_services
		const user_services = services_obj.user_services
		const service_html = function(service_code, service_name, service_icon, service_color) {
			// Custom icon "data:" URI, or an AddToAny icon name?
			const icon = service_icon.substr(0, 5) === 'data:' ? '<div class="icon" style="background-image:url(' + service_icon + ')"></div>'
				: '<div class="icon a2a_s__default a2a_s_' + service_icon + '" style="background-color:#' + service_color + '"></div>';
			
			return '<div class="row" id="avail_' + service_code + '">'
						+ icon
						+ service_name
					+'</div>';
		}
		
		// Create all services
		for (let service_code in services) {
			const service_name = services[service_code].name
			const service_icon = services[service_code].icon
			const service_color = services[service_code].color
			$('#available').append(service_html(service_code, service_name, service_icon, service_color))
				.children().last()
				.data('code', service_code)
				// Available service click = move to sortable list
				.on('click', moveToSortableList);
		}
		
		// Create currently selected services in a mock menu
		for (let service_index in user_services) {
			const service_code = user_services[service_index];
			// Auto-select active service
			$('#avail_' + service_code).click();
		}
		currents_loaded = true;
		handle_options_display();
		
		// Create custom services
		for (let custom_service of custom_services) {
			const event_obj = {};
			event_obj.data = custom_service;
			add_custom_service(event_obj);
		}
		
		// If context menu not disabled
		if ( ! options || typeof options.context_menu === 'undefined' || options.context_menu !== 0 ) {
			// Checkmark the checkbox
			$('#context_menu').prop('checked', true);
		}

		// If "one-click" option is enabled
		if ( options && typeof options.one_click !== 'undefined' && options.one_click === 1 ) {
			// Checkmark the checkbox
			$('#one_click').prop('checked', true);
		}

		// If the `email` service preference to 'open in a new tab' is not disabled
		if (options?.service_preferences?.email?.new_tab !== false) {
			// Checkmark the checkbox
			$('#email_new_tab').prop('checked', true);
		}
	};
	
	$('.save_on_change').change(save_options);
	$('button#add_custom_service').on('click', add_custom_service);
	$('button#close').on('click', save_and_close);
	$('button#reset').on('click', reset_options);
	
	init();
	
});