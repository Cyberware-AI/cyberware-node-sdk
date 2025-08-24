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
 * Request body for analyzing text.
 * Based on Swagger definition: `github_com_cyberware_cyberware-backend_internal_models.TextAnalysisRequest`
 */
export interface TextAnalysisRequest {
  /**
   * The ID of the game associated with the text.
   * @required
   */
  game_id: string;
  /**
   * The text content to analyze.
   * @required
   */
  text: string;
  /**
   * Optional server ID where the text originated.
   * @optional
   */
  server_id?: string;
}

/**
 * Request body for analyzing audio.
 * Based on Swagger definition: `github_com_cyberware_cyberware-backend_internal_models.AudioAnalysisRequest`
 */
export interface AudioAnalysisRequest {
  /**
   * The ID of the game associated with the audio.
   * @required
   */
  game_id: string;
  /**
   * The base64 encoded audio data.
   * @required
   */
  audio_base64: string;
  /**
   * Optional server ID where the audio originated.
   * @optional
   */
  server_id?: string;
}

/**
 * Response received when an analysis task is successfully submitted (HTTP 202).
 * Based on Swagger definition: `github_com_cyberware_cyberware-backend_internal_models.AnalysisTaskResponse`
 */
export interface AnalysisTaskResponse {
  /** Confirmation message. */
  message: string;
  /** The unique ID assigned to the submitted data for later result retrieval. */
  sentiment_data_id: string;
}

/**
 * Standard error response structure from the API.
 * Based on Swagger definition: `github_com_cyberware_cyberware-backend_internal_models.ErrorResponse`
 */
export interface ApiErrorResponse {
  /** The error message string provided by the API. */
  error: string;
}
