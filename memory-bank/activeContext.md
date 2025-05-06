# Active Context

  This file tracks the project's current status, including recent changes, current goals, and open questions.
  2025-05-05 00:05:10 - Log of updates made.

*

## Current Focus

*   Fix failing tests in `test/client.test.ts`.
*   Update examples (`examples/`) and documentation (`README.md`, `docs/`) to reflect recent SDK changes.

## Recent Changes

*   [2025-05-05 12:58:36] Updated Memory Bank (`decisionLog.md`) regarding persistent test error investigation.
*   [2025-05-05 12:58:22] Restored `readonly` modifiers in `src/errors.ts`.
*   [2025-05-05 12:55:25] Temporarily removed `readonly` from `src/errors.ts` for debugging - did not fix the issue.
*   [2025-05-05 12:54:56] Fixed ESLint errors after changing interceptor logic in `src/client.ts`.
*   [2025-05-05 12:54:43] Changed interceptor error handling in `src/client.ts` to create error instance before `Promise.reject`. Restored `onRetry`.
*   [2025-05-05 12:53:20] Fixed ESLint errors after changing `throw` to `Promise.reject` in `src/client.ts`.
*   [2025-05-05 12:53:07] Changed `throw` to `return Promise.reject()` in `src/client.ts` interceptor.
*   [2025-05-05 12:52:26] Commented out `onRetry` in `src/client.ts` for debugging.
*   [2025-05-05 12:52:13] Fixed second test expectation error in `test/client.test.ts` (line 109).
*   [2025-05-05 12:51:52] Reverted error message simplification in `src/client.ts`.
*   [2025-05-05 12:50:12] Fixed first test expectation error in `test/client.test.ts` (line 103).
*   [2025-05-05 12:49:56] Simplified default error message in `src/client.ts` interceptor for debugging.
*   [2025-05-05 12:49:25] Read Memory Bank (`progress.md`).
*   [2025-05-05 12:49:19] Read Memory Bank (`decisionLog.md`).
*   [2025-05-05 12:49:11] Read Memory Bank (`systemPatterns.md`).
*   [2025-05-05 12:49:05] Read Memory Bank (`activeContext.md`).
*   [2025-05-05 12:49:01] Read Memory Bank (`productContext.md`).
*   [2025-05-05 12:48:52] Listed files in `memory-bank/`.
*   [2025-05-05 12:09:43] User requested updates to tests, examples, and documentation. // Duplicated entry? Keep latest
*   [2025-05-05 12:09:29] Updated `progress.md`.
*   [2025-05-05 12:09:16] Updated `activeContext.md`.
*   [2025-05-05 12:09:02] Updated `decisionLog.md` with implementation decisions.
*   [2025-05-05 12:08:50] Fixed TS errors in `src/client.ts` using `@ts-expect-error`.
*   [2025-05-05 12:08:18] Added `CyberwareForbiddenError` to `src/errors.ts`.
*   [2025-05-05 12:07:54] Updated `src/client.ts` with new methods (`analyze`, `getResults`), removed old ones, added 403 error handling.
*   [2025-05-05 12:07:17] Fixed ESLint error in `src/types.ts`.
*   [2025-05-05 12:07:07] Updated `src/types.ts` with `AnalysisRequest`, `AnalysisResultResponse`, updated `AnalysisTaskResponse`.
*   [2025-05-05 12:06:33] Switched to Code mode.
*   [2025-05-05 12:06:24] Updated `progress.md`.
*   [2025-05-05 12:06:15] Updated `activeContext.md`.
*   [2025-05-05 12:05:52] Reviewed `src/types.ts` and identified necessary changes.
*   [2025-05-05 00:05:41] Initialized Memory Bank.

## Open Questions/Issues

*   Persistent `CyberwareApiError: Attempted to assign to readonly property.` error in `bun test`, likely due to Bun runtime/Axios interaction. Most error handling tests fail because of this.