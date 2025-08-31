/**
 * Options for configuring the CyberwareClient.
 */
export interface CyberwareClientOptions {
  /**
   * Request timeout in milliseconds.
   * Defaults to 10000 (10 seconds).
   * @optional
   */
  timeout?: number;
  /**
   * Enable debug logging for requests and error responses.
   * Defaults to false.
   * @optional
   */
  debug?: boolean;
  /**
   * Configuration for axios-retry.
   * Allows overriding default retry behavior (e.g., number of retries, delay function).
   * @see https://github.com/softonic/axios-retry#configuration
   * @optional
   */
  retryConfig?: {
    /** Number of retry attempts. */
    retries?: number;
    /** Function to calculate delay between retries. */
    retryDelay?: (retryCount: number, error: Error) => number;
    // Add other axios-retry options as needed
  };
}

/**
 * Base interface for analysis requests.
 * Based on the unified /api/v1/analyze endpoint schema.
 */
export interface BaseAnalysisRequest {
  /**
   * The ID of the game associated with the content.
   * @required
   */
  gameId: string;
  /**
   * ID of the player who generated the content.
   * @required
   */
  sourcePlayerId: string;
  /**
   * Optional server ID where the content originated.
   * @optional
   */
  serverId?: string;
  /**
   * URL to fetch event log data from (alternative to rawContent).
   * @optional
   */
  eventLogUrl?: string;
  /**
   * Type of source that generated the content.
   * @optional
   */
  sourceType?: string;
  /**
   * URL to custom ruleset for analysis.
   * @optional
   */
  rulesetUrl?: string;
  /**
   * Webhook URL for result notifications.
   * @optional
   */
  webhookUrl?: string;
}

/**
 * Request body for analyzing text content.
 * Based on the unified /api/v1/analyze endpoint schema.
 */
export interface TextAnalysisRequest extends BaseAnalysisRequest {
  /**
   * Content type identifier.
   * @required
   */
  contentType: 'text';
  /**
   * The actual text content to analyze.
   * @required
   */
  rawContent: string;
}

/**
 * Request body for analyzing audio content.
 * Based on the unified /api/v1/analyze endpoint schema.
 */
export interface AudioAnalysisRequest extends BaseAnalysisRequest {
  /**
   * Content type identifier.
   * @required
   */
  contentType: 'audio';
  /**
   * The base64 encoded audio data to analyze.
   * @required
   */
  rawContent: string;
}

/**
 * Response received when an analysis task is successfully submitted (HTTP 202).
 * Based on the actual API response from /api/v1/analyze endpoint.
 */
export interface AnalysisTaskResponse {
  /** Confirmation message. */
  message: string;
  /** The unique ID assigned to the submitted data for later result retrieval. */
  analysisId: string;
}

/**
 * Standard error response structure from the API.
 * Based on Swagger definition: `github_com_cyberware_cyberware-backend_internal_models.ErrorResponse`
 */
export interface ApiErrorResponse {
  /** The error message string provided by the API. */
  error: string;
}
