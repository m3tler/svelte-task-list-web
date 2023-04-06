import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname != '/login') {
		if (!event.cookies.get('auth')) {
			throw redirect(303, '/login');
		}
	}
	const response = await resolve(event);
	return response;
};
