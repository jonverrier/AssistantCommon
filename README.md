# AssistantCommon

Foundation package for the StrongAI Assistant platform.

## What is StrongAI?

StrongAI is a brand and a belief — a belief that AI can transform the way people get fit. StrongAI helps community and performance gyms deliver differentiated experiences through AI-powered coaching and assistant tools. This repository holds the shared runtime utilities (guards, errors, sanitizers) used across all StrongAI packages — both public and private — to avoid duplication and ensure consistency.

## Overview

AssistantCommon is the **base package** in the StrongAI dependency hierarchy, providing common utilities used throughout the platform. It has zero external dependencies on other StrongAI packages, making it the foundational layer that all other packages build upon.

This package provides assertion functions, custom error classes, and string sanitization utilities extracted to avoid duplication across the monorepo.

## Features

### Assertion Functions

Type-safe assertion utilities that provide TypeScript type narrowing:

- `throwIfUndefined<T>(x: T | undefined)`: Asserts that a value is not undefined
- `throwIfNull<T>(x: T | null)`: Asserts that a value is not null
- `throwIfFalse(x: boolean)`: Asserts that a boolean is true

### Custom Error Classes

Standardized error classes for better error handling. **Note:** All error classes log immediately to `console.error` at construction time — even when the error is later caught. This is intentional: it ensures every error is recorded at the point of origin for easier diagnosis.

- `InvalidParameterError`: Thrown when an invalid parameter is encountered
- `InvalidOperationError`: Thrown when an invalid operation is attempted
- `ConnectionError`: Thrown when a connection operation fails
- `InvalidStateError`: Thrown when an object is in an invalid state

### String Sanitization

Security-focused string sanitization functions. There are two distinct functions for two distinct use cases:

- `sanitizeInputString(input: string | null | undefined)`: Use this for text **before processing** — removes control characters and HTML tags (structural hazards) but preserves content including PII, since the data stays internal.
- `sanitizeOutputString(input: string | null | undefined, preserveLineFeeds?: boolean)`: Use this for text **going to logs or external systems** — does everything `sanitizeInputString` does, plus masks PII (emails, credit cards, phone numbers) to prevent accidental leakage.

## Architecture

This package sits at the base of the StrongAI dependency hierarchy. Two C4 diagrams describe its place in the wider system:

- [System Context diagram](src/README.StrongAI.Context.md) — shows how AssistantCommon relates to the overall StrongAI platform and its consumers
- [Component diagram](src/README.StrongAI.Component.md) — shows the internal structure of the package

## Installation

```bash
npm install @jonverrier/assistant-common
```

**Note**: This package is published as a **public** GitHub Package. Public packages can be installed without authentication. However, if you're working with other private packages in the `@jonverrier` scope, you may need to configure npm authentication.

### For Public Installation (No Auth Required)

Since this package is public, you can install it directly without any special configuration.

### For Private Packages in Same Scope

If you need to install other private `@jonverrier` packages, configure npm:

1. Create a GitHub Personal Access Token with `read:packages` permission
2. Add to your `.npmrc`:
   ```
   @jonverrier:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
   ```
3. Set the `NODE_AUTH_TOKEN` environment variable with your token

## Usage

```typescript
import {
  throwIfUndefined,
  throwIfNull,
  InvalidParameterError,
  sanitizeInputString,
  sanitizeOutputString
} from '@jonverrier/assistant-common';

// Assertion functions
const value: string | undefined = getUserInput();
throwIfUndefined(value); // TypeScript now knows value is string
console.log(value.toUpperCase()); // No type error

// Custom errors
if (invalidCondition) {
  throw new InvalidParameterError('Parameter must be positive');
}

// String sanitization
const cleanInput = sanitizeInputString(userInput);
const safeOutput = sanitizeOutputString(logData);
```

## Development

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Coverage

```bash
npm run cover
```

## License

MIT

