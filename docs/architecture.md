# Architecture: Cyberware Node.js SDK

## 1. Overview

The SDK is a Node.js library designed to simplify interaction with the Cyberware API. It encapsulates HTTP requests, authentication, error handling, and retry logic.

## 2. Core Components

- **`CyberwareClient`:** The main entry point class. Handles configuration (timeout, debug, retries), API key management, and exposes methods for API endpoints.
- **`axios` Instance:** A private instance of `axios` configured with the hardcoded production base URL, timeout, and authentication headers.
- **Interceptors:** Axios interceptors for:
    - Logging requests/responses (debug mode).
    - Transforming successful responses (extracting data).
    - Handling errors (mapping HTTP status codes to custom errors).
- **`axios-retry`:** Integrated with the `axios` instance to handle transient network errors and specific status codes (e.g., 429, 5xx).
- **Custom Error Classes:** Specific error types (`CyberwareAuthenticationError`, `CyberwareBadRequestError`, etc.) extending a base `CyberwareApiError`.
- **Type Definitions:** TypeScript interfaces for request parameters, client options, and response objects.

## 3. Data Flow (Sentiment Analysis)

1.  User instantiates `CyberwareClient` with API key and optional configuration (timeout, etc.).
2.  User calls `analyzeText` or `analyzeAudio` with request data.
3.  SDK validates input locally.
4.  `axios` instance sends HTTPS request to the hardcoded production `baseURL` + endpoint path (`/sentiment/text` or `/sentiment/audio`).
    - `X-API-KEY` header is automatically included.
    - Request interceptor logs if debug mode is on.
5.  API responds.
6.  Response interceptor processes the response:
    - **Success (200/202):** Extracts data and returns it.
    - **Error:** Maps status code to a custom error, populates it with details from the response body, and throws it.
    - **Retryable Error (429/5xx):** `axios-retry` handles retries based on configuration before the error interceptor throws.
7.  User receives the result or catches the specific `CyberwareApiError`.

## 4. Dependencies

- `axios`: HTTP client.
- `axios-retry`: Request retry logic. 