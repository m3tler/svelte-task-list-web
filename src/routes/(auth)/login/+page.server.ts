import { PUBLIC_API_URL } from '$env/static/public';
import { fail, type Actions, redirect } from '@sveltejs/kit';
import { setContext } from 'svelte';

export const actions = {
	login: async ({ cookies, request }) => {
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

		const userSign = btoa(email + ':' + password);

		await fetch(PUBLIC_API_URL + '/auth', {
			headers: {
				Authorization: 'Basic ' + userSign
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
				cookies.set('auth', userSign);
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
