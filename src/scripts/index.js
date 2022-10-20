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

	setTimeout((filterItems) => {
		activeGroup = group;
	}, 500, filterItems);
};

queryData();
exposeTask.queryData = queryData;