var broadcaster;
var numOfBroadcasters = 0;
var pastBroadcasters = [];

$(document).ready(function() {

	window.CLIENT_ID = 'CLIENT_ID';

	$(function() {
		Twitch.init({clientId: CLIENT_ID}, function(error, status){
			// the sdk is now loaded

			if (status.authenticated) {
				// Show the data for logged-in users
				$('.authenticated').removeClass('hidden');

				loadUserInfo();
			} 
			else {
				// Show the twitch connect button
				$('.not-authenticated').removeClass('hidden');
			}
		});

		// Log in
		$(".twitch-connect").click(function() {
			Twitch.login({
				scope: ['user_read', 'channel_read']
			});
		});

		// Log out
		$("#logout").click(function() {
			Twitch.logout();
			window.location = window.location.pathname;
		}); 

		// --------------------------------------------------------

		// Add stream
		$("#add-stream button").click(function(){
			var broadcaster = $("#add-stream input").val();
			if (broadcaster.length === 0){
				alert("You gotta enter something!");
			}
			else {
				pastBroadcasters.push(broadcaster);
				$("#add-stream input").val("");
				loadNewStream(broadcaster);
			}
		});

		// Prevent warping
		$(".stream-wrapper a").click(function(e){
			e.preventDefault();
		});

		// Remove stream 
		$("#remove-stream").on("click", "li", function(){
			removeStream($(this).text());
		});

		// --------------------------------------------------------

		// Change chat 
		$("#change-chat").on("click", "li", function(){
			var currentChat = $(this).text();
			changeChat(currentChat);
		});

		// Hide chat
		$("#hide-chat").on("click", function(){
			hideChat();
		});

		// Reveal chat
		$("#reveal-chat").on("click", function(){
			revealChat();
		});

		// New stream from "following"
		$("#following").on("click", "li", function(){
			var broadcaster = $(this).text();
			pastBroadcasters.push(broadcaster);
			loadNewStream(broadcaster);
		});

		// --------------------------------------------------------

		// Activate grid view
		$("#set-grid").on("click", function(){
			gridSet();
		});

		// Acitvate list view
		$("#set-list").on("click", function(){
			listSet();
		});	
	});

	function loadUserInfo(){
		$("#following").mouseover(function(){
			Twitch.api({method: "/streams/followed"}, function(error, user) {
				// Empty the ul
				$("#following ul").empty();

				// Load user's followed streams
				for (var i = 0; i < user.streams.length; i++) {
					$("#following ul").append("<li>" + user.streams[i].channel.display_name + "</li>");
				};
			});
		})

		Twitch.api({method: "user"}, function(error, user) {
			// Display user's name
			$("#user div a").append(user.display_name);

			// Show user's logo. If no logo, show placeholder
			if (user.logo === null){
				$("#user div a").before("<img src='img/user-logo.png' class='user-logo' alt='Stream Monster Default Twitch User Logo'>");
			}
			else {
				$("#user div a").before("<img src='" + user.logo + "' class='user-logo' alt='" + user.display_name + " Twitch User Logo'>");
			}
		});
	}

	function loadNewStream(broadcaster){
		var newStream = {
			broadcasterName	: broadcaster,
			shellP1 		: "<object type='application/x-shockwave-flash'  height='378' width='620' id='live_embed_player_flash' data='http://www.twitch.tv/widgets/live_embed_player.swf?channel=",
			shellP2 		: "' bgcolor='#000000'><param name='allowFullScreen' value='true' /><param name='allowNetworking' value='all' /><param name='movie' value='http://www.twitch.tv/widgets/live_embed_player.swf' /><param name='flashvars' value='hostname=www.twitch.tv&channel=",
			shellP3 		: "&auto_play=false&start_volume=25' /></object>",
			chatP1			: "<iframe frameborder='0' scrolling='no' id='chat_embed' src='http://twitch.tv/chat/embed?channel=",
			chatP2			: "'&amp;popout_chat=true'></iframe>"
		}

		// HTML shell of new stream
		var fullStream = newStream.shellP1 + newStream.broadcasterName + newStream.shellP2 + newStream.broadcasterName + newStream.shellP3;
		var fullChat = newStream.chatP1 + newStream.broadcasterName + newStream.chatP2;

		// Append the new stream
		$(".stream-wrapper").append("<div id='" + newStream.broadcasterName + "' class='stream medium-12 columns' style='margin-bottom{30px}'><div class='stream-video'>" + fullStream + "</div></div>");

		// Make it responsive/fit to div
		$("#" + newStream.broadcasterName + " > .stream-video").fitVids();

		// Append the new chat
		$(".chat").addClass("hidden");
		$(".chat-wrapper").append("<div class='chat' id='" + newStream.broadcasterName + "-chat'>" + fullChat + "</div>");

		// Reveal "remove stream" and add chat to current chat list
		$("#remove-stream").removeClass("hidden");
		$("#remove-stream ul").append("<li>" + newStream.broadcasterName + "</li>");

		// Reveal "change chat" and add chat to current chat list
		$("#change-chat").removeClass("hidden");
		$("#change-chat ul").append("<li>" + newStream.broadcasterName + "</li>");

		// Reveal "hide chat"
		$("#hide-chat").removeClass("hidden");

		// Reveal "grid view"
		$("#set-grid").removeClass("hidden");

		// Reveal "list view"
		$("#set-list").removeClass("hidden");

		// Show and update current chat
		$(".current-chat").removeClass("hidden");
		$(".current-chat span").empty().append(newStream.broadcasterName);

		// Display notification
		$(".message").empty().append("<span>New stream added:</span> <br><h1>" + newStream.broadcasterName + "</h1>");
		$(".message").fadeIn("fast").delay(2000).fadeOut("fast");

		// Increment numOfBroadcasters
		numOfBroadcasters++;

		// Remove the intros
		if ($(".stream-intro").length){
			$(".stream-intro").remove();
			$(".chat-intro").remove();
		}

		// Scroll to new stream
		if (pastBroadcasters.length > 1){
			var scrollPos = $("#" + newStream.broadcasterName).offset().top - 70;
			$("html, body").animate({
				scrollTop: scrollPos
			},"fast")
		}
		else {
			$("html, body").animate({
				scrollTop: $(window).offset().top
			},"fast")
		}
		
	}

	function removeStream(stream){
		// Chosen div
		var removedStream = $("#" + stream).attr("id");

		// Remove stream from stream wrapper with matching ID
		$("#" + removedStream).remove();

		// Remove stream "change chat" and "remove stream"
		$("#change-chat li:contains('" + removedStream +"')").remove();
		$("#remove-stream li:contains('" + removedStream +"')").remove();

		// Remove chat
		$("#" + removedStream + "-chat").remove();

		// Decrement numOfBroadcasters
		numOfBroadcasters--;
	}

	function changeChat(currentChat){
		// Hide all classes
		$(".chat").addClass("hidden");

		// Show selected chat
		$("#" + currentChat + "-chat").removeClass("hidden");
		$(".current-chat span").empty().append(currentChat);
	}

	function hideChat(){
		// Hide chat section
		$(".chat-wrapper").hide().fadeOut();

		// Make stream full screen
		$(".stream-wrapper").removeClass("medium-8").addClass("medium-12").css("padding", "0 14%");

		// Swap menu options
		$("#hide-chat").addClass("hidden");
		$("#reveal-chat").removeClass("hidden");
	}

	function revealChat(){
		// Show chat section
		$(".chat-wrapper").show().fadeIn();

		// Make stream normal
		$(".stream-wrapper").removeClass("medium-12").addClass("medium-8").css("padding", "0 0.9375em");

		// Swap menu options
		$("#reveal-chat").addClass("hidden");
		$("#hide-chat").removeClass("hidden");
	}

	function gridSet(){
		// Determine if num of streams on page is whole number
		if (numOfBroadcasters  % 1 == 0) {
			$(".stream").removeClass("medium-1 medium-2 medium-3 medium-4 medium-6 medium-12");

			if (numOfBroadcasters === 1){
				// Do nothing
			}
			else if (numOfBroadcasters >= 2){
				$(".stream").addClass("medium-6 columns").css("padding", "0");
				$(".stream").css("margin-bottom", "0");
			}
		}
		else {
			alert("Looks like something broke. :(");
		}
	}

	function listSet(){
		$(".stream").removeClass("medium-1 medium-2 medium-3 medium-4 medium-6").css("padding", "0.9375em");
		$(".stream").css("margin-bottom", "30px");
	}

	function eventStreams(){
		var eventStream = {
			name 	: "",
			streams : [],
		}
	}
});