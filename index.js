import { SessionManager } from "./lib/manager.js";
import initializeTelegramBot from "./lib/telegram-bot.js";
import { loadCommands } from "./commands/index.js";
import { generalCommands } from "./general.js";
import { adminCommands } from "./admin.js";
import { mediaCommands } from "./media.js";
import { downloadCommands } from "./download.js";
import { toolsCommands } from "./tools.js";
import { aiCommands } from "./ai.js";
import { funCommands } from "./fun.js";
import { islamicCommands } from "./islamic.js";
import { groupCommands } from "./group.js";
import { ownerCommands } from "./owner.js";
import { converterCommands } from "./converter.js";
import { stickerCommands } from "./sticker.js";
import { searchCommands } from "./search.js";
import { animeCommands } from "./anime.js";
import { textmakerCommands } from "./textmaker.js";
import { logoCommands } from "./logo.js";

export async function loadCommands(manager) {
  const all = [
    ...generalCommands,
    ...adminCommands,
    ...mediaCommands,
    ...downloadCommands,
    ...toolsCommands,
    ...aiCommands,
    ...funCommands,
    ...islamicCommands,
    ...groupCommands,
    ...ownerCommands,
    ...converterCommands,
    ...stickerCommands,
    ...searchCommands,
    ...animeCommands,
    ...textmakerCommands,
    ...logoCommands,
  ];

  const map = new Map();
  for (const cmd of all) {
    for (const alias of cmd.aliases) {
      map.set(alias.toLowerCase(), cmd);
    }
  }
  manager.commands = map;
  console.log(`📦 Loaded ${all.length} commands (${map.size} aliases)`);
}
const manager = new SessionManager();

// Load all WhatsApp commands
await loadCommands(manager);

// Start Telegram bot (pairing system)
await initializeTelegramBot(manager);

console.log("🚀 RAHI MD BOT started successfully!");
