import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const userSign = cookies.get('auth');

	const tasks = await fetch('http://localhost:8080/tasks', {
		headers: {
			Authorization: 'Basic ' + userSign
		}
	})
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
