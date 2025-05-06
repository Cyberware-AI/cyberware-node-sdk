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
 * Request body for submitting content for analysis via POST /api/v1/analyze.
 */
export interface AnalysisRequest {
  /**
   * The ID of the game associated with the content.
   * @required
   */
  gameId: string;
  /**
   * URL to fetch event log content.
   * @optional
   * @format url
   */
  eventLogUrl?: string;
  /**
   * Type of content being submitted.
   * @required
   */
  contentType: 'text' | 'audio' | 'event_log'; // Assuming 'audio' and 'event_log' are valid based on description
  /**
   * The actual text content if contentType is 'text' and not fetching from eventLogUrl.
   * @optional - Required if contentType is 'text' and eventLogUrl is not provided.
   * @minLength 1
   */
  rawContent?: string;
  /**
   * ID of the player who generated the content.
   * @required
   */
  sourcePlayerId: string;
  /**
   * URL pointing to the ruleset for analysis.
   * @optional
   * @format url
   */
  rulesetUrl?: string;
  /**
   * URL to send results webhook notification.
   * @optional
   * @format url
   */
  webhookUrl?: string;
}

/**
 * Response received when an analysis task is successfully submitted (HTTP 202 Accepted).
 * Corresponds to the response of POST /api/v1/analyze.
 */
export interface AnalysisTaskResponse {
  /** Confirmation message. */
  message: string;
  /** The unique ID assigned to the analysis task for later result retrieval. */
  analysisId: string;
}

/**
 * Response received when fetching analysis results (HTTP 200 OK).
 * Corresponds to the response of GET /api/v1/results/{id}.
 * NOTE: The exact structure is assumed based on the endpoint description,
 * as it was not fully specified in the provided API details.
 */
export interface AnalysisResultResponse {
  /** The unique ID of the analysis record. */
  analysisId: string;
  /** The original game ID associated with the analysis. */
  gameId: string;
  /** The ID of the player who generated the content. */
  sourcePlayerId: string;
  /** The type of content that was analyzed. */
  contentType: 'text' | 'audio' | 'event_log'; // Assuming consistency
  /** The original content submitted for analysis (may be truncated or omitted for large content). */
  originalContent?: string; // Or appropriate type based on contentType
  /** The status of the analysis (e.g., PENDING, PROCESSING, COMPLETED, FAILED). */
  status: string;
  /** The calculated sentiment score (e.g., a number between -1 and 1). */
  sentimentScore?: number;
  /** The calculated toxicity score (e.g., a number between 0 and 1). */
  toxicityScore?: number;
  /** Detailed results or classifications. */
  details?: Record<string, unknown>; // Use a more specific type if known
  /** Timestamp when the analysis was created. */
  createdAt: string; // ISO 8601 format
  /** Timestamp when the analysis was last updated. */
  updatedAt: string; // ISO 8601 format
}

/**
 * Standard error response structure from the API.
 * Based on Swagger definition: `github_com_cyberware_cyberware-backend_internal_models.ErrorResponse`
 */
export interface ApiErrorResponse {
  /** The error message string provided by the API. */
  error: string;
}
