const groups = ['all', 'free', 'paying'];
const filterItems = document.getElementsByClassName('filter-items')[0];
let activeGroup = '';

let queryData = (group = 'all', search = '') => {
	if (!groups.includes(group)) {
		group = 'all';
	}

	activeGroup = '';

	setTimeout((filterItems) => {
		Array.from(filterItems.children).forEach((child) => {
			child.classList.remove('active');
			console.log(child.classList, group);
			if (child.classList.contains(group)) {
				child.classList.add('active');
				console.log('paying');
			}
		});
		activeGroup = group;
	}, 500, filterItems);
};

exposeTask.queryData = queryData;