const groups = ['all', 'free', 'paying'];
let activeGroup = '', timeoutId;
const searchStates = {
	'ok': 0,
	'run': 1,
	'err': 2
};

const filterItems = document.getElementsByClassName('filter-items')[0];
const [boardLoader, boardError] = document.getElementsByClassName('board-status')[0].children;
const board = document.getElementsByClassName('board')[0];
const queryElem = document.getElementById('querystring');

const searchStateChange = (newProcess) => {
	if (newProcess.state == searchStates.run) {
		boardLoader.classList.add('visible');
		boardError.classList.remove('visible');
	} else {
		boardLoader.classList.remove('visible');

		if (newProcess.state == searchStates.ok) {
			boardError.classList.remove('visible');
			console.log(newProcess.data);
		} else {
			// searchStates.err or unpredicted state! Don't remove old data and state, just re-enable actions and show error
			boardError.innerText = 'An error occured while loading data. Please retry.';
			boardError.classList.add('visible');

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

let queryData = (group = 'all', search = '') => {
	if (!groups.includes(group)) {
		group = 'all';
	}

	console.log(queryElem.value);

	Array.from(filterItems.children).forEach((child) => {
		child.classList.remove('active');
		if (child.classList.contains(group)) {
			child.classList.add('active');
		}
	});

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
		activeGroup = group;
		setTimeout((result) => {
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

// queryData();
exposeTask.queryData = throttle(queryData, 500);
queryElem.addEventListener('input', debounce(queryData, 500));