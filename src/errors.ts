/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Base error class for all SDK-specific errors originating from the Cyberware API or request process.
 */
export class CyberwareApiError extends Error {
  /** The HTTP status code associated with the error, if applicable. */
  public status?: number;
  /** The raw response data received from the API, if available. */
  public responseData?: unknown;

  /**
   * Creates an instance of CyberwareApiError.
   * @param message The error message.
   * @param status The HTTP status code (optional).
   * @param responseData The raw API response data (optional).
   */
  constructor(message: string, status?: number, responseData?: unknown) {
    super(message);
    this.name = 'CyberwareApiError'; // Set name for the base error

    this.status = status;
    this.responseData = responseData;

    // The following lines (original 25-29) for this.constructor.name and captureStackTrace remain commented out
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    // if (typeof (Error as any).captureStackTrace === 'function') {
    //   (Error as any).captureStackTrace(this, this.constructor);
    // }
  }
}

/**
 * Error indicating an authentication issue (e.g., invalid API key).
 * Corresponds to HTTP 401 Unauthorized.
 */
export class CyberwareAuthenticationError extends CyberwareApiError {
  /**
   * Creates an instance of CyberwareAuthenticationError.
   * @param message The error message (defaults to 'Invalid API key').
   * @param responseData The raw API response data (optional).
   */
  constructor(message = 'Invalid API key', responseData?: unknown) {
    super(message, 401, responseData);
    Object.setPrototypeOf(this, CyberwareAuthenticationError.prototype);
    this.name = 'CyberwareAuthenticationError';
  }
}
/**
 * Error indicating the user is authenticated but not authorized to perform the action.
 * Corresponds to HTTP 403 Forbidden.
 */
export class CyberwareForbiddenError extends CyberwareApiError {
  /**
   * Creates an instance of CyberwareForbiddenError.
   * @param message The error message (defaults to 'Forbidden').
   * @param responseData The raw API response data (optional).
   */
  constructor(message = 'Forbidden', responseData?: unknown) {
    super(message, 403, responseData);
    Object.setPrototypeOf(this, CyberwareForbiddenError.prototype);
    this.name = 'CyberwareForbiddenError';
  }
}

/**
 * Error indicating a bad request (e.g., missing parameters, invalid input format).
 * Corresponds to HTTP 400 Bad Request.
 */
export class CyberwareBadRequestError extends CyberwareApiError {
  /**
   * Creates an instance of CyberwareBadRequestError.
   * @param message The error message (defaults to 'Bad request').
   * @param responseData The raw API response data (optional).
   */
  constructor(message = 'Bad request', responseData?: unknown) {
    super(message, 400, responseData);
    Object.setPrototypeOf(this, CyberwareBadRequestError.prototype);
    this.name = 'CyberwareBadRequestError';
  }
}

/**
 * Error indicating that the requested resource was not found.
 * Corresponds to HTTP 404 Not Found.
 */
export class CyberwareNotFoundError extends CyberwareApiError {
  /**
   * Creates an instance of CyberwareNotFoundError.
   * @param message The error message (defaults to 'Resource not found').
   * @param responseData The raw API response data (optional).
   */
  constructor(message = 'Resource not found', responseData?: unknown) {
    super(message, 404, responseData);
    Object.setPrototypeOf(this, CyberwareNotFoundError.prototype);
    this.name = 'CyberwareNotFoundError';
  }
}

/**
 * Error indicating a server-side error occurred on the Cyberware API.
 * Corresponds to HTTP 5xx status codes.
 */
export class CyberwareServerError extends CyberwareApiError {
  /**
   * Creates an instance of CyberwareServerError.
   * @param message The error message (defaults to 'Internal server error').
   * @param status The specific HTTP 5xx status code (defaults to 500).
   * @param responseData The raw API response data (optional).
   */
  constructor(
    message = 'Internal server error',
    status = 500,
    responseData?: unknown,
  ) {
    super(message, status, responseData);
    Object.setPrototypeOf(this, CyberwareServerError.prototype);
    this.name = 'CyberwareServerError';
  }
}

/**
 * Error indicating the API rate limit has been exceeded.
 * Corresponds to HTTP 429 Too Many Requests.
 */
export class CyberwareRateLimitError extends CyberwareApiError {
  /**
   * Creates an instance of CyberwareRateLimitError.
   * @param message The error message (defaults to 'Rate limit exceeded').
   * @param responseData The raw API response data (optional).
   */
  constructor(message = 'Rate limit exceeded', responseData?: unknown) {
    super(message, 429, responseData);
    Object.setPrototypeOf(this, CyberwareRateLimitError.prototype);
    this.name = 'CyberwareRateLimitError';
  }
}
