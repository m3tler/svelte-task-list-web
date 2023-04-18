import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
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
	response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
	response.headers.set('Expires', '0');
	response.headers.set('Pragma', 'no-cache');
	return response;
};
