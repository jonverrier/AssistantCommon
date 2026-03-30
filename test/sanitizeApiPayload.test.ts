/**
 * @module sanitizeApiPayload.test
 *
 * Unit tests for {@link redactSensitivePayloadForApiLog}.
 */
// Copyright (c) 2025, 2026 Jon Verrier

import { expect } from 'expect';
import { describe, it } from 'mocha';
import { REDACTED_LOG_PLACEHOLDER, redactSensitivePayloadForApiLog } from '../src/SanitizeApiPayload';

describe('redactSensitivePayloadForApiLog', () => {
   it('redacts token and googleToken string fields', () => {
      const out = redactSensitivePayloadForApiLog({
         token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.signature',
         googleToken: 'aa.bb.cc',
         email: 'user@example.com'
      }) as Record<string, unknown>;
      expect(out.token).toBe(REDACTED_LOG_PLACEHOLDER);
      expect(out.googleToken).toBe(REDACTED_LOG_PLACEHOLDER);
      expect(out.email).toBe('user@example.com');
   });

   it('redacts JWT-shaped strings by heuristic even without known key', () => {
      const jwtLike =
         'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      const out = redactSensitivePayloadForApiLog({ nested: { value: jwtLike } }) as {
         nested: { value: string };
      };
      expect(out.nested.value).toBe(REDACTED_LOG_PLACEHOLDER);
   });

   it('does not redact short three-part strings', () => {
      const out = redactSensitivePayloadForApiLog({ note: 'a.b.c' }) as { note: string };
      expect(out.note).toBe('a.b.c');
   });
});
