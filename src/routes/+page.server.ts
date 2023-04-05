import { fail, type Actions, redirect } from '@sveltejs/kit';

export const actions = {
	default: async ({ cookies, request }) => {
		const data = await request.formData();
		const email = data.get('email');
		const password = data.get('password');
		let status = 0;

		if (email == null || email == '') {
			return fail(400, { error: true, errorMessage: 'Nie wprowadzono emaila' });
		}

		if (password == null || password == '') {
			return fail(400, { error: true, errorMessage: 'Nie wprowadzono hasła' });
		}

		await fetch('http://localhost:8080/auth', {
			headers: {
				Authorization: 'Basic ' + btoa(email + ':' + password)
			}
		})
			.then((response) => {
				status = response.status;
			})
			.catch((error) => {
				console.log(error);
			});

		switch (status) {
			case 200: {
				cookies.set('auth', btoa(email + ':' + password));
				throw redirect(303, 'tasks');
			}
			case 401: {
				return fail(401, { error: true, errorMessage: 'Niepoprawny email lub hasło' });
			}
			default: {
				return fail(500, { error: true, errorMessage: 'Wystąpił błąd' });
			}
		}
	}
} satisfies Actions;
