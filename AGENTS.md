# AssistantCommon Cursor Rules

> **Policy inheritance:** This package follows the global StrongAI standards in `../AGENTS.md`. Use this file to highlight expectations unique to the foundational library.

## Purpose & Scope
- Own all shared error classes, logging utilities, and validation helpers used across the ecosystem.
- Maintain zero downstream dependencies: no imports from other StrongAI packages, and keep third-party deps minimal and runtime-agnostic.
- Design APIs so they run in any Node.js environment (no browser-specific globals) and can be bundled elsewhere without shimming.

## Implementation Guidance
- Export everything through `src/index.ts`; treat it as the single barrel for consumers.
- When adding an error class, document sanitized message patterns and include helper methods for redaction.
- Utilities must expose pure, side-effect-free functions unless they intentionally wrap logging; provide configuration hooks for sinks/levels.
- Never leak stack traces or raw user data from helpers - sanitize inputs and enforce allowlists for logged fields.

## Testing & Quality
- Mocha + `expect` tests must cover every branch of each error/utility, including serialization and sanitization scenarios.
- Add regression tests whenever you modify redaction rules or introduce new logging metadata.
- Keep coverage high: this repo underpins error handling everywhere, so missing branches quickly become blind spots.

## Release Discipline
- `npm run build` must produce clean `.d.ts` outputs in `dist/`; delete the directory before rebuilding to avoid stale artifacts.
- Document breaking API shifts in `README.md` and bump versions accordingly so downstream packages can coordinate updates.
- It's fine to `npm run link-local` during development to test dependents, but **before publishing** run `npm run unlink-local` (and `npm run link-status`) so the release is built solely against GitHub Packages.
