import type { Handle, HandleServerError } from '@sveltejs/kit';
import { initHoneybadger } from '$lib/honeybadger';
import { env } from '$env/dynamic/private';

// Initialize Honeybadger for server-side error tracking
const honeybadger = initHoneybadger({
	apiKey: env.HONEYBADGER_API_KEY || '',
	environment: env.HONEYBADGER_ENVIRONMENT || 'production',
	revision: env.HONEYBADGER_REVISION
});

// Handle server-side errors
export const handleError: HandleServerError = ({ error, event, status, message }) => {
	// Don't report 404s and other client errors
	if (status < 500) {
		return { message };
	}

	// Report server errors to Honeybadger
	if (honeybadger) {
		honeybadger.notify(error as Error, {
			context: {
				url: event.url.toString(),
				method: event.request.method,
				status,
				message
			}
		});
	}

	// Log to console for local development
	console.error('Server error:', error);

	return {
		message: 'An unexpected error occurred'
	};
};

// Optional: Add request tracking
export const handle: Handle = async ({ event, resolve }) => {
	// Add breadcrumb for each request
	if (honeybadger) {
		honeybadger.addBreadcrumb('HTTP Request', {
			metadata: {
				url: event.url.toString(),
				method: event.request.method
			}
		});
	}

	const response = await resolve(event);
	return response;
};
