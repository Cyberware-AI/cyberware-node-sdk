// examples/telegram_listener.ts

import TelegramBot from 'node-telegram-bot-api';
import {
  CyberwareClient,
  AnalysisRequest,
  CyberwareApiError,
  CyberwareAuthenticationError,
  CyberwareBadRequestError,
} from '../src'; // Adjust path as needed

// --- Configuration ---
// IMPORTANT: Load secrets securely!
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const apiKey = process.env.CYBERWARE_API_KEY;
const gameId = 'your-telegram-game-id'; // Replace with your actual Game ID for Telegram

if (!telegramToken) {
  console.error(
    'Error: TELEGRAM_BOT_TOKEN environment variable is not set.',
    'Please set it before running the example.',
  );
  process.exit(1);
}
if (!apiKey) {
  console.error(
    'Error: CYBERWARE_API_KEY environment variable is not set.',
    'Please set it before running the example.',
  );
  process.exit(1);
}

// --- Cyberware Client Setup ---
const cyberwareClient = new CyberwareClient(apiKey, { debug: false });
console.log('Cyberware Client Initialized.');

// --- Telegram Bot Setup ---

// Create a bot that uses 'polling' to fetch new updates
// You can also use webhooks: https://core.telegram.org/bots/api#setwebhook
console.log('Initializing Telegram Bot...');
const bot = new TelegramBot(telegramToken, { polling: true });

// --- Event Handlers ---

// Matches any text message
bot.on('message', async (msg) => {
  // Added async keyword here
  // Ignore commands or non-text messages for this simple example
  if (!msg.text || msg.text.startsWith('/')) return;

  const chatId = msg.chat.id;
  const chatTitle = msg.chat.title || 'Private Chat';
  const userId = msg.from?.id;
  const userName = msg.from?.username || msg.from?.first_name || 'Unknown User';
  const text = msg.text;

  console.log(
    `[Telegram] Chat: "${chatTitle}" (${chatId}) | User: ${userName} (${userId}) | Message: "${text}"`,
  );

  // --- Cyberware SDK Integration ---

  if (userId) {
    // Ensure we have a user ID
    try {
      const analysisRequest: AnalysisRequest = {
        gameId: gameId,
        contentType: 'text',
        rawContent: text,
        sourcePlayerId: userId.toString(), // Using Telegram user ID as source player ID
        // You could add webhookUrl here if needed
      };
      const task = await cyberwareClient.analyze(analysisRequest);
      console.log(
        ` -> Sent to Cyberware for analysis (Analysis ID: ${task.analysisId})`,
      );
    } catch (error) {
      handleApiError(`Cyberware Analysis for message "${text}"`, error);
    }
  } else {
    console.log(' -> Skipping Cyberware analysis (missing user ID)');
  }
  // ---------------------------------

  // Optional: Send a reply back to the chat (for testing)
  // bot.sendMessage(chatId, 'Received your message!');
});

// Handle polling errors (network issues, etc.)
bot.on('polling_error', (error) => {
  console.error('[Telegram Polling Error]:', error.message);
  // You might want to add logic here to attempt reconnection or notify an admin
});

console.log('Telegram Bot is listening for messages...');

// --- Helper Function for Cyberware Error Handling ---

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
    // Catch unexpected non-API errors
    console.error('  An unexpected error occurred:', error);
  }
}
