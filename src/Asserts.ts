/**
 * Provides type-safe assertion utilities for runtime checks.
 * 
 * This module contains a collection of assertion functions that help verify
 * runtime conditions and provide TypeScript type narrowing. Each function
 * throws an ReferenceError when the condition is not met.
 * 
 * @module Asserts
 */

// Copyright (c) 2025, 2026 Jon Verrier

// ===Start StrongAI Generated Comment (20260219)===
// This module provides small, type-safe runtime assertions and a set of error classes that automatically log when they are created. Use it to enforce invariants at runtime while enabling TypeScript to narrow types based on the checks.
// 
// LoggedError extends Error and standardizes error behavior. It restores the prototype chain, sets the name for accurate stack traces, attempts to capture a V8-style stack with Error.captureStackTrace when available, and logs the error name, message, and stack to the console at construction time.
// 
// InvalidParameterError, InvalidOperationError, ConnectionError, and InvalidStateError extend LoggedError. They specialize the error category by setting a specific name, but otherwise inherit the logging and stack behavior.
// 
// throwIfUndefined narrows a value by throwing a ReferenceError when the value is undefined. throwIfNull narrows a value by throwing a ReferenceError when the value is null. throwIfFalse asserts a boolean condition by throwing a ReferenceError when the value is false. All three functions use TypeScript’s asserts signatures to inform the type checker.
// 
// No external imports are used; the module relies on built-in Error and console.
// ===End StrongAI Generated Comment===

/**
 * Represents a logged error base class that records when errors are created.
 * @param {string} message - The error message describing the problem.
 */
export class LoggedError extends Error {
   constructor(message: string = '') {
      super(message);

      // see: typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
      Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
      this.name = new.target.name; // stack traces display correctly now

      // Important: capture stack before we log
      if ((Error as any).captureStackTrace) {
         Error.captureStackTrace(this, this.constructor);
      }

      console.error(`[ERROR CREATED] ${this.name}: ${this.message}`);
      console.error(this.stack);
   }
}

/**
 * Represents an error thrown when an invalid parameter is encountered.
 * @param {string} message - The error message describing the invalid parameter.
 */
export class InvalidParameterError extends LoggedError {
   constructor(message?: string) {
      super(message);
      this.name = InvalidParameterError.name; // stack traces display correctly now
   }
}

/**
 * Represents an error thrown when an invalid operation is attempted.
 * @param {string} message - The error message describing the invalid operation.
 */
export class InvalidOperationError extends LoggedError {
   constructor(message?: string) {
      super(message);
      this.name = InvalidOperationError.name; // stack traces display correctly now
   }
}

/**
 * Represents an error thrown when a connection operation fails.
 * @param {string} message - The error message describing the connection failure.
 */
export class ConnectionError extends LoggedError {
   constructor(message?: string) {
      super(message);
      this.name = ConnectionError.name; // stack traces display correctly now
   }
}

/**
 * Represents an error thrown when an object is in an invalid state for the requested operation.
 * @param {string} message - The error message describing the invalid state.
 */
export class InvalidStateError extends LoggedError {
   constructor(message?: string) {
      super(message);
      this.name = InvalidStateError.name; // stack traces display correctly now
   }
}



export const throwIfUndefined: <T, >(x: T | undefined) => asserts x is T = x => {
   if (typeof x === "undefined") throw new ReferenceError("Value is undefined.");
}

export const throwIfNull: <T, >(x: T | null) => asserts x is T = x => {
   if (x === null) throw new ReferenceError("Value is null.");
}

export const throwIfFalse: (x: boolean) => asserts x is true = x => {
   if (!x) throw new ReferenceError("Value is false.");
}

