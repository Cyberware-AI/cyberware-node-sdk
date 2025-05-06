/// <reference types="bun-types" />

import axiosOriginal, { // Renamed to avoid conflict with potentially mocked 'axios'
  AxiosError,
  AxiosInstance,
  // CreateAxiosDefaults, // Removed as unused
  AxiosRequestConfig,
  AxiosResponse,
  AxiosHeaders,
  InternalAxiosRequestConfig,
  HeadersDefaults,
  AxiosRequestHeaders,
} from 'axios';
import { CyberwareClient } from '../src/client';
import {
  CyberwareApiError,
  CyberwareAuthenticationError,
  CyberwareBadRequestError,
  CyberwareForbiddenError,
  CyberwareNotFoundError,
  CyberwareRateLimitError,
  CyberwareServerError,
} from '../src/errors';
import {
  AnalysisRequest,
  AnalysisResultResponse,
  AnalysisTaskResponse,
  CyberwareClientOptions,
} from '../src/types';
import { test, expect, describe, beforeEach, jest, mock } from 'bun:test'; // Use bun:test

// Mock axios module using bun:test's mock
const mockCreate = jest.fn(); // This will be axios.create, 'jest' is from 'bun:test'
mock.module('axios', () => ({
  default: {
    create: mockCreate,
    isAxiosError: axiosOriginal.isAxiosError,
    // Add other static properties of axios if your client uses them
  },
  isAxiosError: axiosOriginal.isAxiosError, // if client.ts also uses named import
}));

// This variable is not strictly needed if client.ts correctly uses the mocked 'axios'
// const mockedAxios = axiosOriginal as unknown as { create: jest.Mock<...> } ...

// Define a type for the mocked Axios instance methods using jest.Mock from 'bun:test'
// For bun:test, jest.Mock is typically jest.Mock<(...args: ArgsTuple) => ReturnType>
type MockedAxiosInstance = Omit<
  AxiosInstance,
  | 'post'
  | 'get'
  | 'put'
  | 'patch'
  | 'delete'
  | 'head'
  | 'options'
  | 'request'
  | 'getUri'
  | 'interceptors'
  | 'defaults'
  | 'postForm'
  | 'putForm'
  | 'patchForm'
> & {
  post: jest.Mock<
    (
      url: string,
      data?: unknown,
      config?: AxiosRequestConfig,
    ) => Promise<unknown>
  >; // Will return post-interceptor data or reject with CyberwareError
  get: jest.Mock<
    (url: string, config?: AxiosRequestConfig) => Promise<unknown>
  >; // Will return post-interceptor data or reject with CyberwareError
  put: jest.Mock<
    (
      url: string,
      data?: unknown,
      config?: AxiosRequestConfig,
    ) => Promise<unknown>
  >;
  patch: jest.Mock<
    (
      url: string,
      data?: unknown,
      config?: AxiosRequestConfig,
    ) => Promise<unknown>
  >;
  delete: jest.Mock<
    (url: string, config?: AxiosRequestConfig) => Promise<unknown>
  >;
  head: jest.Mock<
    (url: string, config?: AxiosRequestConfig) => Promise<unknown>
  >;
  options: jest.Mock<
    (url: string, config?: AxiosRequestConfig) => Promise<unknown>
  >;
  request: jest.Mock<(config: AxiosRequestConfig) => Promise<unknown>>;
  getUri: jest.Mock<(config?: AxiosRequestConfig) => string>;
  interceptors: {
    request: {
      use: jest.Mock<
        (
          onFulfilled?: (
            value: InternalAxiosRequestConfig,
          ) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>,
          onRejected?: (error: unknown) => unknown,
        ) => number
      >;
      eject: jest.Mock<(id: number) => void>;
    };
    response: {
      use: jest.Mock<
        (
          onFulfilled?: (
            value: AxiosResponse<unknown, unknown>,
          ) => unknown | Promise<unknown>,
          onRejected?: (
            error: AxiosError<unknown, unknown>,
          ) => Promise<never> | unknown,
        ) => number
      >;
      eject: jest.Mock<(id: number) => void>;
    };
  };
  defaults: import('axios').AxiosDefaults;
};

const TEST_API_KEY = 'test-api-key';
const PRODUCTION_BASE_URL = 'http://localhost:8080/api/v1';

describe('CyberwareClient', () => {
  let client: CyberwareClient;
  let mockAxiosInstance: MockedAxiosInstance;
  let capturedResponseSuccessInterceptor:
    | ((value: AxiosResponse<unknown, unknown>) => unknown | Promise<unknown>)
    | undefined;
  let capturedResponseErrorInterceptor:
    | ((error: AxiosError<unknown, unknown>) => Promise<never> | unknown)
    | undefined;

  beforeEach(() => {
    mockCreate.mockClear(); // Use the mockCreate from bun:test's jest.fn()
    capturedResponseSuccessInterceptor = undefined;
    capturedResponseErrorInterceptor = undefined;

    const tempMockInstance = {
      post: jest.fn() as MockedAxiosInstance['post'], // Cast to ensure type compatibility
      get: jest.fn() as MockedAxiosInstance['get'],
      put: jest.fn() as MockedAxiosInstance['put'],
      patch: jest.fn() as MockedAxiosInstance['patch'],
      delete: jest.fn() as MockedAxiosInstance['delete'],
      head: jest.fn() as MockedAxiosInstance['head'],
      options: jest.fn() as MockedAxiosInstance['options'],
      request: jest.fn() as MockedAxiosInstance['request'],
      getUri: jest.fn(() => '') as MockedAxiosInstance['getUri'],
      interceptors: {
        request: {
          use: jest.fn(),
          eject: jest.fn(),
        } as MockedAxiosInstance['interceptors']['request'],
        response: {
          use: jest.fn(
            (
              onFulfilled?: (
                value: AxiosResponse<unknown, unknown>,
              ) => unknown | Promise<unknown>,
              onRejected?: (
                error: AxiosError<unknown, unknown>,
              ) => Promise<never> | unknown,
            ) => {
              capturedResponseSuccessInterceptor = onFulfilled;
              capturedResponseErrorInterceptor = onRejected;
              return 1; // Return an interceptor ID
            },
          ) as MockedAxiosInstance['interceptors']['response']['use'],
          eject:
            jest.fn() as MockedAxiosInstance['interceptors']['response']['eject'],
        },
      },
      defaults: {
        headers: {
          common: { 'Content-Type': 'application/json' },
        } as HeadersDefaults,
      } as import('axios').AxiosDefaults,
    };
    mockAxiosInstance = tempMockInstance as MockedAxiosInstance;

    mockCreate.mockReturnValue(mockAxiosInstance as unknown as AxiosInstance);

    // Client is instantiated in the describe/test specific beforeEach blocks.
    // We'll add assertions for captured interceptors after client instantiation in those blocks.
  });

  // Helper to create AxiosError - MOVED TO THIS SCOPE
  const createAxiosError = (
    status: number,
    data?: { error?: string },
    message?: string,
  ): AxiosError => {
    const error = new Error(
      message || `Request failed with status code ${status}`,
    ) as AxiosError;
    error.isAxiosError = true;
    error.response = {
      data: data || { error: `API Error ${status}` },
      status,
      statusText: `STATUS_${status}`,
      headers: {} as AxiosHeaders, // Response headers can be AxiosHeaders
      config: {
        headers: {} as AxiosRequestHeaders, // Request config headers
      } as InternalAxiosRequestConfig,
    };
    error.config = {
      // Request config associated with the error
      headers: {} as AxiosRequestHeaders, // Request config headers
    } as InternalAxiosRequestConfig;
    error.toJSON = () => ({});
    return error;
  };

  describe('constructor', () => {
    test('should throw an error if API key is missing', () => {
      // Changed it to test
      expect(() => new CyberwareClient('')).toThrow('API key is required');
    });

    test('should create an axios instance with correct defaults', () => {
      // Changed it to test
      client = new CyberwareClient(TEST_API_KEY);
      expect(mockCreate).toHaveBeenCalledWith({
        // Check the imported mockCreate
        baseURL: PRODUCTION_BASE_URL,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': TEST_API_KEY,
        },
      });
    });

    test('should create an axios instance with provided options', () => {
      // Changed it to test
      const options: CyberwareClientOptions = {
        timeout: 5000,
        debug: true,
        retryConfig: { retries: 5 },
      };
      client = new CyberwareClient(TEST_API_KEY, options);
      expect(mockCreate).toHaveBeenCalledWith({
        // Check the imported mockCreate
        baseURL: PRODUCTION_BASE_URL,
        timeout: options.timeout,
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': TEST_API_KEY,
        },
      });
      // Further tests for retryConfig and debug interceptor setup can be added if needed
    });
  });

  describe('analyze', () => {
    beforeEach(() => {
      client = new CyberwareClient(TEST_API_KEY);
      // Assert that interceptors were captured
      expect(capturedResponseSuccessInterceptor).toBeDefined();
      expect(capturedResponseErrorInterceptor).toBeDefined();
    });

    const baseValidRequest: AnalysisRequest = {
      gameId: 'game-123',
      contentType: 'text',
      sourcePlayerId: 'player-abc',
      rawContent: 'This is a test.',
    };

    test('should throw CyberwareBadRequestError if required fields are missing (gameId)', async () => {
      // Changed it to test
      const invalidRequest = {
        ...baseValidRequest,
        gameId: undefined,
      } as Partial<AnalysisRequest>;
      await expect(
        client.analyze(invalidRequest as AnalysisRequest),
      ).rejects.toThrow(CyberwareBadRequestError);
      await expect(
        client.analyze(invalidRequest as AnalysisRequest),
      ).rejects.toThrow(
        'Missing required fields: gameId, contentType, and sourcePlayerId are required.',
      );
    });

    test('should throw CyberwareBadRequestError if required fields are missing (contentType)', async () => {
      // Changed it to test
      const invalidRequest = {
        ...baseValidRequest,
        contentType: undefined,
      } as Partial<AnalysisRequest>;
      await expect(
        client.analyze(invalidRequest as AnalysisRequest),
      ).rejects.toThrow(CyberwareBadRequestError);
      await expect(
        client.analyze(invalidRequest as AnalysisRequest),
      ).rejects.toThrow(
        'Missing required fields: gameId, contentType, and sourcePlayerId are required.',
      );
    });

    test('should throw CyberwareBadRequestError if required fields are missing (sourcePlayerId)', async () => {
      // Changed it to test
      const invalidRequest = {
        ...baseValidRequest,
        sourcePlayerId: undefined,
      } as Partial<AnalysisRequest>;
      await expect(
        client.analyze(invalidRequest as AnalysisRequest),
      ).rejects.toThrow(CyberwareBadRequestError);
      await expect(
        client.analyze(invalidRequest as AnalysisRequest),
      ).rejects.toThrow(
        'Missing required fields: gameId, contentType, and sourcePlayerId are required.',
      );
    });

    test('should throw CyberwareBadRequestError if contentType is text but no content/url provided', async () => {
      // Changed it to test
      const invalidRequest: Partial<AnalysisRequest> = {
        // Intentionally missing rawContent/eventLogUrl
        gameId: 'game-123',
        contentType: 'text',
        sourcePlayerId: 'player-abc',
      };
      await expect(
        client.analyze(invalidRequest as AnalysisRequest),
      ).rejects.toThrow(CyberwareBadRequestError);
      await expect(
        client.analyze(invalidRequest as AnalysisRequest),
      ).rejects.toThrow(
        'For contentType "text", either rawContent or eventLogUrl must be provided.',
      );
    });

    test('should make a POST request to /analyze with correct data and headers for text', async () => {
      // Changed it to test
      const mockResponseData: AnalysisTaskResponse = {
        message: 'Analysis task submitted',
        analysisId: 'analysis-uuid-123',
      };
      // Configure the mock interceptor to return data directly
      mockAxiosInstance.post.mockImplementationOnce(async () => {
        const mockAxiosResp: AxiosResponse = {
          // Renamed for clarity
          data: mockResponseData,
          status: 202,
          statusText: 'Accepted',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        };
        if (capturedResponseSuccessInterceptor) {
          return capturedResponseSuccessInterceptor(mockAxiosResp);
        }
        // Fallback if interceptor somehow not captured (should be caught by toBeDefined)
        return Promise.resolve(mockResponseData);
      });

      const response = await client.analyze(baseValidRequest);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/analyze',
        baseValidRequest,
      );
      expect(response).toEqual(mockResponseData);
    });

    test('should make a POST request to /analyze with eventLogUrl', async () => {
      // Changed it to test
      const requestWithUrl: AnalysisRequest = {
        gameId: 'game-456',
        contentType: 'text',
        sourcePlayerId: 'player-xyz',
        eventLogUrl: 'http://example.com/log.txt',
      };
      const mockResponseData: AnalysisTaskResponse = {
        message: 'Analysis task submitted via URL',
        analysisId: 'analysis-uuid-456',
      };
      mockAxiosInstance.post.mockImplementationOnce(async () => {
        const mockAxiosResp: AxiosResponse = {
          // Renamed for clarity
          data: mockResponseData,
          status: 202,
          statusText: 'Accepted',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        };
        if (capturedResponseSuccessInterceptor) {
          return capturedResponseSuccessInterceptor(mockAxiosResp);
        }
        return Promise.resolve(mockResponseData); // Fallback
      });

      const response = await client.analyze(requestWithUrl);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/analyze',
        requestWithUrl,
      );
      expect(response).toEqual(mockResponseData);
    });

    // createAxiosError was moved up

    const errorTestCases = [
      {
        status: 400,
        ErrorClass: CyberwareBadRequestError,
        defaultMessage: 'Bad request',
      },
      {
        status: 401,
        ErrorClass: CyberwareAuthenticationError,
        defaultMessage: 'Invalid API key',
      },
      {
        status: 403,
        ErrorClass: CyberwareForbiddenError,
        defaultMessage: 'Forbidden',
      },
      {
        status: 404,
        ErrorClass: CyberwareNotFoundError,
        defaultMessage: 'Resource not found',
      }, // Should not happen for /analyze but good to have
      {
        status: 429,
        ErrorClass: CyberwareRateLimitError,
        defaultMessage: 'Rate limit exceeded',
      },
      {
        status: 500,
        ErrorClass: CyberwareServerError,
        defaultMessage: 'Internal server error',
      },
      {
        status: 503,
        ErrorClass: CyberwareServerError,
        defaultMessage: 'Internal server error',
      },
      {
        status: 999,
        ErrorClass: CyberwareApiError,
        defaultMessage: 'An unexpected error occurred',
      }, // Default case
    ];

    errorTestCases.forEach(({ status, ErrorClass, defaultMessage }) => {
      test(`should throw ${ErrorClass.name} for status ${status}`, async () => {
        // Changed it to test
        const apiErrorMessage = `Custom API error for ${status}`;
        const errorResponse = { error: apiErrorMessage };
        const axiosError = createAxiosError(status, errorResponse);

        mockAxiosInstance.post.mockImplementationOnce(async () => {
          if (capturedResponseErrorInterceptor) {
            return capturedResponseErrorInterceptor(axiosError);
          }
          return Promise.reject(axiosError); // Fallback
        });

        try {
          await client.analyze(baseValidRequest);
        } catch (e: unknown) {
          expect(e).toBeInstanceOf(ErrorClass);
          const specificError = e as CyberwareApiError; // Cast for property access
          expect(specificError.message).toBe(apiErrorMessage);
          expect(specificError.status).toBe(status);
          expect(specificError.responseData).toEqual(errorResponse);
        }
      });

      test(`should throw ${ErrorClass.name} with default message if API provides no error message for status ${status}`, async () => {
        // Changed it to test
        const axiosError = createAxiosError(status, {
          /* error: undefined */
        }); // Pass object that might not have error
        mockAxiosInstance.post.mockImplementationOnce(async () => {
          if (capturedResponseErrorInterceptor) {
            return capturedResponseErrorInterceptor(axiosError);
          }
          return Promise.reject(axiosError); // Fallback
        });

        try {
          await client.analyze(baseValidRequest);
        } catch (e: unknown) {
          expect(e).toBeInstanceOf(ErrorClass);
          const specificError = e as CyberwareApiError;
          // For CyberwareApiError (default case), the message might be from Axios if no responseData.error
          if (
            ErrorClass === CyberwareApiError &&
            !(axiosError.response?.data as { error?: string })?.error
          ) {
            expect(specificError.message).toBe(axiosError.message);
          } else {
            expect(specificError.message).toBe(defaultMessage);
          }
          expect(specificError.status).toBe(status);
        }
      });
    });
  });

  describe('getResults', () => {
    beforeEach(() => {
      client = new CyberwareClient(TEST_API_KEY);
      // Assert that interceptors were captured
      expect(capturedResponseSuccessInterceptor).toBeDefined();
      expect(capturedResponseErrorInterceptor).toBeDefined();
    });

    const analysisId = 'analysis-uuid-789';

    test('should throw CyberwareBadRequestError if analysisId is missing', async () => {
      // Changed it to test
      await expect(client.getResults('')).rejects.toThrow(
        CyberwareBadRequestError,
      );
      await expect(client.getResults('')).rejects.toThrow(
        'Missing required parameter: analysisId.',
      );
    });

    test('should make a GET request to /results/{id} with correct id', async () => {
      // Changed it to test
      const mockResponseData: AnalysisResultResponse = {
        analysisId,
        gameId: 'game-123',
        sourcePlayerId: 'player-abc',
        contentType: 'text',
        status: 'COMPLETED',
        sentimentScore: 0.5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      // const mockFullResponse: AxiosResponse = { ... }; // Not needed here
      mockAxiosInstance.get.mockImplementationOnce(async () => {
        const mockAxiosResp: AxiosResponse = {
          data: mockResponseData,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        };
        if (capturedResponseSuccessInterceptor) {
          return capturedResponseSuccessInterceptor(mockAxiosResp);
        }
        return Promise.resolve(mockResponseData); // Fallback
      });

      const response = await client.getResults(analysisId);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        `/results/${analysisId}`,
      );
      expect(response).toEqual(mockResponseData);
    });

    // Re-use errorTestCases, GET might have slightly different default messages or scenarios
    // For simplicity, using the same ones, adjust if needed.
    const errorTestCasesGet = [
      {
        status: 401,
        ErrorClass: CyberwareAuthenticationError,
        defaultMessage: 'Invalid API key',
      },
      {
        status: 403,
        ErrorClass: CyberwareForbiddenError,
        defaultMessage: 'Forbidden',
      },
      {
        status: 404,
        ErrorClass: CyberwareNotFoundError,
        defaultMessage: 'Resource not found',
      },
      {
        status: 429,
        ErrorClass: CyberwareRateLimitError,
        defaultMessage: 'Rate limit exceeded',
      },
      {
        status: 500,
        ErrorClass: CyberwareServerError,
        defaultMessage: 'Internal server error',
      },
      {
        status: 999,
        ErrorClass: CyberwareApiError,
        defaultMessage: 'An unexpected error occurred',
      }, // Default case
    ];

    errorTestCasesGet.forEach(({ status, ErrorClass, defaultMessage }) => {
      test(`should throw ${ErrorClass.name} for status ${status} on getResults`, async () => {
        const apiErrorMessage = `Custom API error for GET ${status}`;
        const errorResponseData = { error: apiErrorMessage };
        const axiosError = createAxiosError(status, errorResponseData);

        mockAxiosInstance.get.mockImplementationOnce(async () => {
          if (capturedResponseErrorInterceptor) {
            return capturedResponseErrorInterceptor(axiosError);
          }
          return Promise.reject(axiosError); // Fallback
        });

        try {
          await client.getResults(analysisId);
        } catch (e: unknown) {
          expect(e).toBeInstanceOf(ErrorClass);
          const specificError = e as CyberwareApiError;
          expect(specificError.message).toBe(apiErrorMessage);
          expect(specificError.status).toBe(status);
          expect(specificError.responseData).toEqual(errorResponseData);
        }
      });

      test(`should throw ${ErrorClass.name} with default message for status ${status} on getResults if API provides no error message`, async () => {
        const axiosError = createAxiosError(status, {}); // No 'error' field in data

        mockAxiosInstance.get.mockImplementationOnce(async () => {
          if (capturedResponseErrorInterceptor) {
            return capturedResponseErrorInterceptor(axiosError);
          }
          return Promise.reject(axiosError); // Fallback
        });

        try {
          await client.getResults(analysisId);
        } catch (e: unknown) {
          expect(e).toBeInstanceOf(ErrorClass);
          const specificError = e as CyberwareApiError;
          if (
            ErrorClass === CyberwareApiError &&
            !(axiosError.response?.data as { error?: string })?.error
          ) {
            expect(specificError.message).toBe(axiosError.message);
          } else {
            expect(specificError.message).toBe(defaultMessage);
          }
          expect(specificError.status).toBe(status);
        }
      });
    });
  });
});
