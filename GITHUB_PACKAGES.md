# GitHub Packages Setup Guide for AssistantCommon

## Overview

The AssistantCommon package is published as a **public** GitHub package `@jonverrier/assistant-common`. This enables package sharing across the StrongAI monorepo and automated builds in GitHub Actions.

## Package Configuration

The package is configured in `package.json`:

```json
{
  "name": "@jonverrier/assistant-common",
  "version": "0.1.0",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/jonverrier/AssistantCommon.git"
  }
}
```

## Local Development Setup

### For Developers Working on AssistantCommon

Since AssistantCommon has no external runtime dependencies, local development is straightforward:

```bash
# Install dev dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run CI tests
npm run test:ci
```

### For Consumers of AssistantCommon

#### 1. Install from GitHub Packages

Since this is a **public** package, you can install it directly:

```bash
npm install @jonverrier/assistant-common
```

Or add to your `package.json`:

```json
{
  "dependencies": {
    "@jonverrier/assistant-common": "^0.1.0"
  }
}
```

#### 2. Configure npm (if needed for private packages in same scope)

If you're working with other private packages, you may need to configure npm:

Create or update `.npmrc`:
```
@jonverrier:registry=https://npm.pkg.github.com
```

For private packages, you'll also need a GitHub Personal Access Token with `read:packages` permission.

## Publishing

### Automatic Publishing via GitHub Actions

The package is automatically published when:

1. **GitHub Release is published** - Creates a release on the main branch
2. **Manual workflow dispatch** - Use the "Run workflow" button in GitHub Actions

### Manual Publishing

```bash
# 1. Build the package
npm run build

# 2. Run tests
npm run test:ci

# 3. Publish (requires NODE_AUTH_TOKEN with write:packages permission)
npm publish
```

### Version Management

Update the version in `package.json` before publishing:

```bash
# Update version (follow semantic versioning)
npm version patch  # 0.1.0 -> 0.1.1
npm version minor  # 0.1.0 -> 0.2.0
npm version major  # 0.1.0 -> 1.0.0

# Or manually edit package.json
```

## GitHub Actions Workflows

### CI Workflow (`.github/workflows/ci.yml`)

- **Triggers**: Push/PR to `main` or `develop` branches
- **Actions**:
  - Installs dependencies
  - Builds the package
  - Runs CI tests

### Publish Workflow (`.github/workflows/publish.yml`)

- **Triggers**: 
  - GitHub Release published
  - Manual workflow dispatch
- **Actions**:
  - Installs dependencies
  - Builds the package
  - Runs CI tests
  - Publishes to GitHub Packages

## Usage in Other Packages

### PromptRepository

PromptRepository depends on AssistantCommon:

```json
{
  "dependencies": {
    "@jonverrier/assistant-common": "^0.1.0"
  }
}
```

### Local Development with Links

When developing both packages together, use npm link:

```bash
# In AssistantCommon
cd AssistantCommon
npm link

# In PromptRepository (or other consumer)
cd PromptRepository
npm link @jonverrier/assistant-common
```

See `PromptRepository/scripts/README.md` for detailed link/unlink workflow.

## Troubleshooting

### Cannot Install Package

**Problem:** `npm install @jonverrier/assistant-common` fails.

**Solution:**
- Since this is a public package, it should install without authentication
- If issues persist, verify the package name is correct
- Check that the package has been published

### Publishing Fails

**Problem:** `npm publish` fails with authentication error.

**Solution:**
- Ensure `NODE_AUTH_TOKEN` environment variable is set
- Verify your GitHub token has `write:packages` permission
- Check that `.npmrc` file exists with correct configuration

### Tests Fail in CI

**Problem:** CI tests fail unexpectedly.

**Solution:**
- Ensure all test files are committed
- Verify `test:ci` script includes all necessary tests
- Check that dev dependencies are properly configured

## Related Documentation

- [GitHub Packages documentation](https://docs.github.com/en/packages)
- [npm link documentation](https://docs.npmjs.com/cli/v8/commands/npm-link)
- [Semantic Versioning](https://semver.org/)

