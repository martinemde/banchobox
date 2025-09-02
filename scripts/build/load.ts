import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseCsv } from 'csv-parse/sync';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --------------------------
// CSV parsing + validation utilities
// --------------------------

export function boolFlag(value: unknown): boolean {
	if (typeof value !== 'string') return false;
	const v = value.trim().toLowerCase();
	return v === 'checked' || v === 'true' || v === 'yes';
}

export const optionalString = z
	.string()
	.optional()
	.transform((s) => (s && s.trim() !== '' ? s.trim() : undefined));

export const optionalNumber = optionalString.transform((s) => (s ? Number(s) : undefined));
export const optionalInt = optionalNumber.transform((n) => {
	return n != undefined && Number.isFinite(n) && Number.isInteger(n) ? n : undefined;
});
export const optionalPositiveInt = optionalInt.transform((n) => {
	return n != undefined && n > 0 ? n : undefined;
});
export const optionalNonNegativeInt = optionalInt.transform((n) => {
	return n != undefined && n >= 0 ? n : undefined;
});

export const optionalBoolean = optionalString.transform((s) => (s ? boolFlag(s) : false));

export function parseTable<T>(csvContent: string, schema: z.ZodType<T>, filename: string): T[] {
	const records = parseCsv(csvContent, {
		columns: true,
		skip_empty_lines: true,
		trim: true
	}) as Array<Record<string, string>>;
	if (records.length === 0) {
		console.warn(`${filename} has no data rows`);
		return [];
	}
	const out: T[] = [];
	for (let i = 0; i < records.length; i++) {
		const rec = records[i];
		const result = schema.safeParse(rec);
		if (!result.success) {
			const issues = result.error.issues
				.map((iss) => `${iss.path.join('.') || 'value'}: ${iss.message}`)
				.join('; ');
			const rowNum = i + 2; // account for header row
			throw new Error(`${filename} row ${rowNum}: ${issues}`);
		}
		out.push(result.data);
	}
	return out;
}

export function getDataPath(): string {
	return join(__dirname, '..', '..', 'data');
}

export function loadCsvFile(filename: string): string {
	return readFileSync(join(getDataPath(), filename), 'utf-8');
}
