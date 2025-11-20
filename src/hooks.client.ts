import type { HandleClientError } from '@sveltejs/kit';
import { initHoneybadger } from '$lib/honeybadger';
import { env } from '$env/dynamic/public';

// Initialize Honeybadger for client-side error tracking
const honeybadger = initHoneybadger({
	apiKey: env.PUBLIC_HONEYBADGER_API_KEY || '',
	environment: env.PUBLIC_HONEYBADGER_ENVIRONMENT || 'production',
	revision: env.PUBLIC_HONEYBADGER_REVISION
});

// Handle client-side errors
export const handleError: HandleClientError = ({ error, event, status, message }) => {
	// Don't report 404s and other client errors
	if (status < 500) {
		return { message };
	}

	// Report client errors to Honeybadger
	if (honeybadger) {
		honeybadger.notify(error as Error, {
			context: {
				url: event.url.toString(),
				status,
				message
			}
		});
	}

	// Log to console for debugging
	console.error('Client error:', error);

	return {
		message: 'An unexpected error occurred'
	};
};
