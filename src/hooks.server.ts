import { redirect, type Handle, type HandleFetch } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname != '/') {
		if (!event.cookies.get('auth')) {
			throw redirect(303, '/');
		}
	}
	const response = await resolve(event);
	return response;
};

export const handleFetch = (({ request, fetch }) => {
	console.log('fetch');

	return fetch(request);
}) satisfies HandleFetch;
