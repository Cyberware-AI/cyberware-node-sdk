# Cyberware Node.js SDK (v0.1.1)

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Node.js SDK for interacting with the Cyberware API, focused on submitting data for asynchronous sentiment analysis.

## Features

- Simple interface for `analyzeText` and `analyzeAudio` endpoints
- API Key authentication via `X-API-KEY`
- Automatic retries for transient errors (network, 5xx, 429)
- Typed requests and responses with TypeScript
- Custom error classes for predictable error handling
- Configurable timeout, debug logging, and retry behavior

## Installation

```bash
npm install @cyberwareai/node-sdk
# or
yarn add @cyberwareai/node-sdk
# or
bun i @cyberwareai/node-sdk
```

## Usage

```typescript
import {
  CyberwareClient,
  type TextAnalysisRequest,
  type AudioAnalysisRequest,
  type AnalysisTaskResponse,
  CyberwareApiError,
  CyberwareAuthenticationError,
  CyberwareBadRequestError,
} from '@cyberwareai/node-sdk';

// Retrieve API key securely (e.g., from environment variables)
const apiKey = process.env.CYBERWARE_API_KEY;
if (!apiKey) {
  throw new Error('CYBERWARE_API_KEY environment variable is not set.');
}

// Initialize the client (options are optional)
const client = new CyberwareClient(apiKey, {
  timeout: 10000, // default
  debug: false,   // default
  // retryConfig: { retries: 3, retryDelay: (count, err) => ... } // optional
});

// --- Analyze Text ---
const textRequest: TextAnalysisRequest = {
  gameId: 'your-game-id',
  text: 'This game is amazing!',
  serverId: 'optional-server-id',
};

client.analyzeText(textRequest)
  .then((result: AnalysisTaskResponse) => {
    console.log('Text task accepted:', result);
    // result.message, result.sentimentDataId
  })
  .catch((error) => handleError(error));

// --- Analyze Audio ---
const audioBase64Data = '...your base64 encoded audio...';

const audioRequest: AudioAnalysisRequest = {
  gameId: 'your-game-id',
  audioBase64: audioBase64Data,
  serverId: 'optional-server-id',
};

client.analyzeAudio(audioRequest)
  .then((result: AnalysisTaskResponse) => {
    console.log('Audio task accepted:', result);
  })
  .catch((error) => handleError(error));

function handleError(error: unknown) {
  if (error instanceof CyberwareAuthenticationError) {
    console.error(`Authentication Failed (Status: ${error.status}): ${error.message}`);
  } else if (error instanceof CyberwareBadRequestError) {
    console.error(`Bad Request (Status: ${error.status}): ${error.message}`);
    console.error('API Response:', error.responseData);
  } else if (error instanceof CyberwareApiError) {
    console.error(`API Error (Status: ${error.status ?? 'N/A'}): ${error.message}`);
    if (error.responseData) console.error('API Response:', error.responseData);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Configuration

The `CyberwareClient` constructor accepts an optional second argument:

```typescript
export interface CyberwareClientOptions {
  timeout?: number; // default: 10000 (10s)
  debug?: boolean;  // default: false
  retryConfig?: {
    retries?: number; // default: 3
    retryDelay?: (retryCount: number, error: Error) => number; // default: exponential backoff
    // other axios-retry options can be passed
  };
}
```

- **timeout**: Request timeout in milliseconds.
- **debug**: If true, logs request metadata and error responses with API key redacted.
- **retryConfig**: Customizes retry behavior powered by `axios-retry`. Defaults retry on network errors, 5xx, and 429.

## API

- **`analyzeText(request: TextAnalysisRequest): Promise<AnalysisTaskResponse>`**
  - POST `/sentiment/text`
  - Validates `gameId` and `text` locally; throws `CyberwareBadRequestError` if missing
  - Typically returns HTTP 202 with `{ message, sentimentDataId }`

- **`analyzeAudio(request: AudioAnalysisRequest): Promise<AnalysisTaskResponse>`**
  - POST `/sentiment/audio`
  - Validates `gameId` and `audioBase64` locally; throws `CyberwareBadRequestError` if missing
  - Typically returns HTTP 202 with `{ message, sentimentDataId }`

### Types

```typescript
interface TextAnalysisRequest {
  gameId: string;
  text: string;
  serverId?: string;
}

interface AudioAnalysisRequest {
  gameId: string;
  audioBase64: string;
  serverId?: string;
}

interface AnalysisTaskResponse {
  message: string;
  sentimentDataId: string;
}
```

### Errors

The SDK throws specific error classes extending `CyberwareApiError`:

- `CyberwareAuthenticationError` (401)
- `CyberwareBadRequestError` (400)
- `CyberwareNotFoundError` (404)
- `CyberwareRateLimitError` (429)
- `CyberwareServerError` (5xx)
- `CyberwareApiError` (generic/unexpected)

Each error instance includes:
- `message: string`
- `status?: number`
- `responseData?: unknown`

## Security

- Do not hardcode your API key. Load it from environment variables or a secret manager.
- The SDK sends the key via the `X-API-KEY` header.

## Examples

See the `examples/` directory for runnable scripts:
- `examples/basic_usage.ts`
- `examples/discord_listener.ts`
- `examples/telegram_listener.ts`

Run with environment variables set (e.g., `CYBERWARE_API_KEY`).

## Contributing

(Placeholder) Contributions are welcome. Please open an issue or PR.

## License

This SDK is licensed under the Apache License, Version 2.0. A `LICENSE` file will be added. 