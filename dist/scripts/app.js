(function() {
'use strict';

let helpers;

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

function debounce(callback, time) {
	var timeout;

	return function () {
		var context = this;
		var args = arguments;
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(function () {
			timeout = null;
			callback.apply(context, args);
		}, time);
	};
}

/* !
 * Sanitize an HTML string
 * (c) 2021 Chris Ferdinandi, MIT License, https://gomakethings.com
 * @param  {String}          str   The HTML string to sanitize
 * @param  {Boolean}         nodes If true, returns HTML nodes instead of a string
 * @return {String|NodeList}       The sanitized string or nodes
 */
function cleanHTML(str, nodes) {
	/**
	 * Convert the string to an HTML document
	 * @return {Node} An HTML document
	 */
	function stringToHTML() {
		let parser = new DOMParser();
		let doc = parser.parseFromString(str, 'text/html');

		return doc.body || document.createElement('body');
	}

	/**
	 * Remove <script> elements
	 * @param  {Node} html The HTML
	 */
	function removeScripts(html) {
		let scripts = html.querySelectorAll('script');
		for (let script of scripts) {
			script.remove();
		}
	}

	/**
	 * Check if the attribute is potentially dangerous
	 * @param  {String}  name  The attribute name
	 * @param  {String}  value The attribute value
	 * @return {Boolean}       If true, the attribute is potentially dangerous
	 */
	function isPossiblyDangerous(name, value) {
		let val = value.replace(/\s+/g, '').toLowerCase();
		if (['src', 'href', 'xlink:href'].includes(name)) {
			if (val.includes('javascript:') || val.includes('data:')) {
				return true;
			}
		}
		if (name.startsWith('on')) {
			return true;
		}
	}

	/**
	 * Remove potentially dangerous attributes from an element
	 * @param  {Node} elem The element
	 */
	function removeAttributes(elem) {
		// Loop through each attribute
		// If it's dangerous, remove it
		let atts = elem.attributes;
		for (let {name, value} of atts) {
			if (!isPossiblyDangerous(name, value)) {
				continue;
			}
			elem.removeAttribute(name);
		}
	}

	/**
	 * Remove dangerous stuff from the HTML document's nodes
	 * @param  {Node} html The HTML document
	 */
	function clean(html) {
		let nodes = html.children;
		for (let node of nodes) {
			removeAttributes(node);
			clean(node);
		}
	}

	// Convert the string to HTML
	let html = stringToHTML();

	// Sanitize it
	removeScripts(html);
	clean(html);

	// If the user wants HTML nodes back, return them
	// Otherwise, pass a sanitized string back
	return nodes ? html.childNodes : html.innerHTML;
}

function generateTableHTML(arr) {
	let table = `
	<table border="0" cellpadding="0" cellspacing="0" width="100%" class="board-table">
		<tr class="header-row">
			<td align="center" valign="top" class="pretend-row">
				<div class="pretend-row-wrapper">
					<table align="left" border="0" cellpadding="10" cellspacing="0" width="25%" class="responsive-column">
						<tr class="header-lg">
							<th>
								ID
							</th>
						</tr>
					</table>
					<table align="left" border="0" cellpadding="10" cellspacing="0" width="25%" class="responsive-column">
						<tr class="header-lg">
							<th>
								Company Name
							</th>
						</tr>
					</table>
					<table align="left" border="0" cellpadding="10" cellspacing="0" width="50%" class="description">
						<tr class="header-lg">
							<th>
								Owner email
							</th>
						</tr>
					</table>
				</div>
			</td>
		</tr>
	`;

	arr.forEach(item => {
		table += `
		<tr class="row">
			<td align="center" valign="top" class="pretend-row">
				<div class="pretend-row-wrapper">
					<table align="left" border="0" cellpadding="10" cellspacing="0" width="25%" class="responsive-column">
						<tr class="header">
							<th>
								ID
							</th>
						</tr>
						<tr>
							<td>
								${item._id}
							</td>
						</tr>
					</table>
					<table align="left" border="0" cellpadding="10" cellspacing="0" width="25%" class="responsive-column">
						<tr class="header">
							<th>
								Company Name
							</th>
						</tr>
						<tr>
							<td class="company-name">
								${item.name}
							</td>
						</tr>
					</table>
					<table align="left" border="0" cellpadding="10" cellspacing="0" width="50%" class="description">
						<tr class="header">
							<th>
								Owner email
							</th>
						</tr>
						<tr>
							<td>
								${item.wikiUrl}
							</td>
						</tr>
					</table>
				</div>
			</td>
		</tr>`;
	});

	table += '</table>';

	return table;
}

helpers = {
	throttle,
	debounce,
	cleanHTML,
	generateTableHTML
};
const groups = ['all', 'free', 'paying'], categories = ['Human,Elf', 'Human', 'Elf'], fetchMap = groups.reduce((acc, val, i) => {
	acc[val] = categories[i];

	return acc;
}, {});

let activeGroup = 'all', timeoutId;
const searchStates = {
	'ok': 0,
	'run': 1,
	'err': 2
};

const filterItems = document.getElementsByClassName('filter-items')[0],
	filterItemsList = Array.from(filterItems.children),
	filterItemsButtons = filterItemsList.map(child => child.children[0]);
const [boardLoader, boardError] = document.getElementsByClassName('board-status')[0].children;
const board = document.getElementsByClassName('board')[0];
const queryElem = document.getElementById('querystring');

const searchStateChange = (newProcess) => {
	board.innerHTML = (helpers.cleanHTML('')); // redundant but snyk might complain

	if (newProcess.state == searchStates.run) {
		boardLoader.classList.add('visible');
		boardError.classList.remove('visible');
	} else {
		boardLoader.classList.remove('visible');
		// filterItemsButtons.forEach(b => b.disabled = false);
		// queryElem.disabled = false;

		if (newProcess.state == searchStates.ok) {
			boardError.classList.remove('visible');
			board.innerHTML = helpers.cleanHTML(helpers.generateTableHTML(newProcess.data.docs));
		} else {
			// searchStates.err or unpredicted state! Don't remove old data and state, just return old group actions and show error
			boardError.innerText = 'An error occured while loading data. Please retry.';
			boardError.classList.add('visible');

			filterItemsList.forEach((child, index) => {
				child.classList.remove('active');
				if (child.classList.contains(activeGroup)) {
					child.classList.add('active');
				}
			});

			if (timeoutId) {
				clearTimeout(timeoutId);
			}

			timeoutId = setTimeout(() => {
				boardError.innerText = '';
				boardError.classList.remove('visible');
			}, 3000);
		}
	}
};

let queryData = (group, search) => {
	if (search == undefined) {
		search = queryElem.value;
	}

	if (!groups.includes(group)) {
		group = 'all';
	}

	filterItemsList.forEach((child, index) => {
		child.classList.remove('active');
		if (child.classList.contains(group)) {
			child.classList.add('active');
		}

		// filterItemsButtons[index].disabled = true;
	});
	// queryElem.disabled = true;

	searchStateChange({state: searchStates.run});

	const options = {
		method: 'GET',
		headers: {
			'Authorization': 'Bearer Og7tAreGFL52PLl9EB8p'
		}
	};

	// let prefix = 'test/test.json';
	let prefix = 'https://the-one-api.dev/v2/character';
	fetch(prefix + '?race=' + fetchMap[group] + (search ? `&name=/${search}/i` : '') + '&limit=10', options)
	.then((response) => {
		if (!response.ok) {
			throw new Error(response.statusText);
		}

		try {
			return response.json(); // will faIL if response.text() is empty or not json
		} catch (err) {
			throw new Error(err);
		}
	})
	.then((result) => {
		setTimeout((result) => {
			activeGroup = group;
			searchStateChange({state: searchStates.ok, data: result});
		}, 500, result);
	})
	.catch(err => {
		setTimeout((result) => {
			searchStateChange({state: searchStates.err, data: err});
		}, 500, err);
	});
};

queryData('all', '');
queryElem.addEventListener('input', helpers.debounce((event) => {
	queryData(activeGroup, event.target.value);
}, 500));

document.getElementsByClassName('search-form')[0].addEventListener('submit', () => {
	return false;
});

filterItemsButtons.forEach((button, i) => {
	button.addEventListener('click', () => {
		queryData(groups[i]);
	});
});
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

function winResize() {
	const w = window.innerWidth;
	if (w > 768) {
		menuToggle(true);
	} else {
		menuToggle(false);
	}
}

winResize();
window.addEventListener('resize', helpers.throttle(winResize, 250));

menuToggleElem.addEventListener('click', () => {
	menuToggle();
});

})();