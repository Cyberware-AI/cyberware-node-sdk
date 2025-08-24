# Technical Specifications: Cyberware Node.js SDK

## 1. Development Environment

- **Language:** TypeScript (compiled to ES2016 CommonJS)
- **Runtime:** Node.js (LTS versions recommended)
- **Package Manager:** npm

## 2. Technology Stack

- **HTTP Client:** `axios`
- **Retry Logic:** `axios-retry`
- **Testing:** Jest, nock (for HTTP mocking)
- **Linting:** ESLint (with TypeScript and Prettier plugins)
- **Formatting:** Prettier

## 3. Key Technical Decisions

- **Class-Based SDK:** Provides a clear, instantiable interface for users.
- **Private API Key:** Use ES `#` private field syntax for storing the API key within the client instance.
- **Hardcoded Production URL:** SDK always targets the production API endpoint.
- **Axios Interceptors:** Centralize response handling (data extraction) and error mapping.
- **Custom Errors:** Provide specific error types for better error handling by consumers.
- **HTTPS Enforcement:** Production URL ensures secure communication.
- **Configurable Retries:** Use `axios-retry` with sensible defaults, allowing user overrides.
- **TypeScript:** Leverage static typing for improved developer experience and code safety.

## 4. Design Patterns

- **Constructor Pattern:** Used for client initialization and configuration.
- **Interceptor Pattern:** Used by `axios` for request/response manipulation.
- **Error Handling Strategy:** Map external API errors to specific, typed internal errors.

## 5. Technical Constraints

- **Node.js Only:** Designed specifically for the Node.js runtime environment.
- **API Key Auth Only (v1):** The initial version only supports `X-API-KEY` header authentication.
- **Target Endpoints:** Focuses only on `/sentiment/text` and `/sentiment/audio`. 