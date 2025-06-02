// region key functions
	function get_rumola_key1() {
		var key = "db7669d04f6430b5";
		if (localStorage['rumola:key'])
			key = (""+localStorage['rumola:key']).substr(0,16);
		return key;
	}
	function get_rumola_key2() {
		var key = "edf384db051f5d18";
		if (localStorage['rumola:key'])
			key = (""+localStorage['rumola:key']).substr(16);
		return key;
	}
	function get_rumola_key2_sum() {
		var key = get_rumola_key2();
		var s=0;
		for (var i=0; i<16; i++) {
			s += key.charCodeAt(i);
		}
		return s;
	}

	function set_rumola_key(key) {
		localStorage['rumola:key'] = key;
	}
// endregion key functions

// region auto search functions
	function get_rumola_enabled() {
		var enabled = true;
		if (localStorage['rumola:enabled'])
			enabled = (localStorage['rumola:enabled'] == 'true');
		return enabled;
	}
	function set_rumola_enabled(enabled) {
		localStorage['rumola:enabled'] = enabled ? "true" : "false";
		chrome.browserAction.setIcon({"path": (enabled ? "images/on.png" : "images/off.png")});
		chrome.browserAction.setTitle({"title": chrome.i18n.getMessage(enabled ? "hint1" : "hint2")});
	}
	function change_rumola_enabled() {
		var enabled = !get_rumola_enabled();
		set_rumola_enabled(enabled);
		if (!enabled) {
			// TODO: may be make function sendMessage like in Safari
			chrome.tabs.getSelected(null, function(tab) {
				chrome.tabs.sendRequest(tab.id, {action:"Cancel"});
			});
		}
	}
// endregion auto search functions
set_rumola_enabled(get_rumola_enabled());

// region voice notifications
	function get_rumola_voice() {
		var voice = false;
		if (localStorage['rumola:voice'])
			voice = (localStorage['rumola:voice'] == 'true');
		return voice;
	}
	function set_rumola_voice(v) {
		var value = v ? "true" : "false";
		localStorage['rumola:voice'] = value;
		if (v) {
			voice_notification("notifications/on.wav");
			notify(chrome.i18n.getMessage("voice_on"), false);
		} else {
			notify(chrome.i18n.getMessage("voice_off"), false);
		}
	}

	audio_object = null;
	function voice_notification(f) {
		if (!get_rumola_voice())
			return;
		try
		{
			if (audio_object === null)
			{
				audio_object = new Audio();
			}
			audio_object.src = f;
			audio_object.play();
		}
		catch (exc) {}
	}
// endregion voice notifications

// region switcher position
	function get_switcher_position() {
		var pos = 'p';
		if (localStorage['rumola:switcher'])
			pos = localStorage['rumola:switcher'];
		return pos;
	}
// endregion switcher position

// region of captcha regexes
	function get_regexes_string() {
		var line = "[ck]apt?cha|robot|random|rnd|code|kod|geraimag|verif||solvemedia||solvemedia||capt?cha|IdMainDiv|realperson||capt?cha||[ck]ap|chal|check|code|kod|confir|guess|guven|ivc|response|secur|solu|spam|test|token|validat|verif|vrfcd|result|respuesta";
		if (localStorage['rumola:filter_string_new'])
			line = localStorage['rumola:filter_string_new'];
		return line;
	}
	function get_regexes_version() {
		var v = 5;
		if (localStorage['rumola:filter_version_new'])
			v = localStorage['rumola:filter_version_new'];
		return v;
	}
	function set_regexes_string_and_version(s, v) {
		localStorage['rumola:filter_string_new'] = s;
		localStorage['rumola:filter_version_new'] = v;
	}
// endregion of captcha regexes

// region cached balance functions
	function get_cached_balance() {
		var balance = "?";
		if (localStorage['rumola:balance'])
			balance = ""+localStorage['rumola:balance'];
		return balance;
	}
	function update_cached_balance(b) {
		localStorage['rumola:balance'] = b;
	}
// endregion cached balance functions

// region all connect to server functions
	gate_urls = new Array();
	gate_urls.push("https://gate1a.skipinput.com/q_gate.php?b=chrome&v=3005&l="+chrome.i18n.getMessage("@@ui_locale")+"&key=");
	gate_urls.push("https://gate2a.skipinput.com/q_gate.php?b=chrome&v=3005&l="+chrome.i18n.getMessage("@@ui_locale")+"&key=");
	gate_urls.push("https://gate.rumola.com/q_gate.php?b=chrome&v=3005&l="+chrome.i18n.getMessage("@@ui_locale")+"&key=");

	tmp_variable = Math.round((new Date()).getTime()/100);
	gate_url_index = (get_rumola_key1() == 'db7669d04f6430b5') ? 0 : tmp_variable % 3;
	gate_url_vector = (tmp_variable % 2)*2-1;
	gate_suggested_index = -1;
	gate_url = gate_urls[gate_url_index];
	n_bad_responses_from_first_gate = 0;

	function change_rumola_gate_url(bNotify, bUseSuggested) {
		if (bNotify)
			n_bad_responses_from_first_gate++;
		if ((n_bad_responses_from_first_gate == 3)&&(bNotify)) {
			notify(chrome.i18n.getMessage("conn_error"), false);
		}
		if (get_rumola_key1() == 'db7669d04f6430b5') {
			return;
		}
		gate_url_index = bUseSuggested ? gate_suggested_index : ((gate_url_index+gate_url_vector+6) % 3);
		gate_url = gate_urls[gate_url_index];
	}

	function process_response_heads(objHTTP) {
		if (objHTTP.getResponseHeader("rumola_key"))
			set_rumola_key(objHTTP.getResponseHeader("rumola_key"));
		if (objHTTP.getResponseHeader("rumola_credits"))
			update_cached_balance(objHTTP.getResponseHeader("rumola_credits"));
		if (objHTTP.getResponseHeader("DraftFilterVersion") && objHTTP.getResponseHeader("DraftFilterString"))
			set_regexes_string_and_version(objHTTP.getResponseHeader("DraftFilterString"), objHTTP.getResponseHeader("DraftFilterVersion"));
		if (objHTTP.getResponseHeader("ChangeGateSuggest") && (gate_suggested_index == -1)) {
			gate_suggested_index = parseInt(objHTTP.getResponseHeader("ChangeGateSuggest"));
			change_rumola_gate_url(false, true);
		}
	}

	function send_activation_request(post_data, tab_id, frame_id) {
		var objHTTP = new XMLHttpRequest();
		objHTTP.sender_tab_id = tab_id;
		objHTTP.frame_id = frame_id;
		objHTTP.open('POST', gate_url+get_rumola_key1()+"&action=install&c1="+check_cheater_1()+"&c2="+check_cheater_2(), false);
		objHTTP.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		try
		{
			objHTTP.send(post_data);
		}
		catch (exc) {
			notify(chrome.i18n.getMessage("conn_error"), false);
			return false;
		}
		if (objHTTP.status != 200) {
			notify(chrome.i18n.getMessage("conn_error"), false);
			return false;
		}
		process_response_heads(objHTTP);
		if (get_rumola_key1() == 'db7669d04f6430b5') {
			notify(chrome.i18n.getMessage("conn_error"), false);
			return false;
		}
		process_good_response_from_first_gate(""+objHTTP.responseText, objHTTP.sender_tab_id, objHTTP.frame_id, objHTTP.getResponseHeader("BGate"));
		return true;
	}

	function send_request_to_first_gate(toGate, tab_id, frame_id, step_id) {
		if (get_rumola_key1() == 'db7669d04f6430b5') {
			send_activation_request("fields=" + escape(toGate), tab_id, frame_id);
		} else {
			var objHTTP = new XMLHttpRequest();

			objHTTP.sender_tab_id = tab_id;
			objHTTP.frame_id = frame_id;
			objHTTP.gate_url = gate_url;
			objHTTP.toGate = toGate;
			objHTTP.step_id = step_id;

			objHTTP.open('POST', gate_url+get_rumola_key1(), true);
			objHTTP.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			objHTTP.setRequestHeader('DraftFilterVersion', get_regexes_version());
			objHTTP.setRequestHeader('SuggectedGate', ""+gate_suggested_index);
			objHTTP.addEventListener("readystatechange", response_from_first_gate, true);
			objHTTP.send("key="+get_rumola_key2()+"&fields=" + escape(toGate));
			setTimeout(function() {
				if (objHTTP.readyState != 4) {
					objHTTP.abort();
				}
			},7500);
		}
	}

	function response_from_first_gate(aEvent) {
		var objHTTP = aEvent.target;
		if (objHTTP.readyState != 4)
			return;

		if (objHTTP.status != 200) {
			if (objHTTP.gate_url == gate_url) {
				change_rumola_gate_url(true, false);
			}
			if (objHTTP.step_id == 1) {
				setTimeout(function() {
					send_request_to_first_gate(objHTTP.toGate, objHTTP.sender_tab_id, objHTTP.frame_id, 2);
				}, 250);
			}
			return;
		}
		process_response_heads(objHTTP);
		process_good_response_from_first_gate(""+objHTTP.responseText, objHTTP.sender_tab_id, objHTTP.frame_id, objHTTP.getResponseHeader("BGate"));
	}
	function response_from_second_gate(aEvent) {
		var objHTTP = aEvent.target;
		if (objHTTP.readyState != 4)
			return;

		if (objHTTP.status != 200) {
			if (objHTTP.redo) {
				setTimeout(function() {
					var objHTTP1 = new XMLHttpRequest();

					objHTTP1.sender_tab_id = objHTTP.sender_tab_id;
					objHTTP1.frame_id = objHTTP.frame_id;
					objHTTP1.redo = 0;

					objHTTP1.open(objHTTP.method, objHTTP.url, true);
					objHTTP1.addEventListener("readystatechange", response_from_second_gate, true);
					objHTTP1.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
					objHTTP1.send(objHTTP.data);
					}, 1500);
				return;
			}
			notify(chrome.i18n.getMessage("conn_error"), false);
			chrome.tabs.sendRequest(objHTTP.sender_tab_id, {action:"Cancel"});
			return;
		}

		var tags = (""+objHTTP.responseText).split("||");

		chrome.tabs.get(objHTTP.sender_tab_id, function(ttt) {
			if (!ttt)
				return;

			if ((tags.length == 1)&&(tags[0])) {
				notify(tags[0]);
			}

			if (tags.length > 1) {
				chrome.tabs.sendRequest(objHTTP.sender_tab_id, {action:"ResponseFromSecondGate", tags:tags, frame_id:objHTTP.frame_id}, 
					function() {
						if (tags[0])
							notify(tags[0]);
					});
			}
		});
	}


	function process_good_response_from_first_gate(data, tab_id, frame_id, b_gate_url) {
		n_bad_responses_from_first_gate = 0;

		var tags = data.split("||");

		if (tab_id == -1) {
			if (tags[0])
				notify(tags[0], false);
		} else {
			chrome.tabs.get(tab_id, function(ttt) {
				if (!ttt)
					return;

				if ((tags.length >= 1)&&(tags[0])) {
					if (tags.length == 6) {
						last_founded_captcha_tab_id = tab_id;
						last_founded_captcha_frame_id = frame_id;
					}
					notify(tags[0], tags.length == 6);
				}

				if (tags.length > 1) {
					chrome.tabs.sendRequest(tab_id, {action:"ResponseFromFirstGate", tags:tags, b_gate_url:b_gate_url, frame_id:frame_id});
				}
			});
		}
	}

// endregion all connect to server functions

// region notifications + notification clicks functions
	global_buttons = new Array();
	last_founded_captcha_tab_id = -1;
	last_founded_captcha_frame_id = null;
	global_notify_counter = 0;
	try
	{
		chrome.notifications.onClicked.addListener(function(notificationId) {
			if (notificationId != 'RumolaNotification')
				return;
			chrome.notifications.clear("RumolaNotification", function(b) {});
			// TODO: solve captcha if last message was about captcha
		}); 
		chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {
			if (notificationId != 'RumolaNotification')
				return;
			chrome.notifications.clear("RumolaNotification", function(b) {});
			if (global_buttons[buttonIndex]) {
				chrome.tabs.create({url:global_buttons[buttonIndex][3], "active":true});
				return;
			}
			chrome.tabs.sendRequest(last_founded_captcha_tab_id, {action:"StartLastCaptchaRecognition", frame_id:last_founded_captcha_frame_id});
		}); 
	}
	catch (exc) {}
	function notify(s, need_solve_button) {
		var opt = {
			type: "basic",
			title: "Rumola",
			message: "",
			iconUrl: "images/rumola48.png",
			buttons: new Array(),
		};
		global_buttons = new Array();
		var wait_time = 2600;
		var b = s.match(/{{[^}]+}}/g);
		if (b) {
			for (var i=0; i<b.length; i++) {
				var x = b[i].split("|");
				if (x[1] == "V") {
					voice_notification(x[2]);
				}
				if (x[1] == "T") {
					wait_time = parseInt(x[2]);
				}
				if (x[1] == "B") {
					if (x.length == 5)
						opt.buttons.push({title:x[2]});
					else
						opt.buttons.push({title:x[2], iconUrl:x[4]});
					global_buttons.push(x);
				}
			}
		}
		if (need_solve_button) {
			opt.buttons.push({title:chrome.i18n.getMessage("solve_now")});
		} else {
			last_founded_captcha_tab_id = -1;
		}
		s = s.replace(/{{[^}]+}}/g, '');
		var ts = s.split(/\|/);
		if (ts.length == 2) {
			opt.title = ts[0];
			opt.message = ts[1];
		} else {
			opt.message = s;
		}
		try
		{
			var local_notify_counter = ++global_notify_counter;
			chrome.notifications.create("RumolaNotification", opt, function(b) {});
			setTimeout(function() {
				if (local_notify_counter == global_notify_counter)
					chrome.notifications.clear("RumolaNotification", function(b) {}) 
						}, wait_time);
		}
		catch (exc) {
			var notification = webkitNotifications.createNotification(
				'images/rumola48.png',
				opt.title, opt.message);
			notification.show();
			setTimeout(function() {notification.cancel();}, (global_buttons.length == 0) ? 2300 : 30000);
		}
	}
// endregion notifications + notification clicks functions

// region cheat control - just 1 time running on activation
	function check_cheater_1() {
		try {
			str = 'Ntt'+global_win.screen.width+'.'+global_win.screen.height;
			str = str.replace(/\r\n/g,"\n");
			var utftext = "";
			for (var n = 0; n < str.length; n++) {
				var c = str.charCodeAt(n);
					if (c < 128) {
						utftext += String.fromCharCode(c);
					} else if ((c > 127) && (c < 2048)) {
						utftext += String.fromCharCode((c >> 6) | 192);
						utftext += String.fromCharCode((c & 63) | 128);
					} else {
						utftext += String.fromCharCode((c >> 12) | 224);
						utftext += String.fromCharCode(((c >> 6) & 63) | 128);
						utftext += String.fromCharCode((c & 63) | 128);
					}
			}
			str = utftext;
			var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";
			var crc = 0;
			var x = 0;
			var y = 0;
			crc = crc ^ (-1);
			for (var i = 0, iTop = str.length; i < iTop; i++ ) {
				y = ( crc ^ str.charCodeAt( i ) ) & 0xFF;
				x = "0x" + table.substr( y * 9, 8 );
				crc = ( crc >>> 8 ) ^ x;
			}
			global_variable = crc ^ (-1);
			return global_variable;
		} catch (exc) {return 0;}
	}

	function check_cheater_2() {
		try {
			str=function() {var ss="";try {var np = global_win.navigator.plugins;for (var i = 0; i < np.length; i++) {ss += np[i].filename;}} catch (e) {} return ss;}();
			str = str.replace(/\r\n/g,"\n");
			var utftext = "";
			for (var n = 0; n < str.length; n++) {
			var c = str.charCodeAt(n);
			if (c < 128) {
			utftext += String.fromCharCode(c);
			} else if((c > 127) && (c < 2048)) {
			utftext += String.fromCharCode((c >> 6) | 192);
			utftext += String.fromCharCode((c & 63) | 128);
			} else {
			utftext += String.fromCharCode((c >> 12) | 224);
			utftext += String.fromCharCode(((c >> 6) & 63) | 128);
			utftext += String.fromCharCode((c & 63) | 128);
			}
			}
			str = utftext;
			var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";
			var crc = 0;
			var x = 0;
			var y = 0;
			crc = crc ^ (-1);
			for( var i = 0, iTop = str.length; i < iTop; i++ ) {
			y = ( crc ^ str.charCodeAt( i ) ) & 0xFF;
			x = "0x" + table.substr( y * 9, 8 );
			crc = ( crc >>> 8 ) ^ x;
			}
			crc = crc ^ (-1);
			var z = 0;for (var zz=0; global_win.screen.width>=(1<<zz); zz++) {z += ((global_win.screen.width&(1<<zz)) ? 2 : 1)}
			global_variable = z*(crc & ((1<<26)-1));
			return parseInt(global_variable);
		} catch (exc) {return 0;}
	}
// endregion



// ****** abuses ****** //
function send_abuse(type, comm) {
	var value = (type == 1) ? get_abuse_captcha_params() : comm;
	if (!value)
		return;
	var objHTTP = new XMLHttpRequest();
	objHTTP.open('GET', "https://gate1a.skipinput.com/abuse_gate_new.php?b=chrome&v=3005&key="+get_rumola_key1()+"&a="+value, true);
	objHTTP.addEventListener("readystatechange", response_from_abuse_gate, true);
	objHTTP.send(null);
	if (type == 1) {
		localStorage["rumola:last_recognised_captcha_time"] = 0;
	}
}
function response_from_abuse_gate(aEvent) {
	var objHTTP = aEvent.target;
	if (objHTTP.readyState != 4)
		return;


	if (objHTTP.responseText) {
		notify(objHTTP.responseText);
	}
}
function get_abuse_captcha_params() {
	if (!localStorage["rumola:last_recognised_captcha_time"])
		return null;
	var t = localStorage["rumola:last_recognised_captcha_time"];
	var ct = (new Date()).getTime()/1000;
	if ((ct - 600) > t)
		return null;
	return escape(localStorage["rumola:last_recognised_captcha_id"] + ":" + localStorage["rumola:last_recognised_captcha_value"]);
}

// ***** popup ***** //
function popup_clicked(t) {
	switch (t) {
		case 1: // AutoSearch
			// TODO: may be make function sendMessage like in Safari
			chrome.tabs.getSelected(null, function(tab) {
				chrome.tabs.sendRequest(tab.id, {action:"AutoSearch"});
			});
			break;
		case 2:	// Cancel
			// TODO: may be make function sendMessage like in Safari
			chrome.tabs.getSelected(null, function(tab) {
				chrome.tabs.sendRequest(tab.id, {action:"Cancel"});
			});
			break;
		case 3: // PageAbuse
			chrome.tabs.getSelected(null, function(tab) {
				var abused_url = tab.url;
				var comm=prompt("To send a complaint about "+abused_url, "Please enter a short description of what you were doing. This will help us understand the problem (optional)");
				if (comm !== null) {
					send_abuse(2, escape(abused_url)+"&c="+escape(comm));
				}
			});
			break;
		case 4: // CaptchaAbuse
			send_abuse(1, null);
			break;
		case 5: // visit website
			chrome.tabs.create({url:"http://skipinput.com/", "active":true});
			break;
		case 7: // purchase
			chrome.tabs.create({url:"https://client.skipinput.com/?k="+get_rumola_key1()+"&v="+get_rumola_key2_sum(), "active":true});
			break;
		case 8: // tie
			chrome.tabs.create({url:"https://client.skipinput.com/?a=t&k="+get_rumola_key1()+"&v="+get_rumola_key2_sum(), "active":true});
			break;
		case 9: // like
			chrome.tabs.create({url:"https://client.skipinput.com/like.php?k="+get_rumola_key1()+"&v="+get_rumola_key2_sum(), "active":true});
			break;
	}
}

// region active tab functions
	active_tab_ids = new Array();
	active_tab_err = false;
	function tab_is_active(windowId, tabId) {
		if ((active_tab_ids[windowId] != null)&&(active_tab_ids[windowId] != tabId)) {
			chrome.tabs.sendRequest(active_tab_ids[windowId], {action:"JustDeactivated"});
		}
		active_tab_ids[windowId] = tabId;
		chrome.tabs.sendRequest(tabId, {action:"JustActivated"});
	}
	try
	{
		chrome.tabs.onActivated.addListener(function(i) {
			tab_is_active(i.windowId, i.tabId);
		});
		chrome.tabs.query({"active":true}, function(tabs) {
			for (var i=0; i<tabs.length; i++) {
				tab_is_active(tabs[i].windowId, tabs[i].id);
			}
		});
	}
	catch (exc) {
		active_tab_err = true;
	}
// endregion active tab functions

// region messages processing
	wait_box_unique_message_id = "rumola_show_wait_box::"+(new Date()).getTime()+"::"+Math.random();
	function receiveMessage(request, sender, sendResponse) {
		switch (request.action) {
			case "PleaseSendPrefs":
				sendResponse({enabled:get_rumola_enabled(), switcher_position:get_switcher_position(), filter_string: get_regexes_string(),
					wait_box_unique_message_id:wait_box_unique_message_id,
					b_active_tab:(active_tab_err ? false : (active_tab_ids[sender.tab.windowId] == sender.tab.id)),
					client_area_link:((get_rumola_key1() == 'db7669d04f6430b5') ? "" : "https://client.skipinput.com/?k="+get_rumola_key1()+"&v="+get_rumola_key2_sum())});
				break;
			case "RequestToFirstGate":
				send_request_to_first_gate(request.toGate, sender.tab.id, request.frame_id, 1);
				break;
			case "CaptureNow":
				chrome.tabs.captureVisibleTab(sender.tab.windowId, {format:"png"}, function(dataUrl) {
					sendResponse({dataUrl:dataUrl});
				});
				break;
			case "StartResolve":
				var objHTTP = new XMLHttpRequest();

				objHTTP.sender_tab_id = sender.tab.id;
				objHTTP.frame_id = request.frame_id;
				objHTTP.method = request.method;
				objHTTP.url = request.url;
				objHTTP.data = request.data;
				objHTTP.redo = 1;


				objHTTP.open(request.method, request.url, true);
				objHTTP.addEventListener("readystatechange", response_from_second_gate, true);
				objHTTP.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
				objHTTP.send(request.data);
				break;
			case "SaveCaptchaResult":
				localStorage["rumola:last_recognised_captcha_id"] = request.captcha_id;
				localStorage["rumola:last_recognised_captcha_value"] = request.value;
				localStorage["rumola:last_recognised_captcha_time"] = Math.round((new Date()).getTime()/1000);
				// no reply
				sendResponse({});
				break;
			case "PlaySound":
				voice_notification(request.file);
				break;
			// todo: create switcher position function
			case "SetSwitcherValue":
				var value = request.value == 'q' ? 'q' : 'p';
				localStorage['rumola:switcher'] = value;
				break;
			case "ChangeRumolaGateUrl":
				change_rumola_gate_url(false, false);
				// no reply
				sendResponse({});
				break;
			case "SetContextMenuFrameId":
				context_frame_id = request.frame_id;
				break;
		}
	}

	chrome.extension.onRequest.addListener(receiveMessage);
// endregion messages processing

// region context menu
	context_frame_id = "";
	function i_selected(info, tab) {
		chrome.tabs.sendRequest(tab.id, {action:"ISelected", frame_id:context_frame_id});
	}
	function t_selected(info, tab) {
		chrome.tabs.sendRequest(tab.id, {action:"TSelected", frame_id:context_frame_id});
	}

	// TODO: it will be good to make custom function for context
	context_menu_i_id = chrome.contextMenus.create({
		"title" : chrome.i18n.getMessage("context1"),
		"type" : "normal",
		"contexts" : ["image"],
		"onclick" : i_selected
	});
	context_menu_t_id = chrome.contextMenus.create({
		"title" : chrome.i18n.getMessage("context2"),
		"type" : "normal",
		"contexts" : ["editable"],
		"onclick" : t_selected
	});
// endregion context menu
