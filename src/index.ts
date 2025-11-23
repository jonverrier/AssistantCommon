/**
 * @module AssistantCommon
 * 
 * Common utilities for the StrongAI Assistant project, including assertion functions,
 * custom error classes, and string sanitization utilities.
 */

// Copyright (c) 2025 Jon Verrier

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

