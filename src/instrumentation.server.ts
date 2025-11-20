import * as Sentry from '@sentry/sveltekit';

Sentry.init({
	dsn: process.env.PUBLIC_SENTRY_DSN,
	tracesSampleRate: 1.0
});
