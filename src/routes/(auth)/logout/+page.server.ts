import { redirect, type Actions } from '@sveltejs/kit';

export const actions = {
	logout: async ({ cookies }) => {
		cookies.delete('auth');
		throw redirect(303, '/login');
	}
} satisfies Actions;
