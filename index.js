import { SessionManager } from "./lib/manager.js";
import initializeTelegramBot from "./lib/telegram-bot.js";
import { loadCommands } from "./commands/index.js";

const manager = new SessionManager();

// Load all WhatsApp commands
await loadCommands(manager);

// Start Telegram bot (pairing system)
await initializeTelegramBot(manager);

console.log("🚀 RAHI MD BOT started successfully!");
