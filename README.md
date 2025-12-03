# AssistantCommon

Foundation package for the StrongAI Assistant platform. Part of the [StrongAI Gym Assistant](../README.md) suite.

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

Standardized error classes for better error handling:

- `InvalidParameterError`: Thrown when an invalid parameter is encountered
- `InvalidOperationError`: Thrown when an invalid operation is attempted
- `ConnectionError`: Thrown when a connection operation fails
- `InvalidStateError`: Thrown when an object is in an invalid state

### String Sanitization

Security-focused string sanitization functions:

- `sanitizeInputString(input: string | null | undefined)`: Removes control characters and HTML tags from input strings
- `sanitizeOutputString(input: string | null | undefined, preserveLineFeeds?: boolean)`: Comprehensive sanitization including sensitive data removal (emails, credit cards, phone numbers)

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

