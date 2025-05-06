import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import {
  CyberwareClientOptions,
  AnalysisRequest, // Updated
  AnalysisTaskResponse,
  AnalysisResultResponse, // Added
  ApiErrorResponse,
} from './types';
import {
  CyberwareApiError,
  CyberwareAuthenticationError,
  CyberwareForbiddenError, // Added
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

        const apiProvidedErrorMessage = (responseData as ApiErrorResponse)
          ?.error;

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
            const badRequestError = new CyberwareBadRequestError(
              apiProvidedErrorMessage, // Pass only API provided message
              responseData,
            );
            return Promise.reject(badRequestError);
          case 401:
            const authError = new CyberwareAuthenticationError(
              apiProvidedErrorMessage, // Pass only API provided message
              responseData,
            );
            return Promise.reject(authError);
          case 403: // Added case for Forbidden
            const forbiddenError = new CyberwareForbiddenError(
              apiProvidedErrorMessage, // Pass only API provided message
              responseData,
            );
            return Promise.reject(forbiddenError);
          case 404:
            const notFoundError = new CyberwareNotFoundError(
              apiProvidedErrorMessage, // Pass only API provided message
              responseData,
            );
            return Promise.reject(notFoundError);
          case 429:
            // Note: This might be handled by retry logic first
            const rateLimitError = new CyberwareRateLimitError(
              apiProvidedErrorMessage, // Pass only API provided message
              responseData,
            );
            return Promise.reject(rateLimitError);
          case 500:
          case 502:
          case 503:
          case 504:
            // CyberwareServerError constructor has a default for message, so pass apiProvidedErrorMessage directly.
            // The 'status' argument to the constructor will be the specific 5xx code.
            const serverError = new CyberwareServerError(
              apiProvidedErrorMessage, // Pass only API-provided message, or undefined
              status, // This will be the specific 5xx status
              responseData,
            );
            return Promise.reject(serverError);
          default:
            // Includes network errors where error.response might be undefined
            // For the generic CyberwareApiError, use apiProvided, then axios error message, then a final fallback.
            const defaultMessage =
              apiProvidedErrorMessage ||
              error.message ||
              'An unexpected error occurred';
            const defaultError = new CyberwareApiError(
              defaultMessage,
              status,
              responseData,
            );
            return Promise.reject(defaultError);
        }
      },
    );
  }

  /**
   * Submits content (text, audio link, etc.) for asynchronous analysis.
   * Corresponds to POST /analyze
   *
   * @param request The analysis request details, conforming to the AnalysisRequest interface.
   * @returns A promise resolving to an `AnalysisTaskResponse` containing the ID for the submitted analysis task.
   * @throws {CyberwareBadRequestError} If the request is invalid (400). E.g., missing required fields based on contentType.
   * @throws {CyberwareAuthenticationError} If the API key is invalid or missing (401).
   * @throws {CyberwareForbiddenError} If the API key is not authorized for the specified gameId (403).
   * @throws {CyberwareRateLimitError} If the rate limit is exceeded (429).
   * @throws {CyberwareServerError} If there is a server error (5xx).
   * @throws {CyberwareApiError} For other unexpected errors.
   */
  async analyze(request: AnalysisRequest): Promise<AnalysisTaskResponse> {
    // Basic validation
    if (
      !request ||
      !request.gameId ||
      !request.contentType ||
      !request.sourcePlayerId
    ) {
      throw new CyberwareBadRequestError(
        'Missing required fields: gameId, contentType, and sourcePlayerId are required.',
      );
    }
    if (
      request.contentType === 'text' &&
      !request.rawContent &&
      !request.eventLogUrl
    ) {
      throw new CyberwareBadRequestError(
        'For contentType "text", either rawContent or eventLogUrl must be provided.',
      );
    }
    // Add more validation based on contentType if necessary (e.g., for audio)

    // The interceptor handles extracting the data or throwing the correct error
    // API returns 202 Accepted with AnalysisTaskResponse
    // @ts-expect-error TS cannot infer the type transformation from the interceptor
    return this.client.post<AnalysisTaskResponse>('/analyze', request);
  }

  /**
   * Fetches the results of a previously submitted analysis task.
   * Corresponds to GET /results/{id}
   *
   * NOTE: The API specification mentions Bearer token authentication for this endpoint,
   * but this client currently uses the X-API-KEY header set during initialization.
   * This might need adjustment if Bearer tokens are strictly required.
   *
   * @param analysisId The unique ID of the analysis task (returned in AnalysisTaskResponse).
   * @returns A promise resolving to an `AnalysisResultResponse` containing the analysis results.
   * @throws {CyberwareAuthenticationError} If authentication fails (401 - potentially expecting Bearer token).
   * @throws {CyberwareForbiddenError} If the user does not own the record (403).
   * @throws {CyberwareNotFoundError} If the analysis ID is not found (404).
   * @throws {CyberwareRateLimitError} If the rate limit is exceeded (429).
   * @throws {CyberwareServerError} If there is a server error (5xx).
   * @throws {CyberwareApiError} For other unexpected errors.
   */
  async getResults(analysisId: string): Promise<AnalysisResultResponse> {
    if (!analysisId) {
      throw new CyberwareBadRequestError(
        'Missing required parameter: analysisId.',
      );
    }

    // The interceptor handles extracting the data or throwing the correct error
    // API returns 200 OK with AnalysisResultResponse
    // @ts-expect-error TS cannot infer the type transformation from the interceptor
    return this.client.get<AnalysisResultResponse>(`/results/${analysisId}`);
  }
}
