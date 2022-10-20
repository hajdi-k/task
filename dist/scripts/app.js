var taskSpace = (function() {
'use strict';

let exposeTask = {};let bla = 5565;
function throttle(func, wait, options) {
	var context, args, result;
	var timeout = null;
	var previous = 0;
	if (!options) {
		options = {};
	}
	var later = function () {
		previous = options.leading === false ? 0 : Date.now();
		timeout = null;
		result = func.apply(context, args);
		if (!timeout) {
			context = args = null;
		}
	};

	return function () {
		var now = Date.now();
		if (!previous && options.leading === false) {
			previous = now;
		}
		var remaining = wait - (now - previous);
		context = this;
		args = arguments;
		if (remaining <= 0 || remaining > wait) {
			if (timeout) {
				clearTimeout(timeout);
				timeout = null;
			}
			previous = now;
			result = func.apply(context, args);
			if (!timeout) {
				context = args = null;
			}
		} else if (!timeout && options.trailing !== false) {
			timeout = setTimeout(later, remaining);
		}

		return result;
	};
}

let menuOpen = true;
const menuToggleElem = document.getElementsByClassName('menu-toggle')[0];
const filterMenuElem = document.getElementsByClassName('filter-menu')[0];

let menuToggle = (open) => {
	if (typeof open !== 'undefined') {
		menuOpen = open;
	} else {
		menuOpen = !menuOpen;
	}

	if (menuOpen) {
		if (!menuToggleElem.classList.contains('open')) {
			menuToggleElem.classList.toggle('open');
		}
		if (filterMenuElem.classList.contains('closed')) {
			filterMenuElem.classList.toggle('closed');
		}
	} else {
		if (menuToggleElem.classList.contains('open')) {
			menuToggleElem.classList.toggle('open');
		}
		if (!filterMenuElem.classList.contains('closed')) {
			filterMenuElem.classList.toggle('closed');
		}
	}

};

exposeTask.menuToggle = menuToggle;

function winResize() {
	const w = window.innerWidth;
	if (w > 768) {
		menuToggle(true);
	} else {
		menuToggle(false);
	}
}

winResize();
window.addEventListener('resize', throttle(winResize, 250));

return exposeTask;

})();