// examples/basic_usage.ts

// Import necessary classes and types from the SDK
// Adjust the import path based on how you install/use the SDK (e.g., 'cyberware-node-sdk' or '../dist')
import {
  CyberwareClient,
  AnalysisRequest, // Updated
  AnalysisTaskResponse,
  AnalysisResultResponse, // Added
  CyberwareApiError,
  CyberwareAuthenticationError,
  CyberwareBadRequestError,
  // CyberwareForbiddenError could be added if specific handling is desired
} from '../src'; // Using relative path to src for local testing

// --- Configuration ---

// IMPORTANT: Load your API key securely! Never hardcode it.
// Use environment variables or a secret management system.
const apiKey = process.env.CYBERWARE_API_KEY;

if (!apiKey) {
  console.error(
    'Error: CYBERWARE_API_KEY environment variable is not set.',
    'Please set it before running the example.',
  );
  process.exit(1);
}

// Optional: Configure client options
const clientOptions = {
  timeout: 15000, // Set a 15-second timeout
  debug: false, // Set to true to see request/error logs
};

// Initialize the client
const client = new CyberwareClient(apiKey, clientOptions);

console.log('Cyberware Client Initialized.');

// --- Example Data ---

const gameId = 'your-actual-game-id'; // Replace with a valid Game ID
const sourcePlayerId = 'player-example-123'; // Example Source Player ID

// --- Main Function ---

async function runExamples() {
  let successfulAnalysisId: string | null = null; // To store ID for getResults example

  console.log('\n--- Running Text Analysis Example ---');
  try {
    const textRequest: AnalysisRequest = {
      gameId: gameId,
      contentType: 'text',
      rawContent: 'This interaction was really positive and helpful!',
      sourcePlayerId: sourcePlayerId,
      // webhookUrl: 'https://your-webhook-endpoint.com/results' // Optional
    };
    console.log('Submitting text analysis request:', textRequest);
    const textResponse: AnalysisTaskResponse =
      await client.analyze(textRequest);
    console.log('Text Analysis Task Accepted:');
    console.log(`  Message: ${textResponse.message}`);
    console.log(`  Analysis ID: ${textResponse.analysisId}`); // Updated field name
    successfulAnalysisId = textResponse.analysisId; // Store for later use
  } catch (error) {
    handleApiError('Text Analysis', error);
  }

  console.log('\n--- Running Event Log Analysis Example ---');
  try {
    const eventLogRequest: AnalysisRequest = {
      gameId: gameId,
      contentType: 'event_log', // Using event_log type
      eventLogUrl: 'https://example.com/path/to/your/game/event.log', // URL to the log file
      sourcePlayerId: 'player-event-log-456',
      // rulesetUrl: 'https://example.com/path/to/your/ruleset.json' // Optional
    };
    console.log('Submitting event log analysis request:', eventLogRequest);
    const eventLogResponse: AnalysisTaskResponse =
      await client.analyze(eventLogRequest);
    console.log('Event Log Analysis Task Accepted:');
    console.log(`  Message: ${eventLogResponse.message}`);
    console.log(`  Analysis ID: ${eventLogResponse.analysisId}`); // Updated field name
  } catch (error) {
    handleApiError('Event Log Analysis', error);
  }

  // Example of getting results (if a previous analysis was successful)
  if (successfulAnalysisId) {
    console.log('\n--- Running Get Results Example ---');
    console.log(
      `Attempting to fetch results for Analysis ID: ${successfulAnalysisId}`,
    );
    try {
      // Add a small delay to allow analysis to potentially complete (in a real scenario, use webhooks or polling)
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds

      const results: AnalysisResultResponse =
        await client.getResults(successfulAnalysisId);
      console.log('Successfully fetched analysis results:');
      console.log(`  Status: ${results.status}`);
      console.log(`  Sentiment Score: ${results.sentimentScore ?? 'N/A'}`);
      console.log(`  Toxicity Score: ${results.toxicityScore ?? 'N/A'}`);
      console.log(`  Details:`, results.details ?? {});
      // Log other fields as needed
    } catch (error) {
      handleApiError(`Get Results (ID: ${successfulAnalysisId})`, error);
    }
  } else {
    console.log(
      '\n--- Skipping Get Results Example (No successful analysis ID obtained) ---',
    );
  }

  // Example of handling a specific error (e.g., bad request)
  console.log('\n--- Running Bad Request Example ---');
  try {
    // Missing required 'sourcePlayerId' field intentionally
    const badRequest: AnalysisRequest = {
      gameId: gameId,
      contentType: 'text',
      rawContent: 'This request is bad.',
    } as AnalysisRequest;
    console.log('Submitting bad request:', badRequest);
    await client.analyze(badRequest);
  } catch (error) {
    handleApiError('Bad Request', error);
  }
}

// --- Helper Function for Error Handling ---

function handleApiError(context: string, error: unknown) {
  console.error(`Error during ${context}:`);
  if (error instanceof CyberwareAuthenticationError) {
    console.error(
      `  Authentication Failed (Status: ${error.status}): ${error.message}`,
    );
    console.error('  >> Check if your API key is correct and active.');
  } else if (error instanceof CyberwareBadRequestError) {
    console.error(`  Bad Request (Status: ${error.status}): ${error.message}`);
    console.error(
      '  >> Check the request payload for missing or invalid fields.',
    );
    if (error.responseData) {
      console.error('  >> API Response:', error.responseData);
    }
  } else if (error instanceof CyberwareApiError) {
    console.error(
      `  API Error (Status: ${error.status || 'N/A'}): ${error.message}`,
    );
    if (error.responseData) {
      console.error('  >> API Response:', error.responseData);
    }
  } else {
    // Catch unexpected non-API errors (e.g., network issues before request)
    console.error('  An unexpected error occurred:', error);
  }
}

// --- Run the examples ---

runExamples()
  .then(() => {
    console.log('\nExample script finished.');
  })
  .catch((err) => {
    console.error('\nCritical error running example script:', err);
    process.exit(1);
  });
