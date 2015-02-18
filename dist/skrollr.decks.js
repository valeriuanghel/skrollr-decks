/*!
 * skrollr-decks 1.0.0
 * Fullpage presentation decks with scrolling
 * https://github.com/TrySound/skrollr-decks
 * 
 * Released under the MIT license
 * Copyright (c) 2015, Bogdan Chadkin <trysound@yandex.ru>
 */

(function (module) {
	"use strict";

	if( ! window.skrollr) {
		console.error('`skrollr` not found');
	} else {
		window.skrollr.decks = module(window, document, window.skrollr);
	}


} (function (window, document, skrollr) {
	"use strict";

	var defaults = {
		decks: '.skrollr-deck',
		offset: 15,
		duration: 600,
		easing: 'quadratic',
		delay: 500,
		autoscroll: true,
		onRender: null
	};



	var setTimeout = window.setTimeout,
		clearTimeout = window.clearTimeout,
		isInitialized = false,
		settings = {},
		segments = {},
		segmentsList = [],
		nav = document.createElement('ul');


	// Stop animating on scroll keys
	document.addEventListener('keydown', function (e) {
		var inst = skrollr.get(),
			keys = [38, 40,
					33, 34,
					36, 35];

		if(keys.indexOf(e.keyCode) > -1) {
			if(inst && inst.isAnimatingTo()) {
				inst.stopAnimateTo();
			}
		}
	}, false);

	// Auto resize
	window.addEventListener('resize', resizeDecks);

	// Auto initialize
	document.addEventListener('DOMContentLoaded', function () {
		var el = document.querySelector('.skrollr-decks-init');
		if(el && el.tagName === 'BODY') {
			init();
		}
	}, false);



	return {
		init: init,
		animateTo: animateTo,
		refresh: resizeDecks
	};




	// Initialize
	function init (user) {
		if(isInitialized) {
			return false;
		} else {
			isInitialized = true;
		}

		var key, inst, renderTimer;

		user = typeof user === 'object' ? user : {};
		for(key in defaults) if(defaults.hasOwnProperty(key)) {
			settings[key] = user[key] || defaults[key];
		}

		inst = skrollr.init({
			forceHeight: false
		});

		segments = findDecks(settings.decks, segmentsList);
		nav = createNav(segmentsList);

		resizeDecks();

		document.body.appendChild(nav);

		inst.refresh(nav.children);

		if(settings.autoscroll) {
			window.addEventListener('resize', update, false);
			inst.on('render', function (e) {
				clearTimeout(renderTimer);
				renderTimer = setTimeout(function () {
					update(e);
				}, settings.delay);
			});
		}
	}


	// Goto
	function animateTo(anchor, noAnim) {
		var el = segments[anchor],
			inst = skrollr.get(),
			top, active, index;

		if(inst) {
			inst.stopAnimateTo();

			if( ! el) {
				active = nav.getElementsByClassName('skrollable-between');
				if(active.length === 1) {
					index = Number(active[0].getAttribute('data-skrollr-decks-index'));
					el = segmentsList[anchor === 'up' ? index - 1 : anchor === 'down' ? index + 1 : -1];
				}

				if(active.length === 2) {
					active = active[anchor === 'up' ? 0 : anchor === 'down' ? 1 : -1];
					el = active ? segments[active.getAttribute('data-anchor-target')] : null;
				}
			}

			if(el) {
				top = inst.relativeToAbsolute(el, 'top', 'top') + 1;
				if(noAnim) {
					inst.setScrollTop(top, true);
				} else {
					inst.animateTo(top, settings);
				}

				return true;
			}
		}

		return false;
	}

	// Update decks size
	function resizeDecks() {
		var wndHeight = window.innerHeight + 2,
			deck, deckHeight, key;
		for(key in segments) if(segments.hasOwnProperty(key)) {
			deck = segments[key];
			deck.style.height = 'auto';
			deckHeight = deck.offsetHeight;
			deck.style.height = (deckHeight < wndHeight ? wndHeight : deckHeight) + 'px';
		}
	}





	// Autoscroll
	function update(e) {
		var inst = skrollr.get(),
			active = nav.getElementsByClassName('skrollable-between'),
			el, before, after;

		if(active.length === 2) {
			before = e.direction === 'up' ? 0 : 1;
			after = e.direction === 'up' ? 1 : 0;

			el = segments[active[before].getAttribute('data-anchor-target')];
			if( ! isVol(el)) {
				el = segments[active[after].getAttribute('data-anchor-target')];
			}
			inst.animateTo(inst.relativeToAbsolute(el, 'top', 'top') + 1, settings);
		}
	}

	function isVol(el) {
		var inst = skrollr.get(),
			top = inst.getScrollTop(),
			height = window.innerHeight,
			bottom = top + height,
			elTop = inst.relativeToAbsolute(el, 'top', 'top'),
			elBottom = inst.relativeToAbsolute(el, 'top', 'bottom'),
			offset =  height * settings.offset / 100;

		return elTop + offset < bottom  && elBottom - offset > top;
	}


	// Layout
	function findDecks(selector, list) {
		var items = {},
			start = +new Date(),
			el, i, id;

		if(typeof selector === 'string') {
			selector = document.querySelectorAll(selector);
			for(i = selector.length - 1; i > -1; i--) {
				el = selector[i];
				list.unshift(el);
				el.id = !! el.id ? el.id : 'skroll-deck-id-' + i;
				items['#' + el.id] = el;
			}
		}

		return items;
	}

	function createNav(list) {
		var frag = document.createElement('ul'),
			item = document.createElement('li'),
			i, max, el;

		frag.style.display = 'none';
		item.setAttribute('data-top-bottom', '');
		item.setAttribute('data-bottom-top', '');

		for(i = 0, max = list.length; i < max; i++) {
			el = item.cloneNode();
			el.setAttribute('data-skrollr-decks-index', i);
			el.setAttribute('data-anchor-target', '#' + list[i].id);
			frag.appendChild(el);
		}

		return frag;
	}

}));
