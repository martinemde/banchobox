import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// Import translations statically to avoid loading issues
import enTranslations from './translations/en.json';
import esTranslations from './translations/es.json';

// Supported languages
export type Language = 'en' | 'es';

export const supportedLanguages: Record<Language, string> = {
	en: 'English',
	es: 'Español'
};

// Initialize language from localStorage synchronously
function getInitialLanguage(): Language {
	if (browser) {
		const savedLang = localStorage.getItem('bancho-language') as Language;
		if (savedLang && supportedLanguages[savedLang]) {
			return savedLang;
		}

		// Try to detect browser language
		const browserLang = navigator.language.toLowerCase();
		if (browserLang.startsWith('es')) {
			return 'es';
		}
	}
	return 'en';
}

// Current language store - initialize with proper language immediately
export const currentLanguage = writable<Language>(getInitialLanguage());

// Translation structure type
type TranslationStructure = {
	[key: string]: string | TranslationStructure;
};

// Store for translations - loaded immediately
const translations = writable<Record<Language, TranslationStructure>>({
	en: enTranslations,
	es: esTranslations
});

// Function to get nested translation value
function getNestedValue(obj: TranslationStructure, path: string): string {
	const keys = path.split('.');
	let current: any = obj;

	for (const key of keys) {
		if (current && typeof current === 'object' && key in current) {
			current = current[key];
		} else {
			return path; // Return the key if not found
		}
	}

	return typeof current === 'string' ? current : path;
}

// Derived store for current translations
export const t = derived([currentLanguage, translations], ([$currentLanguage, $translations]) => {
	const currentTranslations = $translations[$currentLanguage] || $translations.en || {};

	return (key: string, params?: Record<string, string>): string => {
		let translation = getNestedValue(currentTranslations, key);

		// Simple parameter substitution
		if (params) {
			Object.entries(params).forEach(([param, value]) => {
				translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), value);
			});
		}

		return translation;
	};
});

// Function to change language
export function setLanguage(lang: Language) {
	currentLanguage.set(lang);
	if (browser) {
		localStorage.setItem('bancho-language', lang);
	}
}
