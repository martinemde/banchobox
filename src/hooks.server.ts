import { sequence } from '@sveltejs/kit/hooks';
import { handleErrorWithSentry, initCloudflareSentryHandle, sentryHandle } from '@sentry/sveltekit';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = sequence(
	initCloudflareSentryHandle({
		dsn: process.env.PUBLIC_SENTRY_DSN,
		tracesSampleRate: 1.0,
		sendDefaultPii: true
	}),
	sentryHandle()
);

export const handleError = handleErrorWithSentry();
