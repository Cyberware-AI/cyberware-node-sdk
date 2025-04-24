// examples/telegram_listener.ts

import TelegramBot from 'node-telegram-bot-api';

// --- Configuration ---
// IMPORTANT: Load your Telegram Bot Token securely!
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;

if (!telegramToken) {
  console.error(
    'Error: TELEGRAM_BOT_TOKEN environment variable is not set.',
    'Please set it before running the example.',
  );
  process.exit(1);
}

// --- Telegram Bot Setup ---

// Create a bot that uses 'polling' to fetch new updates
// You can also use webhooks: https://core.telegram.org/bots/api#setwebhook
console.log('Initializing Telegram Bot...');
const bot = new TelegramBot(telegramToken, { polling: true });

// --- Event Handlers ---

// Matches any text message
bot.on('message', (msg) => {
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

  // --- Potential Cyberware SDK Integration Point ---
  // Here you could potentially call the Cyberware SDK's analyzeText method:
  /*
  try {
    // Initialize cyberwareClient earlier in the script
    const analysisRequest = { game_id: 'your-telegram-game-id', text: text };
    const task = await cyberwareClient.analyzeText(analysisRequest);
    console.log(` -> Sent to Cyberware for analysis (Task ID: ${task.sentiment_data_id})`);
  } catch (error) {
    console.error(' -> Failed to send message to Cyberware:', error);
  }
  */
  // --------------------------------------------------

  // Optional: Send a reply back to the chat (for testing)
  // bot.sendMessage(chatId, 'Received your message!');
});

// Handle polling errors (network issues, etc.)
bot.on('polling_error', (error) => {
  console.error('[Telegram Polling Error]:', error.message);
  // You might want to add logic here to attempt reconnection or notify an admin
});

console.log('Telegram Bot is listening for messages...');
