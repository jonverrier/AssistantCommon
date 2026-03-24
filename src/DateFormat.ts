/**
 * @module DateFormat
 * Shared date parsing and formatting: storage as ISO `YYYY-MM-DD`, compact UI (`ddd dd MMM yy` en-GB, e.g. Mon 16 Mar 26),
 * and long en-GB strings for MCP / query context. Parsing accepts common legacy shapes used across StrongAI.
 */
// Copyright (c) 2025, 2026 Jon Verrier

import { InvalidParameterError } from './Asserts';

const ISO_DATE_ONLY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;
const COMPACT_YMD_REGEX = /^(\d{4})(\d{2})(\d{2})$/;
const SLASH_YMD_REGEX = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/;
const SLASH_DMY_REGEX = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

const WEEKDAYS = new Set([
   'Monday',
   'Tuesday',
   'Wednesday',
   'Thursday',
   'Friday',
   'Saturday',
   'Sunday'
]);

const MONTH_NAMES = [
   'January',
   'February',
   'March',
   'April',
   'May',
   'June',
   'July',
   'August',
   'September',
   'October',
   'November',
   'December'
] as const;

const MONTH_INDEX: Readonly<Record<string, number>> = MONTH_NAMES.reduce((acc, name, i) => {
   acc[name] = i + 1;
   return acc;
}, {} as Record<string, number>);

const INVALID_DATE_PARAMETER_MESSAGE = 'Invalid date parameter.';
const INVALID_STORED_DATE_MESSAGE = 'Invalid stored date string; expected YYYY-MM-DD.';
const INVALID_LEGACY_DATE_MESSAGE = 'Unrecognized date string; could not normalize to YYYY-MM-DD.';

/**
 * Validates Gregorian calendar date components in the local timezone.
 * @param year - Full year
 * @param month - Month 1–12
 * @param day - Day 1–31
 * @returns True if the date exists on the calendar
 */
function isValidCalendarDate(year: number, month: number, day: number): boolean {
   if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
      return false;
   }
   if (month < 1 || month > 12 || day < 1) {
      return false;
   }
   const constructed = new Date(year, month - 1, day);
   return (
      constructed.getFullYear() === year &&
      constructed.getMonth() === month - 1 &&
      constructed.getDate() === day
   );
}

/**
 * Returns true when a hyphenated ISO date string was auto-corrected by the `Date` constructor
 * (e.g. 2025-02-30 → March 2).
 * @param originalDateStr - Original user or stored fragment
 * @param parsedDate - Parsed `Date`
 */
function isIsoDateAutoCorrected(originalDateStr: string, parsedDate: Date): boolean {
   const isoMatch = originalDateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
   if (!isoMatch) {
      return false;
   }
   const originalYear = parseInt(isoMatch[1], 10);
   const originalMonth = parseInt(isoMatch[2], 10);
   const originalDay = parseInt(isoMatch[3], 10);
   return (
      parsedDate.getFullYear() !== originalYear ||
      parsedDate.getMonth() !== originalMonth - 1 ||
      parsedDate.getDate() !== originalDay
   );
}

/**
 * @param year - Year
 * @param month - Month 1–12
 * @param day - Day of month
 * @returns ISO date-only string `YYYY-MM-DD`
 */
function formatDatePartsLocal(year: number, month: number, day: number): string {
   return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Parses strict ISO date-only `YYYY-MM-DD` into local calendar components.
 * @param trimmed - Trimmed input
 * @returns `{ year, month, day }` or `null` if not a valid ISO date-only value
 */
function tryParseIsoDateOnly(trimmed: string): { year: number; month: number; day: number } | null {
   const m = trimmed.match(ISO_DATE_ONLY_REGEX);
   if (!m) {
      return null;
   }
   const year = parseInt(m[1], 10);
   const month = parseInt(m[2], 10);
   const day = parseInt(m[3], 10);
   if (!isValidCalendarDate(year, month, day)) {
      return null;
   }
   return { year, month, day };
}

/**
 * Parses `YYYYMMDD` (e.g. ingest filenames).
 * @param trimmed - Trimmed input
 */
function tryParseCompactYmd(trimmed: string): { year: number; month: number; day: number } | null {
   const m = trimmed.match(COMPACT_YMD_REGEX);
   if (!m) {
      return null;
   }
   const year = parseInt(m[1], 10);
   const month = parseInt(m[2], 10);
   const day = parseInt(m[3], 10);
   if (!isValidCalendarDate(year, month, day)) {
      return null;
   }
   return { year, month, day };
}

/**
 * Parses `YYYY/MM/DD` (slashes, ISO component order).
 * @param trimmed - Trimmed input
 */
function tryParseSlashYmd(trimmed: string): { year: number; month: number; day: number } | null {
   const m = trimmed.match(SLASH_YMD_REGEX);
   if (!m) {
      return null;
   }
   const year = parseInt(m[1], 10);
   const month = parseInt(m[2], 10);
   const day = parseInt(m[3], 10);
   if (!isValidCalendarDate(year, month, day)) {
      return null;
   }
   return { year, month, day };
}

/**
 * Parses `DD/MM/YYYY` (UK order, used across legacy data).
 * @param trimmed - Trimmed input
 */
function tryParseSlashDmyUk(trimmed: string): { year: number; month: number; day: number } | null {
   const m = trimmed.match(SLASH_DMY_REGEX);
   if (!m) {
      return null;
   }
   const day = parseInt(m[1], 10);
   const month = parseInt(m[2], 10);
   const year = parseInt(m[3], 10);
   if (!isValidCalendarDate(year, month, day)) {
      return null;
   }
   return { year, month, day };
}

/**
 * True when the first token looks like a weekday name (`…day`) but is not a real English weekday.
 * Prevents `new Date('Funday 5 January 2025')` from silently accepting Jan 5.
 * @param trimmed - Trimmed input
 */
function firstTokenIsInvalidWeekday(trimmed: string): boolean {
   const first = trimmed.split(/\s+/)[0];
   if (!first) {
      return false;
   }
   const lower = first.toLowerCase();
   if (!lower.endsWith('day') || lower.length < 5) {
      return false;
   }
   const normalized = first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
   return !WEEKDAYS.has(normalized);
}

/**
 * Strips English weekday prefix and day ordinals for `Date` fallback parsing.
 * @param s - Raw string
 */
function normalizeLooseEnglishDateString(s: string): string {
   let out = s.trim();
   out = out.replace(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*,?\s+/i, '');
   out = out.replace(/(\d+)(st|nd|rd|th)\b/gi, '$1');
   return out.trim();
}

/**
 * Tries "Weekday D Month YYYY" (full English month names) or "D Month YYYY".
 * @param trimmed - Trimmed input
 */
function tryParseEnglishLongDate(trimmed: string): { year: number; month: number; day: number } | null {
   let working = trimmed.replace(/(\d+)(st|nd|rd|th)\b/gi, '$1');
   const parts = working.split(/\s+/).filter(Boolean);
   if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const monthName = parts[1];
      const year = parseInt(parts[2], 10);
      const month = MONTH_INDEX[monthName];
      if (month !== undefined && !isNaN(day) && !isNaN(year) && isValidCalendarDate(year, month, day)) {
         return { year, month, day };
      }
      return null;
   }
   if (parts.length < 4) {
      return null;
   }
   const weekday = parts[0];
   const day = parseInt(parts[1], 10);
   const monthName = parts[2];
   const year = parseInt(parts[3], 10);
   if (!WEEKDAYS.has(weekday)) {
      return null;
   }
   const month = MONTH_INDEX[monthName];
   if (month === undefined || isNaN(day) || isNaN(year)) {
      return null;
   }
   if (!isValidCalendarDate(year, month, day)) {
      return null;
   }
   return { year, month, day };
}

/**
 * Fallback: `Date.parse` after light normalization; rejects auto-corrected ISO fragments.
 * Invalid `YYYY-MM-DD` strings must not be "fixed" by the `Date` constructor (e.g. 2025-02-30).
 * @param trimmed - Trimmed input
 */
function tryParseJavaScriptDateFallback(trimmed: string): { year: number; month: number; day: number } | null {
   const isoHeadMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
   if (isoHeadMatch) {
      const head = isoHeadMatch[1];
      if (!tryParseIsoDateOnly(head)) {
         return null;
      }
   }

   if (firstTokenIsInvalidWeekday(trimmed)) {
      return null;
   }

   const normalized = normalizeLooseEnglishDateString(trimmed);
   const parsed = new Date(normalized);
   if (isNaN(parsed.getTime())) {
      return null;
   }
   if (trimmed.match(/^\d{4}-\d{1,2}-\d{1,2}/) && isIsoDateAutoCorrected(trimmed, parsed)) {
      return null;
   }
   const year = parsed.getFullYear();
   const month = parsed.getMonth() + 1;
   const day = parsed.getDate();
   if (!isValidCalendarDate(year, month, day)) {
      return null;
   }
   return { year, month, day };
}

/**
 * Coerces a `Date` or ISO/legacy string to a calendar date for display.
 * @param date - `Date` or parseable string
 */
function coerceToCalendarDate(date: Date | string): { year: number; month: number; day: number } {
   if (date instanceof Date) {
      if (isNaN(date.getTime())) {
         throw new InvalidParameterError(INVALID_DATE_PARAMETER_MESSAGE);
      }
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return { year, month, day };
   }
   if (typeof date !== 'string') {
      throw new InvalidParameterError(INVALID_DATE_PARAMETER_MESSAGE);
   }
   const iso = parseUserDateToStorageDate(date);
   const parts = tryParseIsoDateOnly(iso);
   if (!parts) {
      throw new InvalidParameterError(INVALID_DATE_PARAMETER_MESSAGE);
   }
   return parts;
}

/**
 * Always returns ISO date only `YYYY-MM-DD` for persistence and API.
 * @param date - `Date` or user/legacy string
 * @returns ISO date-only string
 */
export function formatDateForStorage(date: Date | string): string {
   if (date instanceof Date) {
      if (isNaN(date.getTime())) {
         throw new InvalidParameterError(INVALID_DATE_PARAMETER_MESSAGE);
      }
      return formatDatePartsLocal(date.getFullYear(), date.getMonth() + 1, date.getDate());
   }
   if (typeof date !== 'string') {
      throw new InvalidParameterError(INVALID_DATE_PARAMETER_MESSAGE);
   }
   return parseUserDateToStorageDate(date);
}

/**
 * Short human-readable format for web/UI (en-GB weekday abbreviation + `dd MMM yy`, e.g. Mon 16 Mar 26).
 * Built from separate `toLocaleDateString` calls so en-GB does not insert a comma after the weekday.
 * @param date - `Date` or parseable string
 */
export function formatDateForUserCompact(date: Date | string): string {
   const { year, month, day } = coerceToCalendarDate(date);
   const d = new Date(year, month - 1, day, 12, 0, 0, 0);
   const weekday = d.toLocaleDateString('en-GB', { weekday: 'short' });
   const rest = d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
   });
   return `${weekday} ${rest}`;
}

/**
 * Long en-GB format for MCP and query context (weekday, full month, four-digit year).
 * @param date - `Date` or parseable string
 */
export function formatDateForUserLong(date: Date | string): string {
   const { year, month, day } = coerceToCalendarDate(date);
   const d = new Date(year, month - 1, day, 12, 0, 0, 0);
   return d.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
   });
}

/**
 * Parses a stored ISO `YYYY-MM-DD` value to a `Date` at local noon (avoids DST edge cases on the same calendar day).
 * @param value - Strict ISO date-only string
 * @returns `Date` in local timezone
 */
export function parseStoredDate(value: string): Date {
   if (typeof value !== 'string') {
      throw new InvalidParameterError(INVALID_STORED_DATE_MESSAGE);
   }
   const parts = tryParseIsoDateOnly(value.trim());
   if (!parts) {
      throw new InvalidParameterError(INVALID_STORED_DATE_MESSAGE);
   }
   return new Date(parts.year, parts.month - 1, parts.day, 12, 0, 0, 0);
}

/**
 * Parses user-facing or legacy input and returns ISO `YYYY-MM-DD` for storage.
 * Accepts: strict ISO date and datetime prefixes, `YYYYMMDD`, `YYYY/MM/DD`, `DD/MM/YYYY` (UK),
 * English long dates (`Saturday 20 September 2025`, `20 September 2025`), and limited `Date`-parseable strings.
 * @param value - Raw date string
 * @returns ISO date-only string
 */
export function parseUserDateToStorageDate(value: string): string {
   if (typeof value !== 'string') {
      throw new InvalidParameterError(INVALID_LEGACY_DATE_MESSAGE);
   }
   const trimmed = value.trim();
   if (trimmed.length === 0) {
      throw new InvalidParameterError(INVALID_LEGACY_DATE_MESSAGE);
   }

   const isoPrefix = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
   if (isoPrefix) {
      const head = isoPrefix[1];
      const parts = tryParseIsoDateOnly(head);
      if (parts) {
         return formatDatePartsLocal(parts.year, parts.month, parts.day);
      }
   }

   const attempts: Array<{ year: number; month: number; day: number } | null> = [
      tryParseIsoDateOnly(trimmed),
      tryParseCompactYmd(trimmed),
      tryParseSlashYmd(trimmed),
      tryParseSlashDmyUk(trimmed),
      tryParseEnglishLongDate(trimmed),
      tryParseJavaScriptDateFallback(trimmed)
   ];

   for (const result of attempts) {
      if (result) {
         return formatDatePartsLocal(result.year, result.month, result.day);
      }
   }

   throw new InvalidParameterError(INVALID_LEGACY_DATE_MESSAGE);
}
