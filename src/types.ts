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
   * @optional - Will be automatically set to 'text' by the SDK
   */
  contentType?: 'text';
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
   * @optional - Will be automatically set to 'audio' by the SDK
   */
  contentType?: 'audio';
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

/**
 * Sentiment analysis result data.
 */
export interface SentimentResult {
  /** Numerical sentiment score. */
  sentimentScore?: number | null;
  /** Dominant emotion identifier. */
  dominantEmotionId?: string | null;
  /** Confidence level of the analysis. */
  confidence?: number | null;
  /** Human-readable explanation of the analysis. */
  explanation?: string | null;
  /** Timestamp when the analysis was processed. */
  processedAt: string | Date | number;
}

/**
 * Toxicity analysis result data.
 */
export interface ToxicityResult {
  /** Numerical toxicity score. */
  toxicityScore: number;
  /** Reason for the toxicity classification. */
  reason?: string | null;
  /** Communication channel identifier. */
  channel?: string | null;
  /** Timestamp of the analysis. */
  timestamp?: string | Date | number;
  /** Server ID where the content originated. */
  serverId?: string;
  /** Source type of the content. */
  sourceType?: string;
  /** ID of the player who generated the content. */
  sourcePlayerId?: string;
}

/**
 * Feedback type constants.
 */
export type FeedbackType =
  | 'BUG_REPORT'
  | 'FEATURE_REQUEST'
  | 'SUGGESTION'
  | 'COMPLAINT'
  | 'PRAISE'
  | 'QUESTION'
  | 'IMPROVEMENT'
  | 'OTHER';

/**
 * Feedback category constants.
 */
export type FeedbackCategory =
  | 'GAMEPLAY'
  | 'UI_UX'
  | 'PERFORMANCE'
  | 'CONTENT'
  | 'SOCIAL'
  | 'TECHNICAL'
  | 'MONETIZATION'
  | 'ACCESSIBILITY'
  | 'OTHER';

/**
 * Feedback analysis result data.
 */
export interface FeedbackResult {
  /** Type classification of the feedback. */
  type?: FeedbackType;
  /** Category classification of the feedback. */
  category?: FeedbackCategory;
  /** Priority level of the feedback. */
  priority?: string | null;
  /** Summary of the feedback content. */
  summary?: string | null;
  /** Suggested action based on the feedback. */
  suggestedAction?: string | null;
  /** Timestamp when the feedback was processed. */
  processedAt?: string | Date | number;
}

/**
 * Complete analysis result response from GET /api/v1/results/{id}.
 */
export interface AnalysisResult {
  /** Unique identifier for the analysis. */
  id: string;
  /** Game ID associated with the analysis. */
  gameId: string;
  /** Original content that was analyzed. */
  rawContent: string;
  /** Content type of the analyzed data. */
  contentType: 'text' | 'audio';
  /** ID of the player who generated the content. */
  sourcePlayerId: string;
  /** Server ID where the content originated. */
  serverId?: string;
  /** Source type of the content. */
  sourceType?: string;
  /** Timestamp when the analysis was created. */
  createdAt: string | Date | number;
  /** Timestamp when the analysis was last updated. */
  updatedAt?: string | Date | number;
  /** Analysis status. */
  status: 'pending' | 'processing' | 'completed' | 'failed';
  /** Sentiment analysis results. */
  sentimentResult?: SentimentResult | null;
  /** Toxicity analysis results. */
  toxicityResult?: ToxicityResult | null;
  /** Feedback analysis results. */
  feedbackResult?: FeedbackResult | null;
  /** Error message if analysis failed. */
  errorMessage?: string;
}
