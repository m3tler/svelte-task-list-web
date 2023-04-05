export async function load() {
	const options = {
		headers: {
			Authorization: 'Basic ' + btoa('admin@admin.pl' + ':' + 'admin')
		}
	};

	const params = new URLSearchParams({
		page: '0',
		size: '1',
		sortBy: 'id',
		sortOrder: 'asc'
	}).toString();

	const data = await fetch('http://localhost:8080/tasks?' + params, options)
		.then((response) => {
			if (response.ok) {
				return response.json();
			}
			throw new Error('Błąd podczas wczytywania danych');
		})
		.catch((error) => {
			console.log(error);
		});

	return data;
}
