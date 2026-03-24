/**
 * @module AssistantCommon
 * 
 * Common utilities for the StrongAI Assistant project, including assertion functions,
 * custom error classes, and string sanitization utilities.
 */

// Copyright (c) 2025, 2026 Jon Verrier

// ===Start StrongAI Generated Comment (20260219)===
// AssistantCommon centralizes common utilities for the StrongAI Assistant codebase. It exposes assertion helpers, domain-specific error types, and string sanitizers so other modules can depend on a single, consistent source.
// 
// throwIfUndefined, throwIfNull, and throwIfFalse validate inputs and state. They immediately throw when a required value is missing, null, or an expected condition is false. Use them to fail fast and simplify guard clauses.
// 
// LoggedError represents an error that can carry logging context. InvalidParameterError signals bad caller input. InvalidOperationError indicates an action that is not valid in the current context. ConnectionError captures transport or service connectivity failures. InvalidStateError reports an unexpected or illegal internal state. These typed errors support clearer control flow and better diagnostics.
// 
// sanitizeInputString cleans inbound text to prevent unsafe or malformed content from entering the system. sanitizeOutputString prepares text for display or transmission, removing or escaping problematic characters.
// 
// DateFormat centralizes ISO calendar storage strings, en-GB compact (weekday + date) and long display formatting, strict parse for stored values, and legacy-to-ISO parsing for migrations and ingest.
// 
// This module re-exports its functionality from internal modules: ./Asserts, ./Sanitize, and ./DateFormat.
// ===End StrongAI Generated Comment===

export {
   throwIfUndefined,
   throwIfNull,
   throwIfFalse,
   LoggedError,
   InvalidParameterError,
   InvalidOperationError,
   ConnectionError,
   InvalidStateError
} from './Asserts';

export {
   sanitizeInputString,
   sanitizeOutputString
} from './Sanitize';

export {
   formatDateForStorage,
   formatDateForUserCompact,
   formatDateForUserLong,
   parseStoredDate,
   parseUserDateToStorageDate
} from './DateFormat';

