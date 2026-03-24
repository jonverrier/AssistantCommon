/**
 * @module dateFormat.test
 * Unit tests for DateFormat: ISO storage, en-GB display, strict stored parse, and legacy normalization.
 */
// Copyright (c) 2025, 2026 Jon Verrier

import { expect } from 'expect';
import { describe, it } from 'mocha';
import { InvalidParameterError } from '../src/Asserts';
import {
   formatDateForStorage,
   formatDateForUserCompact,
   formatDateForUserLong,
   parseStoredDate,
   parseUserDateToStorageDate
} from '../src/DateFormat';
import {
   formatDateForStorage as formatDateForStorageFromIndex,
   parseStoredDate as parseStoredDateFromIndex
} from '../src/index';

describe('DateFormat', () => {
   it('re-exports from package index match DateFormat module', () => {
      expect(formatDateForStorageFromIndex('2025-01-15')).toBe('2025-01-15');
      expect(parseStoredDateFromIndex('2025-01-15').getTime()).toBe(parseStoredDate('2025-01-15').getTime());
   });

   describe('formatDateForStorage', () => {
      it('formats a Date using local calendar components', () => {
         const d = new Date(2026, 2, 24, 15, 30, 0);
         expect(formatDateForStorage(d)).toBe('2026-03-24');
      });

      it('throws for invalid Date', () => {
         const bad = new Date(NaN);
         expect(() => formatDateForStorage(bad)).toThrow(InvalidParameterError);
      });

      it('normalizes ISO date-only strings', () => {
         expect(formatDateForStorage('2025-06-15')).toBe('2025-06-15');
      });

      it('normalizes legacy strings to ISO', () => {
         expect(formatDateForStorage('Saturday 20 September 2025')).toBe('2025-09-20');
         expect(formatDateForStorage('20250920')).toBe('2025-09-20');
         expect(formatDateForStorage('20/09/2025')).toBe('2025-09-20');
      });
   });

   describe('parseStoredDate', () => {
      it('parses strict YYYY-MM-DD to a Date at local noon', () => {
         const d = parseStoredDate('2025-08-09');
         expect(d.getFullYear()).toBe(2025);
         expect(d.getMonth()).toBe(7);
         expect(d.getDate()).toBe(9);
         expect(d.getHours()).toBe(12);
      });

      it('throws for invalid calendar dates', () => {
         expect(() => parseStoredDate('2025-13-01')).toThrow(InvalidParameterError);
         expect(() => parseStoredDate('2025-02-30')).toThrow(InvalidParameterError);
         expect(() => parseStoredDate('not-a-date')).toThrow(InvalidParameterError);
      });

      it('throws for datetime suffixes (stored value must be date-only)', () => {
         expect(() => parseStoredDate('2025-01-15T12:00:00')).toThrow(InvalidParameterError);
      });
   });

   describe('parseUserDateToStorageDate', () => {
      it('accepts ISO date-only and datetime prefixes', () => {
         expect(parseUserDateToStorageDate('2025-06-15')).toBe('2025-06-15');
         expect(parseUserDateToStorageDate('2025-08-09T12:00:00')).toBe('2025-08-09');
         expect(parseUserDateToStorageDate('2024-02-29')).toBe('2024-02-29');
      });

      it('accepts YYYYMMDD compact form', () => {
         expect(parseUserDateToStorageDate('20250920')).toBe('2025-09-20');
      });

      it('accepts slash forms YYYY/MM/DD and UK DD/MM/YYYY', () => {
         expect(parseUserDateToStorageDate('2025/09/20')).toBe('2025-09-20');
         expect(parseUserDateToStorageDate('20/09/2025')).toBe('2025-09-20');
      });

      it('accepts English long dates with weekday and optional ordinals', () => {
         expect(parseUserDateToStorageDate('Saturday 20 September 2025')).toBe('2025-09-20');
         expect(parseUserDateToStorageDate('Monday 5 January 2025')).toBe('2025-01-05');
         expect(parseUserDateToStorageDate('Monday 2nd February 2026')).toBe('2026-02-02');
      });

      it('accepts D Month YYYY without weekday', () => {
         expect(parseUserDateToStorageDate('20 September 2025')).toBe('2025-09-20');
      });

      it('rejects invalid and empty input', () => {
         expect(() => parseUserDateToStorageDate('')).toThrow(InvalidParameterError);
         expect(() => parseUserDateToStorageDate('2025-13-40')).toThrow(InvalidParameterError);
         expect(() => parseUserDateToStorageDate('Funday 5 January 2025')).toThrow(InvalidParameterError);
      });
   });

   describe('formatDateForUserCompact and formatDateForUserLong', () => {
      it('formats compact en-GB with two-digit year', () => {
         const s = formatDateForUserCompact('2025-06-15');
         expect(s).toMatch(/15\s+Jun\s+25/);
      });

      it('formats long en-GB with weekday and full month', () => {
         const s = formatDateForUserLong('2026-02-02');
         expect(s).toMatch(/Monday/);
         expect(s).toMatch(/2\s+February\s+2026/);
      });

      it('accepts Date input', () => {
         const d = new Date(2025, 10, 3, 12, 0, 0);
         expect(formatDateForUserCompact(d)).toMatch(/03\s+Nov\s+25/);
         expect(formatDateForUserLong(d)).toMatch(/Monday/);
      });
   });

   describe('Round trips', () => {
      it('storage round trip for parseStoredDate', () => {
         const iso = '2025-12-31';
         expect(formatDateForStorage(parseStoredDate(iso))).toBe(iso);
      });

      it('legacy long date to storage to compact display', () => {
         const iso = parseUserDateToStorageDate('Friday 29 February 2024');
         expect(iso).toBe('2024-02-29');
         expect(formatDateForStorage(iso)).toBe('2024-02-29');
         expect(formatDateForUserLong(iso)).toMatch(/Thursday/);
      });
   });
});
