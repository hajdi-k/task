const groups = ['all', 'free', 'paying'];
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