// examples/basic_usage.ts

// Import necessary classes and types from the SDK
// Adjust the import path based on how you install/use the SDK (e.g., 'cyberware-node-sdk' or '../dist')
import {
  CyberwareClient,
  TextAnalysisRequest,
  AudioAnalysisRequest,
  AnalysisTaskResponse,
  AnalysisResult,
  CyberwareApiError,
  CyberwareAuthenticationError,
  CyberwareBadRequestError,
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
const serverId = 'server-123'; // Optional server ID
const sourcePlayerId = 'player-456'; // Required: ID of the player who generated the content

// --- Main Function ---

async function runExamples() {
  console.log('\n--- Running Text Analysis Example ---');
  try {
    const textRequest: TextAnalysisRequest = {
      gameId: gameId,
      // contentType is now automatically set by the SDK
      rawContent: 'This interaction was really positive and helpful!',
      sourcePlayerId: sourcePlayerId,
      serverId: serverId,
    };
    console.log('Submitting text analysis request:', textRequest);
    const textResponse: AnalysisTaskResponse =
      await client.analyzeText(textRequest);
    console.log('Text Analysis Task Accepted:');
    console.log(`  Message: ${textResponse.message}`);
    console.log(`  Analysis ID: ${textResponse.analysisId}`);

    // Example: Get analysis result (note: in real usage, you'd wait for completion or use webhooks)
    console.log('\n--- Getting Analysis Result Example ---');
    try {
      console.log(`Getting analysis result for ID: ${textResponse.analysisId}`);
      const result: AnalysisResult = await client.getAnalysisResult(
        textResponse.analysisId,
      );
      console.log('Analysis Result:');
      console.log(`  ID: ${result.id}`);
      console.log(`  Status: ${result.status}`);
      console.log(`  Content Type: ${result.contentType}`);
      if (result.sentimentResult) {
        console.log(
          `  Sentiment Score: ${result.sentimentResult.sentimentScore}`,
        );
        console.log(
          `  Dominant Emotion: ${result.sentimentResult.dominantEmotionId}`,
        );
      }
      if (result.toxicityResult) {
        console.log(`  Toxicity Score: ${result.toxicityResult.toxicityScore}`);
      }
      if (result.feedbackResult) {
        console.log(`  Feedback Type: ${result.feedbackResult.type}`);
        console.log(`  Feedback Category: ${result.feedbackResult.category}`);
      }
    } catch (error) {
      handleApiError('Get Analysis Result', error);
    }
  } catch (error) {
    handleApiError('Text Analysis', error);
  }

  console.log('\n--- Running Audio Analysis Example ---');
  try {
    // Example: Base64 encode a simple dummy audio file content (replace with real data)
    const dummyAudioContent = 'This is simulated audio content.';
    const audioBase64 = Buffer.from(dummyAudioContent).toString('base64');

    const audioRequest: AudioAnalysisRequest = {
      gameId: gameId,
      // contentType is now automatically set by the SDK
      rawContent: audioBase64,
      sourcePlayerId: sourcePlayerId,
      serverId: serverId,
    };
    console.log('Submitting audio analysis request (with dummy data):');
    const audioResponse: AnalysisTaskResponse =
      await client.analyzeAudio(audioRequest);
    console.log('Audio Analysis Task Accepted:');
    console.log(`  Message: ${audioResponse.message}`);
    console.log(`  Analysis ID: ${audioResponse.analysisId}`);
  } catch (error) {
    handleApiError('Audio Analysis', error);
  }

  // Example of handling a specific error (e.g., bad request)
  console.log('\n--- Running Bad Request Example ---');
  try {
    const badTextRequest: TextAnalysisRequest = {
      gameId: gameId,
      // contentType is now automatically set by the SDK
      // Missing 'rawContent' and 'sourcePlayerId' fields intentionally
    } as TextAnalysisRequest;
    console.log('Submitting bad text request:', badTextRequest);
    await client.analyzeText(badTextRequest);
  } catch (error) {
    handleApiError('Bad Text Request', error);
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
