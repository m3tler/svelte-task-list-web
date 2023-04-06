import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const userSign = cookies.get('auth');
	const options = {
		headers: {
			Authorization: 'Basic ' + userSign
		}
	};

	const params = new URLSearchParams({
		page: '0',
		size: '1',
		sortBy: 'id',
		sortOrder: 'asc'
	}).toString();

	const tasks = await fetch('http://localhost:8080/tasks?' + params, options)
		.then((response) => {
			if (response.ok) {
				return response.json();
			}
			throw new Error('Błąd podczas wczytywania danych');
		})
		.catch((error) => {
			console.log(error);
		});

	return { tasks, userSign };
};
