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

class Pagination {
	/**
	 * @param {Array} data
	 * @param {Number} step Before and after current
	 * @param {Number} selectedPage Selected page
	 */
	constructor(size = 0, step = 1, selectedPage = 1) {
		this.size = size; // Pages size
		this.page = selectedPage;
		this.step = step;
	}

	Build(targetElem) {
		const htmlFrag = document.createRange().createContextualFragment(`
<a>&#9668;</a>
<span></span>
<a>&#9658;</a>
`);// &#9668; ◄ previous button  |  &#9658; ► next button

		const frag = htmlFrag.querySelector('span');

		// Calculate the startPage and endPage.
		let startPage = this.page - this.step;
		let endPage = this.page + this.step;

		if (startPage <= 0) {
			endPage += -startPage + 1;
			startPage = 1;
		}

		if (endPage >= this.size) {
			startPage = Math.max(startPage - (endPage - this.size), 1);
			endPage = this.size;
		}

		// first
		if (startPage > 1) {
			frag.appendChild(document.createRange().createContextualFragment(
				`<a ${this.page === 1 ? 'class="current"' : ''}>1</a><i>...</i>`)
			);
		}

		// middle
		for (let page = startPage; page <= endPage; ++page) {
			frag.appendChild(document.createRange().createContextualFragment(
				`<a ${this.page === page ? 'class="current"' : ''}>${page}</a>`
			));
		}

		// last
		if (endPage < this.size) {
			frag.appendChild(document.createRange().createContextualFragment(
				`<i>...</i><a ${this.page === this.size ? 'class="current"' : ''}>${this.size}</a>`
			));
		}

		// middle "a" click
		htmlFrag.querySelectorAll('span a').forEach(aElem => {
			aElem.addEventListener('click', () => {
				this.page = + aElem.innerText;
				this.Build(targetElem);
			});
		});

		// Prev and next click
		const [aPrev, ...others] = htmlFrag.querySelectorAll('a');
		aPrev.addEventListener('click', () => {
			this.page--;
			if (this.page < 1) {
				this.page = 1;
			}
			this.Build(targetElem);
		});

		// next
		others.at(-1).addEventListener('click', () => {
			++this.page;
			if (this.page > this.size) {
				this.page = this.size;
			}
			this.Build(targetElem);
		});

		targetElem.innerHTML = ''; // clear
		targetElem.append(htmlFrag);
	}
}

helpers = {
	throttle,
	debounce,
	generateTableHTML,
	Pagination
};