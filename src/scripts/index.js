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
	board.innerHTML = '';

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
			board.innerHTML = helpers.generateTableHTML(newProcess.data.value);
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

	console.log(JSON.stringify(group), JSON.stringify(search));

	filterItemsList.forEach((child, index) => {
		child.classList.remove('active');
		if (child.classList.contains(group)) {
			child.classList.add('active');
		}

		// filterItemsButtons[index].disabled = true;
	});
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