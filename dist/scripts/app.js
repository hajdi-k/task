var taskSpace = (function() {
'use strict';

let exposeTask = {};const groups = ['all', 'free', 'paying'];
const filterItems = document.getElementsByClassName('filter-items')[0];
let activeGroup = '';

let queryData = (group = 'all', search = '') => {
	if (!groups.includes(group)) {
		group = 'all';
	}

	activeGroup = '';
	Array.from(filterItems.children).forEach((child) => {
		child.classList.remove('active');
		if (child.classList.contains(group)) {
			child.classList.add('active');
		}
	});

	// setTimeout((filterItems) => {
	// 	activeGroup = group;
	// }, 500, filterItems);

	fetch('test/test.json', {
		method: 'GET'
	})
	.then(response => response.json())
	.then(response => console.log(response))
	.catch(err => console.error(err));

	/* const options = {
		method: 'GET',
		headers: {
			'X-RapidAPI-Key': 'bfd3cdb7bfmsh09a78309ee1ff00p16d4cejsna177a7c77a2f',
			'X-RapidAPI-Host': 'contextualwebsearch-websearch-v1.p.rapidapi.com'
		}
	};

	fetch('https://contextualwebsearch-websearch-v1.p.rapidapi.com/api/Search/ImageSearchAPI?q=taylor%20swift&pageNumber=1&pageSize=10&autoCorrect=true', options)
	.then(response => response.json())
	.then(response => console.log(response))
	.catch(err => console.error(err)); */
};

queryData();
exposeTask.queryData = queryData;
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