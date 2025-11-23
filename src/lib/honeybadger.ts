import Honeybadger from '@honeybadger-io/js';

export interface HoneybadgerConfig {
	apiKey: string;
	environment: string;
	revision?: string;
}

/**
 * Initialize Honeybadger with the provided configuration
 */
export function initHoneybadger(config: HoneybadgerConfig) {
	if (!config.apiKey) {
		console.warn('Honeybadger API key not provided - error tracking disabled');
		return null;
	}

	Honeybadger.configure({
		apiKey: config.apiKey,
		environment: config.environment,
		revision: config.revision,
		// Enable breadcrumbs for better context
		breadcrumbsEnabled: true,
		// Report console errors
		enableUncaught: true,
		enableUnhandledRejection: true
	});

	return Honeybadger;
}

export { Honeybadger };
