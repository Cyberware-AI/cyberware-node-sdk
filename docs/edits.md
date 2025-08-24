---
**Date:** 2025-08-24 22:58
**File(s):** `package.json`, `README.md`, `.github/workflows/publish.yml`
**Summary:** Switched npm scope to `@cyberwareai`, updated README import/install, and added publish workflow configured for the new scope.
**Reason:** Original scope `@cyberware-ai` was unavailable; align package and CI to the available organization name.
---


---
**Date:** 2025-08-25 00:18
**File(s):** git history, `.gitignore`
**Summary:** Removed `.npmrc` (contained npm token) from entire git history, ensured `.npmrc` is ignored, and force-pushed clean `main`.
**Reason:** GitHub push protection blocked push due to detected npm access token in `.npmrc`.
---

