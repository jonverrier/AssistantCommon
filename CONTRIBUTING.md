# Contributing to AssistantCommon

Thank you for your interest in contributing to AssistantCommon!

## Development Setup

### Prerequisites

- Node.js 22.x
- npm 10.x or higher
- Git

### Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/jonverrier/AssistantCommon.git
   cd AssistantCommon
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the package:
   ```bash
   npm run build
   ```

4. Run tests:
   ```bash
   npm test
   ```

## Development Workflow

### Making Changes

1. Create a feature branch:
   ```bash
   git checkout -b feature/my-feature
   ```

2. Make your changes

3. Build and test:
   ```bash
   npm run build
   npm test
   ```

4. Run CI tests:
   ```bash
   npm run test:ci
   ```

5. Commit your changes:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

### Testing

- **All tests**: `npm test`
- **CI tests**: `npm run test:ci` (tests that don't require external dependencies)
- **Coverage**: `npm run cover`

### Code Style

- Follow TypeScript best practices
- Use strict mode (already configured in `tsconfig.json`)
- Include JSDoc comments for public functions
- Follow the naming conventions:
  - Interfaces: `I` prefix (e.g., `IUser`)
  - Enums: `E` prefix (e.g., `EStatus`)
  - Functions: camelCase (e.g., `sanitizeInput`)

### Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Create a pull request targeting the `main` branch
4. The CI workflow will automatically run tests

### Publishing

Publishing is done automatically via GitHub Actions when:

- A GitHub Release is published
- Manual workflow dispatch is triggered

To publish manually (requires write permissions):

```bash
npm run build
npm run test:ci
npm publish
```

## Branch Strategy

- **main**: Production-ready code, always unlinked, uses GitHub Packages
- **develop** / **feature branches**: Development branches, links OK for local development

## Questions?

If you have questions, please open an issue on GitHub.

