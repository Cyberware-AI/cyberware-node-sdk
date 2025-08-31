---
**Date:** 2025-08-24 22:58
**File(s):** `package.json`, `README.md`, `.github/workflows/publish.yml`
**Summary:** Switched npm scope to `@cyberwareai`, updated README import/install, and added publish workflow configured for the new scope.
**Reason:** Original scope `@cyberware-ai` was unavailable; align package and CI to the available organization name.
---

---

**Date:** 2025-08-30 00:00
**File(s):** `README.md`
**Summary:** Rewrote README to align with current SDK: corrected import/package name, installation methods (npm/yarn/bun), updated API surface (analyzeText/analyzeAudio), accurate types (`TextAnalysisRequest`, `AudioAnalysisRequest`, `AnalysisTaskResponse`), configuration options (`timeout`, `debug`, `retryConfig`), and error handling documentation with exported error classes. Linked examples directory.
**Reason:** Previous README was out of sync with the implemented client (`src/client.ts`) and types (`src/types.ts`), causing mismatched usage and expectations.

---

**Date:** 2025-08-25 00:18
**File(s):** git history, `.gitignore`
**Summary:** Removed `.npmrc` (contained npm token) from entire git history, ensured `.npmrc` is ignored, and force-pushed clean `main`.
**Reason:** GitHub push protection blocked push due to detected npm access token in `.npmrc`.

---

---

**Date:** 2025-08-31 00:00
**File(s):** `src/client.ts`
**Summary:** Read SDK `name` and `version` from `package.json` using TypeScript `resolveJsonModule`; replaced hardcoded constants used for SDK metadata in requests.
**Reason:** Keep SDK metadata in sync with published package without manual updates.

---

---

**Date:** 2025-08-31 00:00
**File(s):** `.husky/pre-commit`, `package.json`, `.prettierignore`
**Summary:** Added Husky pre-commit step to run Prettier across the repository and re-stage changes; added `format:all` npm script; created `.prettierignore` to skip build artifacts and dependencies.
**Reason:** Ensure consistent formatting before each commit and avoid formatting generated files.

---

---

**Date:** 2025-08-31 00:00
**File(s):** `.husky/pre-push`, `package.json`
**Summary:** Added pre-push hook to block pushes when formatting (prettier --check), linting, or tests fail. Introduced `format:check` script.
**Reason:** Prevent pushing code that breaks formatting, linting, or tests.

---
