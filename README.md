# Cyberware Node.js SDK (v0.1.0)

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Node.js SDK for interacting with the Cyberware API, initially focusing on sentiment analysis.

## Features

*   Simple interface for `analyzeText` and `analyzeAudio` endpoints.
*   Built-in API Key authentication (`X-API-KEY`).
*   Automatic retries for transient errors (e.g., rate limits, server errors).
*   Typed requests and responses using TypeScript.
*   Custom error classes for predictable error handling.
*   Configurable base URL, timeout, and retry logic.

## Installation

```bash
npm install @cyberwareai/node-sdk
# or
yarn add cyberware-node-sdk
```

## Usage

```typescript
import {
  CyberwareClient,
  TextAnalysisRequest,
  AudioAnalysisRequest,
  CyberwareApiError,
} from '@cyberwareai/node-sdk';

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

// --- Analyze Text ---
const textRequest: TextAnalysisRequest = {
  game_id: 'your-game-id',
  text: 'This game is amazing!',
  server_id: 'optional-server-id',
};

client.analyzeText(textRequest)
  .then(result => {
    console.log('Text Analysis Result:', result);
    // Handle 200 OK or 202 Accepted response
  })
  .catch(error => {
    console.error('Text Analysis Failed:', error);
    // Handle specific errors (see Error Handling section)
  });

// --- Analyze Audio ---
// Ensure you have the audio data base64 encoded
const audioBase64Data = '...your base64 encoded audio...'; // Replace with actual data

const audioRequest: AudioAnalysisRequest = {
  game_id: 'your-game-id',
  audio_base64: audioBase64Data,
  server_id: 'optional-server-id',
};

client.analyzeAudio(audioRequest)
  .then(result => {
    console.log('Audio Analysis Result:', result);
    // Handle 200 OK or 202 Accepted response
  })
  .catch(error => {
    console.error('Audio Analysis Failed:', error);
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
} from '@cyberwareai/node-sdk';

const client = new CyberwareClient('invalid-key');

client.analyzeText({ game_id: 'g1', text: 'test' })
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