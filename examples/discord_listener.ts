/* eslint-disable @typescript-eslint/no-explicit-any */
// examples/discord_listener.ts

import {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  Message,
} from 'discord.js';
import {
  CyberwareClient,
  AnalysisRequest,
  CyberwareApiError,
  CyberwareAuthenticationError,
  CyberwareBadRequestError,
} from '../src'; // Adjust path as needed

// --- Configuration ---
// IMPORTANT: Load secrets securely!
const discordToken = process.env.DISCORD_BOT_TOKEN;
const apiKey = process.env.CYBERWARE_API_KEY;
const gameId = 'your-discord-game-id'; // Replace with your actual Game ID for Discord

if (!discordToken) {
  console.error(
    'Error: DISCORD_BOT_TOKEN environment variable is not set.',
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

// --- Discord Client Setup ---

// Create a new Discord client with necessary intents
// Guilds: Required for basic server information
// GuildMessages: Required to receive messages in servers
// MessageContent: Required to read the content of messages (needs to be enabled in Developer Portal)
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel],
});

// --- Event Handlers ---

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Discord Bot Ready! Logged in as ${readyClient.user.tag}`);
});

// When a message is created
client.on(Events.MessageCreate, async (message: Message) => {
  // Ignore messages from other bots or the bot itself
  if (message.author.bot) return;

  const serverName = message.guild ? message.guild.name : 'Direct Message';
  const channelName = (message.channel as any).name || 'Unknown Channel'; // Basic channel name fetching
  const authorTag = message.author.tag;
  const content = message.content;

  console.log(
    `[Discord] Server: "${serverName}" | Channel: #${channelName} | User: ${authorTag} | Message: "${content}"`,
  );

  // --- Cyberware SDK Integration ---
  try {
    const analysisRequest: AnalysisRequest = {
      gameId: gameId,
      contentType: 'text',
      rawContent: content,
      sourcePlayerId: authorTag, // Using Discord user tag as source player ID
      // You could add webhookUrl here if needed
    };
    const task = await cyberwareClient.analyze(analysisRequest);
    console.log(
      ` -> Sent to Cyberware for analysis (Analysis ID: ${task.analysisId})`,
    );
  } catch (error) {
    handleApiError(`Cyberware Analysis for message "${content}"`, error);
  }
  // ---------------------------------
});

// --- Login ---

console.log('Logging into Discord...');
// Log in to Discord with your client's token
client.login(discordToken).catch((err) => {
  console.error('Failed to log in to Discord:', err);
  process.exit(1);
});

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
