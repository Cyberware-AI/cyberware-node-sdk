# Cyberware Node.js SDK (v0.1.0)

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Node.js SDK for interacting with the Cyberware API, initially focusing on sentiment analysis.

## Features

*   Simple interface for submitting content analysis tasks (`analyze` method).
*   Supports different content types (`text`, `event_log`, etc.) via the `contentType` parameter.
*   Method to retrieve analysis results by ID (`getResults` method).
*   Built-in API Key authentication (`X-API-KEY`).
*   Automatic retries for transient errors (e.g., rate limits, server errors).
*   Typed requests and responses using TypeScript.
*   Custom error classes for predictable error handling.
*   Configurable base URL, timeout, and retry logic.

## Installation

```bash
npm install cyberware-node-sdk
# or
yarn add cyberware-node-sdk
```

## Usage

```typescript
import {
  CyberwareClient,
  AnalysisRequest, // Updated
  AnalysisTaskResponse, // Response for analyze
  AnalysisResultResponse, // Response for getResults
  CyberwareApiError,
} from 'cyberware-node-sdk';

// Retrieve API key securely (e.g., from environment variables)
const apiKey = process.env.CYBERWARE_API_KEY;

if (!apiKey) {
  throw new Error('CYBERWARE_API_KEY environment variable is not set.');
}

// Initialize the client
const client = new CyberwareClient(apiKey, {
  // Optional configuration:
  // baseURL: 'https://custom.api.cyberware.com/api/v1', // Default uses placeholder
  // timeout: 15000, // Default is 10 seconds
  // debug: true, // Default is false
  // retryConfig: { retries: 5 } // Default is 3 retries
});

// --- Submit Analysis Task ---
const analysisRequest: AnalysisRequest = {
  gameId: 'your-game-id',
  contentType: 'text', // Specify content type
  rawContent: 'This game is amazing!', // Provide content directly
  sourcePlayerId: 'player-123',
  // eventLogUrl: 'https://...', // Or provide a URL for event_log type
  // webhookUrl: 'https://...', // Optional webhook
};

let submittedAnalysisId: string | null = null;

client.analyze(analysisRequest)
  .then((taskResponse: AnalysisTaskResponse) => {
    console.log('Analysis Task Submitted:', taskResponse);
    console.log(` -> Analysis ID: ${taskResponse.analysisId}`);
    submittedAnalysisId = taskResponse.analysisId; // Store ID for fetching results

    // --- Get Analysis Results (Example) ---
    if (submittedAnalysisId) {
      // In a real app, wait for webhook or poll after a delay
      return client.getResults(submittedAnalysisId);
    } else {
      return Promise.reject('No Analysis ID obtained');
    }
  })
  .then((resultsResponse: AnalysisResultResponse) => {
    console.log('\nFetched Analysis Results:', resultsResponse);
    console.log(` -> Status: ${resultsResponse.status}`);
    console.log(` -> Sentiment: ${resultsResponse.sentimentScore ?? 'N/A'}`);
    console.log(` -> Toxicity: ${resultsResponse.toxicityScore ?? 'N/A'}`);
  })
  .catch(error => {
    console.error('\nAnalysis Operation Failed:', error);
    // Handle specific errors (see Error Handling section)
  });

```

## Configuration

The `CyberwareClient` constructor accepts an optional second argument for configuration:

```typescript
export interface CyberwareClientOptions {
  timeout?: number; // Default: 10000 (10 seconds)
  debug?: boolean; // Default: false
  retryConfig?: {
    retries?: number; // Default: 3
    retryDelay?: (retryCount: number, error: Error) => number; // Default: exponential backoff
    // Other axios-retry options...
  };
}

const client = new CyberwareClient(apiKey, options);
```

- **`timeout`**: Request timeout in milliseconds.
- **`debug`**: Set to `true` to enable logging of requests and error responses to the console. API keys are redacted in logs.
- **`retryConfig`**: Allows customization of the automatic retry behavior using options from the [`axios-retry`](https://github.com/softonic/axios-retry) library.

## Error Handling

The SDK throws specific error classes that extend the base `CyberwareApiError` for easier handling:

- `CyberwareAuthenticationError` (401)
- `CyberwareForbiddenError` (403) // Added
- `CyberwareBadRequestError` (400)
- `CyberwareNotFoundError` (404)
- `CyberwareRateLimitError` (429)
- `CyberwareServerError` (5xx)
- `CyberwareApiError` (Base class for others, or for unexpected network/API errors)

Each error instance contains:
- `message`: Error message string.
- `status?`: The HTTP status code (if available).
- `responseData?`: The error response body from the API (if available).

```typescript
import {
  CyberwareClient,
  CyberwareApiError,
  CyberwareAuthenticationError,
  CyberwareBadRequestError,
  // ... other error types
} from 'cyberware-node-sdk';

const client = new CyberwareClient('cyw-key');

client.analyze({ gameId: 'g1', contentType: 'text', rawContent: 'test', sourcePlayerId: 'p1' }) // Updated method
  .catch(error => {
    if (error instanceof CyberwareAuthenticationError) {
      console.error(`Authentication Failed (Status: ${error.status}): ${error.message}`);
      // Handle invalid API key
    } else if (error instanceof CyberwareBadRequestError) {
      console.error(`Bad Request (Status: ${error.status}): ${error.message}`);
      console.error('API Response:', error.responseData);
      // Handle invalid input
    } else if (error instanceof CyberwareApiError) {
      // Catch other specific or generic API errors
      console.error(`API Error (Status: ${error.status || 'N/A'}): ${error.message}`);
    } else {
      // Catch unexpected non-API errors
      console.error('An unexpected error occurred:', error);
    }
  });
```

## Security

**⚠️ Warning:** Do not hardcode your Cyberware API key directly in your source code.

It is strongly recommended to load your API key from a secure source, such as:

- **Environment Variables:** Access via `process.env.CYBERWARE_API_KEY`.
- **Secret Management Systems:** Use services like AWS Secrets Manager, Google Secret Manager, HashiCorp Vault, etc.

## Contributing

(Placeholder - Add contribution guidelines if applicable)

## License

This SDK is licensed under the Apache License, Version 2.0. See the [LICENSE](LICENSE) file for details. (Note: LICENSE file not yet created) 