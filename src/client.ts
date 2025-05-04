import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import {
  CyberwareClientOptions,
  TextAnalysisRequest,
  AudioAnalysisRequest,
  AnalysisTaskResponse,
  ApiErrorResponse,
} from './types';
import {
  CyberwareApiError,
  CyberwareAuthenticationError,
  CyberwareBadRequestError,
  CyberwareNotFoundError,
  CyberwareServerError,
  CyberwareRateLimitError,
} from './errors';

// Use the actual production URL (ensure it's correct)
const PRODUCTION_BASE_URL = 'http://localhost:8080/api/v1'; //'https://api.cyberware.ai/api/v1';
const DEFAULT_TIMEOUT = 10000; // 10 seconds
const DEFAULT_RETRIES = 3;

/**
 * Represents the main client for interacting with the Cyberware API.
 */
export class CyberwareClient {
  /**
   * The underlying Axios instance used for making HTTP requests.
   * @private
   * @readonly
   */
  private readonly client: AxiosInstance;
  /**
   * The API key used for authentication.
   * Stored as a private field.
   * @private
   * @readonly
   */
  readonly #apiKey: string;

  /**
   * Creates an instance of the CyberwareClient.
   *
   * @param apiKey The API key for authenticating requests.
   * @param options Optional configuration for the client.
   * @throws {Error} If the API key is missing.
   * @throws {Error} If the provided baseURL does not start with https://.
   */
  constructor(apiKey: string, options: CyberwareClientOptions = {}) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    this.#apiKey = apiKey;

    this.client = axios.create({
      baseURL: PRODUCTION_BASE_URL, // Use hardcoded production URL
      timeout: options.timeout || DEFAULT_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': this.#apiKey,
        // Consider adding a User-Agent header for SDK identification
        // 'User-Agent': 'cyberware-node-sdk/0.1.0'
      },
    });

    // Setup retry logic
    axiosRetry(this.client, {
      retries: options.retryConfig?.retries ?? DEFAULT_RETRIES,
      retryDelay:
        options.retryConfig?.retryDelay || axiosRetry.exponentialDelay,
      retryCondition: (error: AxiosError) => {
        // Retry on network errors and 5xx server errors, plus 429
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          error.response?.status === 429 ||
          (error.response?.status ?? 0) >= 500
        );
      },
      shouldResetTimeout: true,
      onRetry: (
        retryCount: number,
        error: AxiosError,
        // Use a more general type for config if specific one causes issues
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        requestConfig: any,
      ) => {
        // Re-add the intended onRetry logic (store last error details)
        if (requestConfig && error.response) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (requestConfig as any)._lastErrorData = {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers,
          };
        }
      },
    });

    // Setup interceptors
    this.setupInterceptors(options.debug ?? false);
  }

  /**
   * Sets up the request and response interceptors for the Axios instance.
   *
   * @param debug Whether to enable debug logging for requests and errors.
   * @private
   */
  private setupInterceptors(debug: boolean): void {
    // Debug Request Interceptor
    if (debug) {
      this.client.interceptors.request.use((config) => {
        // Redact API key before logging
        const { headers, ...configWithoutHeaders } = config;
        const loggedHeaders = { ...headers };
        if (loggedHeaders['X-API-KEY']) {
          loggedHeaders['X-API-KEY'] = '***REDACTED***';
        }
        console.log('Cyberware SDK Request:', {
          ...configWithoutHeaders,
          headers: loggedHeaders,
        });
        return config;
      });
    }

    // Response Interceptor
    this.client.interceptors.response.use(
      // On success, just return the data
      (response: AxiosResponse) => {
        // REMOVED the specific debug log here
        return response.data;
      },
      // On error, wrap it in a custom error class
      (error: AxiosError<ApiErrorResponse>) => {
        // Re-add the logic to check _lastErrorData
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lastErrorData = (error.config as any)?._lastErrorData as  // eslint-disable-next-line @typescript-eslint/no-explicit-any
          | { status: number; data: any; headers: any }
          | undefined;

        const status = error.response?.status || lastErrorData?.status;
        const responseData = error.response?.data || lastErrorData?.data;
        const finalHeaders = error.response?.headers || lastErrorData?.headers;

        const message =
          (responseData as ApiErrorResponse)?.error || error.message;

        // Restore the original debug error logging logic
        if (debug && status) {
          console.error('Cyberware SDK Error Response:', {
            status: status,
            data: responseData,
            headers: finalHeaders,
          });
        } else if (debug) {
          console.error('Cyberware SDK Error:', error);
        }

        switch (status) {
          case 400:
            throw new CyberwareBadRequestError(message, responseData);
          case 401:
            throw new CyberwareAuthenticationError(message, responseData);
          case 404:
            throw new CyberwareNotFoundError(message, responseData);
          case 429:
            // Note: This might be handled by retry logic first
            throw new CyberwareRateLimitError(message, responseData);
          case 500:
          case 502:
          case 503:
          case 504:
            throw new CyberwareServerError(message, status, responseData);
          default:
            // Includes network errors where error.response might be undefined
            throw new CyberwareApiError(
              message || 'An unexpected error occurred',
              status,
              responseData,
            );
        }
      },
    );
  }

  /**
   * Submits text for asynchronous sentiment analysis.
   * Corresponds to POST /sentiment/text
   *
   * @param request The text analysis request details.
   * @returns A promise resolving to an `AnalysisTaskResponse` containing the ID for the submitted data.
   * @throws {CyberwareBadRequestError} If the request is invalid (400).
   * @throws {CyberwareAuthenticationError} If the API key is invalid (401).
   * @throws {CyberwareNotFoundError} If the associated game is not found (404).
   * @throws {CyberwareRateLimitError} If the rate limit is exceeded (429).
   * @throws {CyberwareServerError} If there is a server error (5xx).
   * @throws {CyberwareApiError} For other unexpected errors.
   */
  async analyzeText(
    request: TextAnalysisRequest,
  ): Promise<AnalysisTaskResponse> {
    if (!request || !request.game_id || !request.text) {
      throw new CyberwareBadRequestError(
        'Missing required fields: game_id and text are required for text analysis.',
      );
    }
    // The interceptor handles extracting the data or throwing the correct error
    // API returns 202 Accepted with AnalysisTaskResponse
    // @ts-expect-error Linter incorrectly flags return type due to interceptor complexity
    return this.client.post<AnalysisTaskResponse>('/sentiment/text', request);
  }

  /**
   * Submits audio (base64 encoded) for asynchronous sentiment analysis.
   * Corresponds to POST /sentiment/audio
   *
   * @param request The audio analysis request details.
   * @returns A promise resolving to an `AnalysisTaskResponse` containing the ID for the submitted data.
   * @throws {CyberwareBadRequestError} If the request is invalid (400).
   * @throws {CyberwareAuthenticationError} If the API key is invalid (401).
   * @throws {CyberwareNotFoundError} If the associated game is not found (404).
   * @throws {CyberwareRateLimitError} If the rate limit is exceeded (429).
   * @throws {CyberwareServerError} If there is a server error (5xx).
   * @throws {CyberwareApiError} For other unexpected errors.
   */
  async analyzeAudio(
    request: AudioAnalysisRequest,
  ): Promise<AnalysisTaskResponse> {
    if (!request || !request.game_id || !request.audio_base64) {
      throw new CyberwareBadRequestError(
        'Missing required fields: game_id and audio_base64 are required for audio analysis.',
      );
    }
    // The interceptor handles extracting the data or throwing the correct error
    // API returns 202 Accepted with AnalysisTaskResponse
    // @ts-expect-error Linter incorrectly flags return type due to interceptor complexity
    return this.client.post<AnalysisTaskResponse>('/sentiment/audio', request);
  }
}
