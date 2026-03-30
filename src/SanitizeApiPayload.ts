/**
 * @module SanitizeApiPayload
 *
 * Deep-redaction of JSON-like API request/response payloads before logging (console, App Insights, etc.).
 */
// Copyright (c) 2025, 2026 Jon Verrier

/** Written in place of secret string values in API log snapshots. */
export const REDACTED_LOG_PLACEHOLDER = '[REDACTED]';

/** Ignore very short three-part strings so dotted prose is not redacted. */
const MIN_JWT_LIKE_STRING_LENGTH = 40;

/** JSON object keys whose non-empty string values must not appear in API logs. */
const KEYS_REDACT_NONEMPTY_STRING = new Set([
   'token',
   'googleToken',
   'access_token',
   'refresh_token',
   'id_token',
   'password',
   'client_secret',
   'secret'
]);

function stringLooksLikeCompactJwt(value: string): boolean {
   if (value.length < MIN_JWT_LIKE_STRING_LENGTH) {
      return false;
   }
   const parts = value.split('.');
   if (parts.length !== 3) {
      return false;
   }
   return parts.every((part) => part.length > 0);
}

/**
 * Returns a deep-cloned plain JSON shape with known secret fields and JWT-shaped strings redacted.
 * Intended for request/response bodies before `JSON.stringify` in log lines. Does not mutate the input.
 *
 * @param value - Parsed body or response data (plain JSON-serializable values)
 * @returns Same structure with sensitive strings replaced by {@link REDACTED_LOG_PLACEHOLDER}
 */
export function redactSensitivePayloadForApiLog(value: unknown): unknown {
   if (value === null || value === undefined) {
      return value;
   }
   if (typeof value === 'string') {
      return stringLooksLikeCompactJwt(value) ? REDACTED_LOG_PLACEHOLDER : value;
   }
   if (Array.isArray(value)) {
      return value.map((item) => redactSensitivePayloadForApiLog(item));
   }
   if (typeof value === 'object') {
      const record = value as Record<string, unknown>;
      const out: Record<string, unknown> = {};
      for (const [key, child] of Object.entries(record)) {
         if (typeof child === 'string' && child.length > 0) {
            if (KEYS_REDACT_NONEMPTY_STRING.has(key) || stringLooksLikeCompactJwt(child)) {
               out[key] = REDACTED_LOG_PLACEHOLDER;
            } else {
               out[key] = child;
            }
            continue;
         }
         out[key] = redactSensitivePayloadForApiLog(child);
      }
      return out;
   }
   return value;
}
