import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	console.log('hook');
	if (event.url.pathname != '/login') {
		if (!event.cookies.get('auth')) {
			throw redirect(303, '/login');
		}

		let appRoutes = ['/tasks', '/logout'];
		if (!appRoutes.includes(event.url.pathname)) {
			throw redirect(303, '/login');
		}
	}
	const response = await resolve(event);
	return response;
};
