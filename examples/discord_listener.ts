/* eslint-disable @typescript-eslint/no-explicit-any */
// examples/discord_listener.ts

import {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  Message,
} from 'discord.js';

// --- Configuration ---
// IMPORTANT: Load your Discord Bot Token securely!
const discordToken = process.env.DISCORD_BOT_TOKEN;

if (!discordToken) {
  console.error(
    'Error: DISCORD_BOT_TOKEN environment variable is not set.',
    'Please set it before running the example.',
  );
  process.exit(1);
}

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

  // --- Potential Cyberware SDK Integration Point ---
  // Here you could potentially call the Cyberware SDK's analyzeText method:
  /*
  try {
    // Initialize cyberwareClient earlier in the script
    const analysisRequest = { gameId: 'your-discord-game-id', text: content };
    const task = await cyberwareClient.analyzeText(analysisRequest);
    console.log(` -> Sent to Cyberware for analysis (Task ID: ${task.sentimentDataId})`);
  } catch (error) {
    console.error(' -> Failed to send message to Cyberware:', error);
  }
  */
  // --------------------------------------------------
});

// --- Login ---

console.log('Logging into Discord...');
// Log in to Discord with your client's token
client.login(discordToken).catch((err) => {
  console.error('Failed to log in to Discord:', err);
  process.exit(1);
});
