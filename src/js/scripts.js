// FOR DEBUG ONLY!
window.onload = function(e){
	jQuery(document).ready(function($){
		function getWindowSize(){
			var ww = window.innerWidth,
				wh = window.innerHeight;
			debugPanel.text(ww+' x '+wh);
		}
		$('body').append('<div class="js-ws"></div>');
		var debugPanel = $('.js-ws');
		debugPanel.css({
			'position': 'fixed',
			'font-size': '11px',
			'bottom': 0,
			'right': '5vw',
			'background': 'rgba(0,0,0,.3)',
			'color': 'white',
			'padding': (10 / 1920 * 100) + 'vw',
			'z-index': 2000
		});
		getWindowSize();
		$(window).on('resize', getWindowSize);
	});
};
// FOR DEBUG ONLY!





$(function() {

	var is_touch = 'ontouchstart' in window || (window.DocumentTouch && document instanceof window.DocumentTouch) || navigator.maxTouchPoints > 0 || window.navigator.msMaxTouchPoints > 0,//'ontouchstart' in window,
		is_ios = ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform) || (navigator.userAgent.includes("Mac") && "ontouchend" in document),
		is_ie = navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > -1,
		is_video_playing = false;

	function video_to_pause() {
		$('.js-testimonials-video').each( function() {
			if ( ! $(this).hasClass('vjs-paused') ) {
				var video_id = $(this).attr('id');
				videojs(video_id).pause();
				is_video_playing = false;
			}
		});
	}


	$('.js-menu-toggle').on('click', function(event) {
		event.preventDefault();
		if ($('body').hasClass('menu__open')) {
			$('body').removeClass('menu__open');
		} else {
			$('body').addClass('menu__open');
		}
	});



	const player = videojs('broadcast-video', {fluid: true}, () => {
		player.src({ type: 'video/youtube', src: 'https://www.youtube.com/watch?v=xSo7WElQfWs' })
		// player.play()
	});


/*
	if ($('.speakers__photo img').length) {

		for (var i = 0; i < $('.speakers__photo img').length; i++) {
			$('.speakers__photo').eq(i).append('<canvas width="360" height="360">');
			var canvas = $('.speakers__photo').eq(i).find('canvas'),
				canvas_width = 360,
				canvas_height = 360,
				ctx = canvas[0].getContext('2d'),
				imgs = new Array(),

				// Replace path in 'photo' variable value with your own
				photo = $('.speakers__photo img').eq(i).attr('src'),

				mask = 'img/speakers/mask.svg',
				mask_width = 320,
				mask_height = 360,
				counter = 0;

	 		// Create canvas based on background image (photo) and mask image
			function preloadImages(sources) {
				for (var i = 0; i < sources.length; i++) {
					imgs[i] = new Image();
					// Adding a random symbols to prevent caching of images
					sources[i] += '?' + Math.random();

					imgs[i].onload = imgs[i].onerror = function() {
						counter++; console.log( sources.length );
						// If all images loaded then draw on canvas
						if (counter == sources.length) {
							// Recalculate canvas height based on mask size
							// canvas_height = canvas_width * mask_height / mask_width;
							// canvas.attr('height', canvas_height);
							// Draw images with overlay using the subtraction method
							ctx.globalCompositeOperation = 'destination-atop';
							ctx.drawImage(imgs[0], 0, 0, canvas_width, canvas_height);
							ctx.drawImage(imgs[1], 20, 0, mask_width, mask_height);
						}
					}
					imgs[i].src = sources[i];
				}
			}
		
			// Pass paths of background image (photo) and mask to function
			preloadImages([photo, mask]);
		}
	}
*/
});