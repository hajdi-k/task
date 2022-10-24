var taskSpace = (function() {
'use strict';

let exposeTask = {}, helpers;

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

function generateTableHTML (arr) {
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
								${item.height}
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
								${item.title}
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
								${item.width}
							</td>
						</tr>
					</table>
				</div>
			</td>
		</tr>`;
	});

	table += `</table>`;

	return table;
}

helpers = {
	throttle,
	debounce,
	generateTableHTML
};
const groups = ['all', 'free', 'paying'];
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
	board.innerHTML= '';

	if (newProcess.state == searchStates.run) {
		boardLoader.classList.add('visible');
		boardError.classList.remove('visible');
	} else {
		boardLoader.classList.remove('visible');
		// filterItemsButtons.forEach(b => b.disabled = false);
		// queryElem.disabled = false;

		if (newProcess.state == searchStates.ok) {
			boardError.classList.remove('visible');
			// console.log(newProcess.data);
			board.innerHTML = generateTableHTML(newProcess.data.value);
		} else {
			// searchStates.err or unpredicted state! Don't remove old data and state, just return old group actions and show error
			boardError.innerText = 'An error occured while loading data. Please retry.';
			boardError.classList.add('visible');

			filterItemsList.forEach((child, index) => {
				child.classList.remove('active');
				if (child.classList.contains(activeGroup)) {
					child.classList.add('active');
				}
			})

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

	console.log(JSON.stringify(group), JSON.stringify(search));

	filterItemsList.forEach((child, index) => {
		child.classList.remove('active');
		if (child.classList.contains(group)) {
			child.classList.add('active');
		}

		// filterItemsButtons[index].disabled = true;
	})
	// queryElem.disabled = true;

	searchStateChange({state: searchStates.run});

	fetch('test/test.json', {
		method: 'GET'
	})
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

queryData('all', '');
exposeTask.queryData = helpers.throttle(queryData, 500);
queryElem.addEventListener('input', helpers.debounce((event) => {
	queryData(activeGroup, event.target.value);
}, 500));
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
window.addEventListener('resize', helpers.throttle(winResize, 250));

return exposeTask;

})();