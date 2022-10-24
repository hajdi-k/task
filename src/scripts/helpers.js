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

	table += '</table>';

	return table;
}

helpers = {
	throttle,
	debounce,
	generateTableHTML
};