import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

// ═══════════════════════════════════════════════════════════════════════════
//  ⚙️  ᴄᴏɴꜰɪɢᴜʀᴀᴛɪᴏɴ ᴄᴏɴꜱᴛᴀɴᴛꜱ
// ═══════════════════════════════════════════════════════════════════════════
const TG_LIMIT_MSG      = 3000;
const TG_LIMIT_SUMMARY  = 3500;
const TG_LIMIT_PREVIEW  = 500;
const TG_LIMIT_CODE     = 300;
const TG_LIMIT_CODE_SM  = 150;
const CMD_TIMEOUT_MS    = 30_000;
const PAIR_TIMEOUT_MS   = 22_000;
const WATCH_TIMEOUT_MS  = 5 * 60 * 1000;
const MAX_CMD_LINES     = 50;
const MAX_CMD_CHARS     = 1800;
const CUSTOM_PAIR_CODE  = process.env.PAIR_CODE || "RAHIBHAI";

export default async function initializeTelegramBot(manager) {
  // ── ᴇɴᴠ ᴄᴏɴꜰɪɢ ─────────────────────────────────────────────────────────
  const ALLOWED_GROUP_ID = Number(process.env.TG_GROUP_ID) || -1004402920250;
  const GROUP_INVITE_LINK =
    process.env.TG_GROUP_LINK || "https://t.me/+L1ccTAGRuW00MTg1";
  const WA_CHANNEL_LINK =
    process.env.WA_CHANNEL_LINK ||
    "https://whatsapp.com/channel/0029VbDEode9RZAdUY06uB0S";
  const PAIR_COOLDOWN_MS = 30_000;

  const BOT_TOKEN =
    process.env.BOT_TOKEN_TELEGRAM ||
    process.env.BOT_TOKEN ||
    "8953539470:AAFAwEzAkj0h4gaC1cVm2Wz4UBRDI004AZo";

  // ═══════════════════════════════════════════════════════════════════════════
  //  📝  ʟᴏɢɢᴇʀ
  // ═══════════════════════════════════════════════════════════════════════════
  const LOG = {
    info:  (...a) => console.log  ("[bot.js] ℹ️ ", ...a),
    ok:    (...a) => console.log  ("[bot.js] ✅", ...a),
    warn:  (...a) => console.warn ("[bot.js] ⚠️ ", ...a),
    error: (...a) => console.error("[bot.js] ❌", ...a),
    msg:   (chatId, type, user, text) =>
      console.log(`[bot.js] 📩 [${chatId}/${type}] @${user}: ${String(text).slice(0, 120)}`),
  };

  if (!BOT_TOKEN) {
    LOG.warn("ʙᴏᴛ_ᴛᴏᴋᴇɴ ɴᴏᴛ ꜱᴇᴛ — ꜱᴋɪᴘᴘɪɴɢ ᴛᴇʟᴇɢʀᴀᴍ ʙᴏᴛ.");
    return null;
  }

  const RAILWAY_URL = process.env.RAILWAY_STATIC_URL ||
                      process.env.WEBHOOK_BASE_URL || "";
  const USE_WEBHOOK = Boolean(RAILWAY_URL);

  // ═══════════════════════════════════════════════════════════════════════════
  //  🎨  ꜰᴏɴᴛ ᴇɴɢɪɴᴇ — 12 ᴜɴɪᴄᴏᴅᴇ ꜱᴛʏʟᴇꜱ
  // ═══════════════════════════════════════════════════════════════════════════
  const FONTS = {
    bold: (s) => String(s).replace(/[A-Za-z0-9]/g, (ch) => {
      const c = ch.charCodeAt(0);
      if (c >= 65 && c <= 90)  return String.fromCodePoint(0x1d400 + (c - 65));
      if (c >= 97 && c <= 122) return String.fromCodePoint(0x1d41a + (c - 97));
      if (c >= 48 && c <= 57)  return String.fromCodePoint(0x1d7ce + (c - 48));
      return ch;
    }),
    italic: (s) => String(s).replace(/[A-Za-z]/g, (ch) => {
      const c = ch.charCodeAt(0);
      if (c >= 65 && c <= 90)  return String.fromCodePoint(0x1d434 + (c - 65));
      if (c >= 97 && c <= 122) return String.fromCodePoint(0x1d44e + (c - 97));
      return ch;
    }),
    boldItalic: (s) => String(s).replace(/[A-Za-z]/g, (ch) => {
      const c = ch.charCodeAt(0);
      if (c >= 65 && c <= 90)  return String.fromCodePoint(0x1d468 + (c - 65));
      if (c >= 97 && c <= 122) return String.fromCodePoint(0x1d482 + (c - 97));
      return ch;
    }),
    script: (s) => String(s).replace(/[A-Za-z]/g, (ch) => {
      const c = ch.charCodeAt(0);
      if (c >= 65 && c <= 90)  return String.fromCodePoint(0x1d49c + (c - 65));
      if (c >= 97 && c <= 122) return String.fromCodePoint(0x1d4b6 + (c - 97));
      return ch;
    }),
    boldScript: (s) => String(s).replace(/[A-Za-z]/g, (ch) => {
      const c = ch.charCodeAt(0);
      if (c >= 65 && c <= 90)  return String.fromCodePoint(0x1d4d0 + (c - 65));
      if (c >= 97 && c <= 122) return String.fromCodePoint(0x1d4ea + (c - 97));
      return ch;
    }),
    double: (s) => String(s).replace(/[A-Za-z0-9]/g, (ch) => {
      const c = ch.charCodeAt(0);
      const map = { C:0x2102, H:0x210d, N:0x2115, P:0x2119, Q:0x211a, R:0x211d, Z:0x2124 };
      if (c >= 65 && c <= 90)  return String.fromCodePoint(map[ch] ?? 0x1d538 + (c - 65));
      if (c >= 97 && c <= 122) return String.fromCodePoint(0x1d552 + (c - 97));
      if (c >= 48 && c <= 57)  return String.fromCodePoint(0x1d7d8 + (c - 48));
      return ch;
    }),
    fraktur: (s) => String(s).replace(/[A-Za-z]/g, (ch) => {
      const c = ch.charCodeAt(0);
      if (c >= 65 && c <= 90)  return String.fromCodePoint(0x1d504 + (c - 65));
      if (c >= 97 && c <= 122) return String.fromCodePoint(0x1d51e + (c - 97));
      return ch;
    }),
    mono: (s) => String(s).replace(/[A-Za-z0-9]/g, (ch) => {
      const c = ch.charCodeAt(0);
      if (c >= 65 && c <= 90)  return String.fromCodePoint(0x1d670 + (c - 65));
      if (c >= 97 && c <= 122) return String.fromCodePoint(0x1d68a + (c - 97));
      if (c >= 48 && c <= 57)  return String.fromCodePoint(0x1d7f6 + (c - 48));
      return ch;
    }),
    smallCaps: (s) => String(s).replace(/[A-Za-z]/g, (ch) => {
      const map = {
        a:"ᴀ",b:"ʙ",c:"ᴄ",d:"ᴅ",e:"ᴇ",f:"ꜰ",g:"ɢ",h:"ʜ",i:"ɪ",j:"ᴊ",
        k:"ᴋ",l:"ʟ",m:"ᴍ",n:"ɴ",o:"ᴏ",p:"ᴘ",q:"ǫ",r:"ʀ",s:"ꜱ",t:"ᴛ",
        u:"ᴜ",v:"ᴠ",w:"ᴡ",x:"x",y:"ʏ",z:"ᴢ",
      };
      return map[ch.toLowerCase()] || ch;
    }),
    circled: (s) => String(s).replace(/[A-Za-z]/g, (ch) => {
      const c = ch.charCodeAt(0);
      if (c >= 65 && c <= 90)  return String.fromCodePoint(0x24b6 + (c - 65));
      if (c >= 97 && c <= 122) return String.fromCodePoint(0x24d0 + (c - 97));
      return ch;
    }),
    squared: (s) => String(s).replace(/[A-Za-z]/g, (ch) => {
      const c = ch.charCodeAt(0);
      if (c >= 65 && c <= 90)  return String.fromCodePoint(0x1f130 + (c - 65));
      if (c >= 97 && c <= 122) return String.fromCodePoint(0x1f130 + (c - 97));
      return ch;
    }),
    wide: (s) => String(s).replace(/[!-~]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) + 0xfee0)),
  };

  // ── ꜰᴏɴᴛ ꜱʜᴏʀᴛᴄᴜᴛꜱ ──────────────────────────────────────────────────────
  const FB  = FONTS.bold;
  const FI  = FONTS.italic;
  const FBI = FONTS.boldItalic;
  const FS  = FONTS.smallCaps;
  const FM  = FONTS.mono;
  const FD  = FONTS.double;
  const FSC = FONTS.script;
  const FBS = FONTS.boldScript;
  const FF  = FONTS.fraktur;
  const FC  = FONTS.circled;
  const FQ  = FONTS.squared;
  const FW  = FONTS.wide;
  const F   = FS;

  // ═══════════════════════════════════════════════════════════════════════════
  //  ✨  ᴘʀᴇᴍɪᴜᴍ ᴜɪ ᴇʟᴇᴍᴇɴᴛꜱ
  // ═══════════════════════════════════════════════════════════════════════════
  const UI = {
    line:        "━━━━━━━━━━━━━━━━━",
    lineLong:    "━━━━━━━━━━━━━━━━━━━━━━━━━",
    lineThin:    "┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄",
    lineDots:    "· · · · · · · · ·",
    lineStars:   "✦ ── ✦ ── ✦ ── ✦",
    lineArrows:  "»»———　★　———««",
    lineGrad:    "▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀",

    sparkle:     "✦",
    star:        "★",
    diamond:     "◆",
    diamondSm:   "◇",
    crown:       "♛",
    arrow:       "➤",
    arrowRight:  "»",
    chevron:     "›",
    bullet:      "•",
    bulletRound: "◉",
    bulletHollow:"○",
    check:       "✔",
    cross:       "✘",
    warn:        "⚠",
    fire:        "🔥",
    heart:       "❤",
    rose:        "🌹",
    leaf:        "🌿",
    lock:        "🔒",
    key:         "🔑",
    phone:       "📱",
    globe:       "🌐",
    clock:       "⏰",
    spark:       "✨",
    moon:        "🌙",
    shield:      "🛡️",
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  📦  ᴄᴏᴍᴘᴀᴄᴛ ʙᴏx ʙᴜɪʟᴅᴇʀꜱ
  // ═══════════════════════════════════════════════════════════════════════════
  function stripTags(s = "") {
    return String(s).replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, "x");
  }

  function boxDouble(lines, title = "") {
    const arr = Array.isArray(lines) ? lines : [lines];
    const maxLen = Math.max(
      title ? title.length + 2 : 0,
      ...arr.map((l) => stripTags(l).length)
    );
    const width = Math.min(Math.max(maxLen + 1, 16), 24);

    const top    = `╔${"═".repeat(width)}╗`;
    const bottom = `╚${"═".repeat(width)}╝`;
    const mid = title
      ? `╠═ ${FS(title)} ${"═".repeat(Math.max(0, width - title.length - 3))}╣`
      : "";

    const body = arr.map((l) => {
      const pad = " ".repeat(Math.max(0, width - stripTags(l).length - 1));
      return `║ ${l}${pad}║`;
    }).join("\n");

    return [top, mid, body, bottom].filter(Boolean).join("\n");
  }

  function boxCurly(lines, title = "") {
    const arr = Array.isArray(lines) ? lines : [lines];
    const maxLen = Math.max(
      title ? title.length + 2 : 0,
      ...arr.map((l) => stripTags(l).length)
    );
    const width = Math.min(Math.max(maxLen + 1, 14), 22);

    const top    = `╭${"─".repeat(width)}╮`;
    const bottom = `╰${"─".repeat(width)}╯`;
    const mid = title
      ? `├─ ${FS(title)} ${"─".repeat(Math.max(0, width - title.length - 3))}┤`
      : "";

    const body = arr.map((l) => {
      const pad = " ".repeat(Math.max(0, width - stripTags(l).length - 1));
      return `│ ${l}${pad}│`;
    }).join("\n");

    return [top, mid, body, bottom].filter(Boolean).join("\n");
  }

  function boxHeavy(lines, title = "") {
    const arr = Array.isArray(lines) ? lines : [lines];
    const maxLen = Math.max(
      title ? title.length + 2 : 0,
      ...arr.map((l) => stripTags(l).length)
    );
    const width = Math.min(Math.max(maxLen + 1, 16), 24);

    const top    = `┏${"━".repeat(width)}┓`;
    const bottom = `┗${"━".repeat(width)}┛`;
    const mid = title
      ? `┣━ ${FS(title)} ${"━".repeat(Math.max(0, width - title.length - 3))}┫`
      : "";

    const body = arr.map((l) => {
      const pad = " ".repeat(Math.max(0, width - stripTags(l).length - 1));
      return `┃ ${l}${pad}┃`;
    }).join("\n");

    return [top, mid, body, bottom].filter(Boolean).join("\n");
  }

  function boxShadow(lines, title = "") {
    const arr = Array.isArray(lines) ? lines : [lines];
    const maxLen = Math.max(
      title ? title.length + 2 : 0,
      ...arr.map((l) => stripTags(l).length)
    );
    const width = Math.min(Math.max(maxLen + 1, 14), 22);

    const top    = `  ╭${"─".repeat(width)}╮`;
    const bottom = `  ╰${"─".repeat(width)}╯`;
    const mid = title
      ? `  ├─ ${FS(title)} ${"─".repeat(Math.max(0, width - title.length - 3))}┤`
      : "";

    const body = arr.map((l) => {
      const pad = " ".repeat(Math.max(0, width - stripTags(l).length - 1));
      return `  │ ${l}${pad}│`;
    }).join("\n");

    const shadow = "   " + "▁".repeat(width + 1);
    return [top, mid, body, bottom, shadow].filter(Boolean).join("\n");
  }

  function codeBox(code, { label = "ᴄᴏᴅᴇ", icon = "🔑" } = {}) {
    const clean = String(code).trim();
    const width = Math.min(Math.max(clean.length + 2, 14), 26);
    const pad = Math.max(0, width - clean.length - 2);

    return [
      `╭─ ${icon} ${FS(label)} ${"─".repeat(Math.max(1, width - label.length - 4))}╮`,
      `│ <b><code>${esc(clean)}</code></b>${" ".repeat(pad)}│`,
      `╰${"─".repeat(width)}╯`,
    ].join("\n");
  }

  function neonCode(code, { label = "ᴏᴜᴛᴘᴜᴛ" } = {}) {
    const clean = String(code).trim();
    const lines = clean.split("\n").slice(0, 20);
    const maxLen = Math.max(...lines.map((l) => l.length), 18);
    const width = Math.min(maxLen + 2, 26);

    return [
      `${UI.spark} ── ${FS(label)} ── ${UI.spark}`,
      `┏${"━".repeat(width)}┓`,
      ...lines.map((line) => `┃ <code>${esc(line.slice(0, width - 2))}</code>`),
      `┗${"━".repeat(width)}┛`,
    ].join("\n");
  }

  function progressBar(pct, width = 10) {
    const filled = Math.round((pct / 100) * width);
    return "▰".repeat(filled) + "▱".repeat(width - filled);
  }

  function blockBar(pct, width = 8) {
    const filled = Math.round((pct / 100) * width);
    return "█".repeat(filled) + "░".repeat(width - filled);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  🤖  ᴛᴇʟᴇɢʀᴀᴍ ʙᴏᴛ ɪɴɪᴛ
  // ═══════════════════════════════════════════════════════════════════════════
  const { default: TelegramBot } = await import("node-telegram-bot-api");

  const tbot = new TelegramBot(
    BOT_TOKEN,
    USE_WEBHOOK
      ? { polling: false }
      : { polling: { interval: 3000, timeout: 30 } }
  );

  tbot.on("polling_error", (e) => LOG.error("ᴘᴏʟʟɪɴɢ ᴇʀʀᴏʀ:", e?.message || e));
  tbot.on("webhook_error", (e) => LOG.error("ᴡᴇʙʜᴏᴏᴋ ᴇʀʀᴏʀ:", e?.message || e));

  let botId = null;
  try {
    const me = await tbot.getMe();
    botId = me.id;
    tbot.botId = me.id;
    tbot.botUsername = me.username;
    LOG.ok(`@${me.username} (${me.id}) — ᴍᴏᴅᴇ: ${USE_WEBHOOK ? "ᴡᴇʙʜᴏᴏᴋ" : "ᴘᴏʟʟɪɴɢ"}`);
  } catch (e) {
    LOG.warn("ɢᴇᴛᴍᴇ ꜰᴀɪʟᴇᴅ:", e?.message);
  }

  const pairCooldown = new Map();

  // ═══════════════════════════════════════════════════════════════════════════
  //  🛠️  ᴜᴛɪʟɪᴛʏ ʜᴇʟᴘᴇʀꜱ
  // ═══════════════════════════════════════════════════════════════════════════
  const esc = (s = "") =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  function isoToFlag(iso) {
    if (!iso || iso.length !== 2) return "🏳️";
    const A = 0x1f1e6;
    return [...iso.toUpperCase()]
      .map((c) => String.fromCodePoint(A + c.charCodeAt(0) - 65))
      .join("");
  }

  function fmtCode(raw) {
    const s = String(raw || "").replace(/\s+/g, "");
    return s.match(/.{1,4}/g)?.join("-") || s;
  }

  const isPrivate = (msg) => msg?.chat?.type === "private";

  function isAllowedGroup(msg) {
    try {
      if (!msg?.chat || msg.chat.type === "private") return false;
      return String(msg.chat.id) === String(ALLOWED_GROUP_ID);
    } catch { return false; }
  }

  function isAnonymousAdmin(msg) {
    return !!(msg?.sender_chat && msg?.chat &&
              String(msg.sender_chat.id) === String(msg.chat.id));
  }

  async function isAdmin(msg) {
    try {
      if (!msg?.chat || msg.chat.type === "private") return false;
      if (isAnonymousAdmin(msg)) return true;
      if (!msg.from) return false;
      const member = await tbot.getChatMember(msg.chat.id, msg.from.id);
      return member?.status === "creator" || member?.status === "administrator";
    } catch { return false; }
  }

  function safeReply(chatId, text, opts = {}) {
    return tbot.sendMessage(chatId, text, { parse_mode: "HTML", ...opts })
      .catch((e) => LOG.error("ꜱᴇɴᴅᴍᴇꜱꜱᴀɢᴇ ꜰᴀɪʟᴇᴅ:", e?.message));
  }

  function safeEdit(chatId, msgId, text, opts = {}) {
    return tbot.editMessageText(text, {
      chat_id: chatId, message_id: msgId, parse_mode: "HTML", ...opts,
    }).catch(() => {});
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  ⏳  ꜱᴇꜱꜱɪᴏɴ ᴡᴀɪᴛᴇʀ
  // ═══════════════════════════════════════════════════════════════════════════
  function waitForSessionOpen(sessionId, timeoutMs = PAIR_TIMEOUT_MS) {
    return new Promise((resolve, reject) => {
      if (manager.isRunning(sessionId)) return resolve();

      const timer = setTimeout(() => {
        manager.removeListener("connected", onConn);
        manager.removeListener("session.deleted", onDel);
        reject(new Error("ᴄᴏɴɴᴇᴄᴛɪᴏɴ ᴛɪᴍᴇᴏᴜᴛ"));
      }, timeoutMs);

      function onConn(sid) {
        if (sid !== sessionId) return;
        clearTimeout(timer);
        manager.removeListener("connected", onConn);
        manager.removeListener("session.deleted", onDel);
        resolve();
      }
      function onDel(sid) {
        if (sid !== sessionId) return;
        clearTimeout(timer);
        manager.removeListener("connected", onConn);
        manager.removeListener("session.deleted", onDel);
        reject(new Error("ꜱᴇꜱꜱɪᴏɴ ᴅᴇʟᴇᴛᴇᴅ ʙᴇꜰᴏʀᴇ ᴄᴏɴɴᴇᴄᴛɪɴɢ"));
      }

      manager.on("connected", onConn);
      manager.on("session.deleted", onDel);
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  🌍  ᴄᴏᴜɴᴛʀʏ ᴅᴇᴛᴇᴄᴛɪᴏɴ
  // ═══════════════════════════════════════════════════════════════════════════
  const CALLING_CODE_MAP = {
    1:{iso:"US",name:"ᴜɴɪᴛᴇᴅ ꜱᴛᴀᴛᴇꜱ"},7:{iso:"RU",name:"ʀᴜꜱꜱɪᴀ"},20:{iso:"EG",name:"ᴇɢʏᴘᴛ"},
    27:{iso:"ZA",name:"ꜱᴏᴜᴛʜ ᴀꜰʀɪᴄᴀ"},30:{iso:"GR",name:"ɢʀᴇᴇᴄᴇ"},31:{iso:"NL",name:"ɴᴇᴛʜᴇʀʟᴀɴᴅꜱ"},
    32:{iso:"BE",name:"ʙᴇʟɢɪᴜᴍ"},33:{iso:"FR",name:"ꜰʀᴀɴᴄᴇ"},34:{iso:"ES",name:"ꜱᴘᴀɪɴ"},
    36:{iso:"HU",name:"ʜᴜɴɢᴀʀʏ"},39:{iso:"IT",name:"ɪᴛᴀʟʏ"},40:{iso:"RO",name:"ʀᴏᴍᴀɴɪᴀ"},
    41:{iso:"CH",name:"ꜱᴡɪᴛᴢᴇʀʟᴀɴᴅ"},43:{iso:"AT",name:"ᴀᴜꜱᴛʀɪᴀ"},44:{iso:"GB",name:"ᴜɴɪᴛᴇᴅ ᴋɪɴɢᴅᴏᴍ"},
    45:{iso:"DK",name:"ᴅᴇɴᴍᴀʀᴋ"},46:{iso:"SE",name:"ꜱᴡᴇᴅᴇɴ"},47:{iso:"NO",name:"ɴᴏʀᴡᴀʏ"},
    48:{iso:"PL",name:"ᴘᴏʟᴀɴᴅ"},49:{iso:"DE",name:"ɢᴇʀᴍᴀɴʏ"},51:{iso:"PE",name:"ᴘᴇʀᴜ"},
    52:{iso:"MX",name:"ᴍᴇxɪᴄᴏ"},53:{iso:"CU",name:"ᴄᴜʙᴀ"},54:{iso:"AR",name:"ᴀʀɢᴇɴᴛɪɴᴀ"},
    55:{iso:"BR",name:"ʙʀᴀᴢɪʟ"},56:{iso:"CL",name:"ᴄʜɪʟᴇ"},57:{iso:"CO",name:"ᴄᴏʟᴏᴍʙɪᴀ"},
    58:{iso:"VE",name:"ᴠᴇɴᴇᴢᴜᴇʟᴀ"},60:{iso:"MY",name:"ᴍᴀʟᴀʏꜱɪᴀ"},61:{iso:"AU",name:"ᴀᴜꜱᴛʀᴀʟɪᴀ"},
    62:{iso:"ID",name:"ɪɴᴅᴏɴᴇꜱɪᴀ"},63:{iso:"PH",name:"ᴘʜɪʟɪᴘᴘɪɴᴇꜱ"},64:{iso:"NZ",name:"ɴᴇᴡ ᴢᴇᴀʟᴀɴᴅ"},
    65:{iso:"SG",name:"ꜱɪɴɢᴀᴘᴏʀᴇ"},66:{iso:"TH",name:"ᴛʜᴀɪʟᴀɴᴅ"},81:{iso:"JP",name:"ᴊᴀᴘᴀɴ"},
    82:{iso:"KR",name:"ꜱᴏᴜᴛʜ ᴋᴏʀᴇᴀ"},84:{iso:"VN",name:"ᴠɪᴇᴛɴᴀᴍ"},86:{iso:"CN",name:"ᴄʜɪɴᴀ"},
    90:{iso:"TR",name:"ᴛᴜʀᴋᴇʏ"},91:{iso:"IN",name:"ɪɴᴅɪᴀ"},92:{iso:"PK",name:"ᴘᴀᴋɪꜱᴛᴀɴ"},
    93:{iso:"AF",name:"ᴀꜰɢʜᴀɴɪꜱᴛᴀɴ"},94:{iso:"LK",name:"ꜱʀɪ ʟᴀɴᴋᴀ"},95:{iso:"MM",name:"ᴍʏᴀɴᴍᴀʀ"},
    98:{iso:"IR",name:"ɪʀᴀɴ"},211:{iso:"SS",name:"ꜱᴏᴜᴛʜ ꜱᴜᴅᴀɴ"},212:{iso:"MA",name:"ᴍᴏʀᴏᴄᴄᴏ"},
    213:{iso:"DZ",name:"ᴀʟɢᴇʀɪᴀ"},216:{iso:"TN",name:"ᴛᴜɴɪꜱɪᴀ"},218:{iso:"LY",name:"ʟɪʙʏᴀ"},
    220:{iso:"GM",name:"ɢᴀᴍʙɪᴀ"},221:{iso:"SN",name:"ꜱᴇɴᴇɢᴀʟ"},233:{iso:"GH",name:"ɢʜᴀɴᴀ"},
    234:{iso:"NG",name:"ɴɪɢᴇʀɪᴀ"},254:{iso:"KE",name:"ᴋᴇɴʏᴀ"},255:{iso:"TZ",name:"ᴛᴀɴᴢᴀɴɪᴀ"},
    256:{iso:"UG",name:"ᴜɢᴀɴᴅᴀ"},260:{iso:"ZM",name:"ᴢᴀᴍʙɪᴀ"},263:{iso:"ZW",name:"ᴢɪᴍʙᴀʙᴡᴇ"},
    351:{iso:"PT",name:"ᴘᴏʀᴛᴜɢᴀʟ"},353:{iso:"IE",name:"ɪʀᴇʟᴀɴᴅ"},358:{iso:"FI",name:"ꜰɪɴʟᴀɴᴅ"},
    380:{iso:"UA",name:"ᴜᴋʀᴀɪɴᴇ"},420:{iso:"CZ",name:"ᴄᴢᴇᴄʜ ʀᴇᴘᴜʙʟɪᴄ"},421:{iso:"SK",name:"ꜱʟᴏᴠᴀᴋɪᴀ"},
    500:{iso:"FK",name:"ꜰᴀʟᴋʟᴀɴᴅ ɪꜱʟᴀɴᴅꜱ"},501:{iso:"BZ",name:"ʙᴇʟɪᴢᴇ"},502:{iso:"GT",name:"ɢᴜᴀᴛᴇᴍᴀʟᴀ"},
    505:{iso:"NI",name:"ɴɪᴄᴀʀᴀɢᴜᴀ"},506:{iso:"CR",name:"ᴄᴏꜱᴛᴀ ʀɪᴄᴀ"},507:{iso:"PA",name:"ᴘᴀɴᴀᴍᴀ"},
    591:{iso:"BO",name:"ʙᴏʟɪᴠɪᴀ"},593:{iso:"EC",name:"ᴇᴄᴜᴀᴅᴏʀ"},595:{iso:"PY",name:"ᴘᴀʀᴀɢᴜᴀʏ"},
    598:{iso:"UY",name:"ᴜʀᴜɢᴜᴀʏ"},670:{iso:"TL",name:"ᴇᴀꜱᴛ ᴛɪᴍᴏʀ"},673:{iso:"BN",name:"ʙʀᴜɴᴇɪ"},
    675:{iso:"PG",name:"ᴘᴀᴘᴜᴀ ɴᴇᴡ ɢᴜɪɴᴇᴀ"},679:{iso:"FJ",name:"ꜰɪᴊɪ"},850:{iso:"KP",name:"ɴᴏʀᴛʜ ᴋᴏʀᴇᴀ"},
    852:{iso:"HK",name:"ʜᴏɴɢ ᴋᴏɴɢ"},853:{iso:"MO",name:"ᴍᴀᴄᴀᴜ"},855:{iso:"KH",name:"ᴄᴀᴍʙᴏᴅɪᴀ"},
    856:{iso:"LA",name:"ʟᴀᴏꜱ"},880:{iso:"BD",name:"ʙᴀɴɢʟᴀᴅᴇꜱʜ"},886:{iso:"TW",name:"ᴛᴀɪᴡᴀɴ"},
    960:{iso:"MV",name:"ᴍᴀʟᴅɪᴠᴇꜱ"},961:{iso:"LB",name:"ʟᴇʙᴀɴᴏɴ"},962:{iso:"JO",name:"ᴊᴏʀᴅᴀɴ"},
    963:{iso:"SY",name:"ꜱʏʀɪᴀ"},964:{iso:"IQ",name:"ɪʀᴀǫ"},965:{iso:"KW",name:"ᴋᴜᴡᴀɪᴛ"},
    966:{iso:"SA",name:"ꜱᴀᴜᴅɪ ᴀʀᴀʙɪᴀ"},967:{iso:"YE",name:"ʏᴇᴍᴇɴ"},968:{iso:"OM",name:"ᴏᴍᴀɴ"},
    971:{iso:"AE",name:"ᴜᴀᴇ"},972:{iso:"IL",name:"ɪꜱʀᴀᴇʟ"},973:{iso:"BH",name:"ʙᴀʜʀᴀɪɴ"},
    974:{iso:"QA",name:"ǫᴀᴛᴀʀ"},975:{iso:"BT",name:"ʙʜᴜᴛᴀɴ"},977:{iso:"NP",name:"ɴᴇᴘᴀʟ"},
    992:{iso:"TJ",name:"ᴛᴀᴊɪᴋɪꜱᴛᴀɴ"},993:{iso:"TM",name:"ᴛᴜʀᴋᴍᴇɴɪꜱᴛᴀɴ"},994:{iso:"AZ",name:"ᴀᴢᴇʀʙᴀɪᴊᴀɴ"},
    995:{iso:"GE",name:"ɢᴇᴏʀɢɪᴀ"},996:{iso:"KG",name:"ᴋʏʀɢʏᴢꜱᴛᴀɴ"},998:{iso:"UZ",name:"ᴜᴢʙᴇᴋɪꜱᴛᴀɴ"},
    1242:{iso:"BS",name:"ʙᴀʜᴀᴍᴀꜱ"},1246:{iso:"BB",name:"ʙᴀʀʙᴀᴅᴏꜱ"},1345:{iso:"KY",name:"ᴄᴀʏᴍᴀɴ ɪꜱʟᴀɴᴅꜱ"},
    1868:{iso:"TT",name:"ᴛʀɪɴɪᴅᴀᴅ ᴀɴᴅ ᴛᴏʙᴀɢᴏ"},1876:{iso:"JM",name:"ᴊᴀᴍᴀɪᴄᴀ"},
  };

  const SORTED_CODES = Object.keys(CALLING_CODE_MAP)
    .map(Number)
    .sort((a, b) => String(b).length - String(a).length || b - a);

  function detectCountry(digits) {
    if (!digits) return null;
    if (digits.startsWith("00")) digits = digits.slice(2);
    for (const code of SORTED_CODES) {
      if (digits.startsWith(String(code))) {
        const info = CALLING_CODE_MAP[code];
        return { callingCode: code, iso: info.iso, name: info.name };
      }
    }
    return null;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  📦  ꜱᴇʀɪᴀʟɪᴢᴇʀ + ꜱᴇɴᴅ ʜᴇʟᴘᴇʀꜱ
  // ═══════════════════════════════════════════════════════════════════════════
  function serializeResult(result) {
    if (result === undefined || result === null) {
      return {
        resultStr: String(result),
        typeSummary: `<i>${result === null ? "ɴᴜʟʟ" : "ᴜɴᴅᴇꜰɪɴᴇᴅ"}</i>`,
      };
    }
    if (Buffer.isBuffer(result) || result instanceof Uint8Array) {
      return {
        resultStr: `<ʙᴜꜰꜰᴇʀ ${result.byteLength} ʙʏᴛᴇꜱ>`,
        typeSummary: `📦 ʙᴜꜰꜰᴇʀ — ${result.byteLength} ʙʏᴛᴇꜱ`,
      };
    }
    let str;
    try { str = JSON.stringify(result, null, 2); }
    catch { str = String(result); }

    if (Array.isArray(result)) {
      return { resultStr: str, typeSummary: `📋 ᴀʀʀᴀʏ — ${result.length} ɪᴛᴇᴍꜱ` };
    }
    if (typeof result === "object") {
      return {
        resultStr: str,
        typeSummary: `🗂 ᴏʙᴊᴇᴄᴛ — ${Object.keys(result).length} ᴋᴇʏꜱ`,
      };
    }
    return { resultStr: String(result), typeSummary: FS(typeof result) };
  }

  async function sendLongOutput(chatId, replyId, headerText, resultStr, code, sid) {
    const tmpPath = path.join(os.tmpdir(), `s_${sid}_${Date.now()}.json`);
    try {
      await fs.promises.writeFile(tmpPath, resultStr, "utf8");
      await tbot.sendDocument(chatId, tmpPath, {
        caption: [
          headerText,
          ``,
          `${UI.diamond} <code>${esc(code.slice(0, TG_LIMIT_CODE_SM))}${
            code.length > TG_LIMIT_CODE_SM ? "..." : ""}</code>`,
        ].join("\n"),
        parse_mode: "HTML",
        reply_to_message_id: replyId,
      });

      const preview = resultStr.slice(0, TG_LIMIT_PREVIEW);
      const lines = preview.split("\n").slice(0, 12);
      const maxLen = Math.max(...lines.map((l) => l.length), 18);
      const width = Math.min(maxLen + 2, 24);

      await safeReply(chatId, [
        `${UI.spark} ${FS("ᴘʀᴇᴠɪᴇᴡ")} ${UI.spark}`,
        `┏${"━".repeat(width)}┓`,
        ...lines.map((l) => `┃ <code>${esc(l.slice(0, width - 2))}</code>`),
        `┗${"━".repeat(width)}┛`,
        `<i>... ꜰᴜʟʟ ɪɴ .ᴊꜱᴏɴ ꜰɪʟᴇ</i>`,
      ].join("\n"), { reply_to_message_id: replyId });
    } finally {
      fs.promises.unlink(tmpPath).catch(() => {});
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  💬  ᴘʀᴇᴍɪᴜᴍ ᴍᴇꜱꜱᴀɢᴇ ʙᴜɪʟᴅᴇʀꜱ
  // ═══════════════════════════════════════════════════════════════════════════

  function buildPairSuccessMessage(rawArg, rawCode, countryInfo) {
    const code    = fmtCode(rawCode);
    const flag    = countryInfo ? isoToFlag(countryInfo.iso) : "🌍";
    const country = countryInfo
      ? `${flag} ${FS(countryInfo.name)} <code>(+${countryInfo.callingCode})</code>`
      : `🌍 <i>ᴄᴏᴜɴᴛʀʏ ᴜɴᴋɴᴏᴡɴ</i>`;

    const codeBlock = [
      `  ${UI.sparkle} ${UI.sparkle} ${UI.sparkle}`,
      `┏━━━━━━━━━━━━━━━━━┓`,
      `┃ ${UI.key} ${FS("ᴘᴀɪʀ ᴄᴏᴅᴇ")}    ┃`,
      `┣━━━━━━━━━━━━━━━━━┫`,
      `┃ <b><code>${esc(code)}</code></b> ┃`,
      `┗━━━━━━━━━━━━━━━━━┛`,
      `  ${UI.sparkle} ${UI.sparkle} ${UI.sparkle}`,
    ].join("\n");

    const text = [
      `${UI.sparkle} ${FS("ᴘᴀɪʀ ᴄᴏᴅᴇ ʀᴇᴀᴅʏ")} ${UI.sparkle}`,
      UI.lineLong,
      "",
      `  ${UI.diamond} ${FS("ɴᴜᴍʙᴇʀ")}  ${UI.phone}`,
      `  ${UI.arrow} <code>${esc(rawArg)}</code>`,
      "",
      `  ${UI.diamond} ${FS("ᴄᴏᴜɴᴛʀʏ")}  ${UI.globe}`,
      `  ${UI.arrow} ${country}`,
      "",
      codeBlock,
      "",
      `${UI.diamond} ${FS("ʜᴏᴡ ᴛᴏ ʟɪɴᴋ")}`,
      UI.lineThin,
      `  ${UI.chevron} <i>ᴡʜᴀᴛꜱᴀᴘᴘ → ꜱᴇᴛᴛɪɴɢꜱ</i>`,
      `  ${UI.chevron} <i>ʟɪɴᴋᴇᴅ ᴅᴇᴠɪᴄᴇꜱ</i>`,
      `  ${UI.chevron} <i>ʟɪɴᴋ ᴀ ᴅᴇᴠɪᴄᴇ → ᴇɴᴛᴇʀ ᴄᴏᴅᴇ</i>`,
      "",
      `${UI.clock} <i>ᴇxᴘɪʀᴇꜱ ɪɴ ~60 ꜱᴇᴄᴏɴᴅꜱ</i>`,
    ].join("\n");

    const reply_markup = {
      inline_keyboard: [
        [{ text: `🔑  ${code}`, copy_text: { text: code } }],
        [{ text: "📢  ᴡʜᴀᴛꜱᴀᴘᴘ ᴄʜᴀɴɴᴇʟ", url: WA_CHANNEL_LINK }],
      ],
    };

    return { text, reply_markup };
  }

  function buildHelpMessage() {
    return [
      `${UI.crown} ${FS("ʀᴀʜɪ ʙᴏᴛ")} ${UI.crown}`,
      UI.lineArrows,
      "",
      boxHeavy(
        [
          `› <code>/start</code>    ${UI.bullet} ꜱᴛᴀʀᴛ`,
          `› <code>/pair</code>     ${UI.bullet} ᴘᴀɪʀ`,
          `› <code>/ping</code>     ${UI.bullet} ᴘɪɴɢ`,
          `› <code>/help</code>     ${UI.bullet} ᴍᴇɴᴜ`,
        ],
        "ᴜꜱᴇʀ"
      ),
      "",
      boxHeavy(
        [
          `› <code>/s</code>       ${UI.bullet} ᴏɴᴇ`,
          `› <code>/as</code>      ${UI.bullet} ᴀʟʟ`,
          `› <code>/sessions</code>${UI.bullet} ʟɪꜱᴛ`,
          `› <code>/status</code>  ${UI.bullet} ꜱᴛᴀᴛꜱ`,
          `› <code>/stop</code>    ${UI.bullet} ꜱᴛᴏᴘ`,
          `› <code>/logout</code>  ${UI.bullet} ᴏᴜᴛ`,
          `› <code>/restart</code> ${UI.bullet} ʀᴇꜱᴛᴀʀᴛ`,
          `› <code>/d</code>       ${UI.bullet} ꜱʜᴇʟʟ`,
        ],
        "ᴀᴅᴍɪɴ"
      ),
      "",
      boxCurly(
        [`<code>/pair +8801711209381</code>`],
        "ᴇxᴀᴍᴘʟᴇ"
      ),
    ].join("\n");
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  🔐  ᴄᴏʀᴇ ᴘᴀɪʀ ʟᴏɢɪᴄ
  // ═══════════════════════════════════════════════════════════════════════════
  async function doPair(chatId, rawArg, replyToId) {
    const digits      = rawArg.replace(/\D/g, "");
    const countryInfo = detectCountry(digits);
    const flag        = countryInfo ? isoToFlag(countryInfo.iso) : "☁️";
    const countryName = countryInfo?.name || "ᴜɴᴋɴᴏᴡɴ";

    const loadingMsg = await safeReply(chatId, [
      `${UI.sparkle} ${FS("ɢᴇɴᴇʀᴀᴛɪɴɢ ᴘᴀɪʀ ᴄᴏᴅᴇ")} ${UI.sparkle}`,
      UI.lineLong,
      "",
      `  ${UI.diamond} ${FS("ɴᴜᴍʙᴇʀ")}  <code>${esc(rawArg)}</code>`,
      `  ${UI.diamond} ${FS("ᴄᴏᴜɴᴛʀʏ")}  ${
        countryInfo
          ? `${flag} ${esc(countryName)} (+${countryInfo.callingCode})`
          : `🌍 <i>ᴜɴᴋɴᴏᴡɴ</i>`
      }`,
      "",
      `  ${progressBar(60)}  ${FS("ᴘʀᴏᴄᴇꜱꜱɪɴɢ")}`,
      `  🔄 <i>ᴘʟᴇᴀꜱᴇ ᴡᴀɪᴛ ᴀ ᴍᴏᴍᴇɴᴛ...</i>`,
    ].join("\n"), { reply_to_message_id: replyToId });

    let rawCode = null;
    try {
      const sock = await manager.start(digits);
      if (!sock) throw new Error("ꜱᴏᴄᴋᴇᴛ ᴄʀᴇᴀᴛɪᴏɴ ꜰᴀɪʟᴇᴅ");

      try { await waitForSessionOpen(digits, PAIR_TIMEOUT_MS); }
      catch (e) { LOG.warn(`ᴡᴀɪᴛꜰᴏʀꜱᴇꜱꜱɪᴏɴᴏᴘᴇɴ: ${e.message}`); }

      if (typeof sock.requestPairingCode !== "function") {
        throw new Error("ᴘᴀɪʀɪɴɢ ɴᴏᴛ ꜱᴜᴘᴘᴏʀᴛᴇᴅ — ꜱᴏᴄᴋᴇᴛ ᴠᴇʀꜱɪᴏɴ ᴍᴀʏ ʙᴇ ᴏᴜᴛᴅᴀᴛᴇᴅ");
      }

      // ✅ RAHIBHAI custom pair code
      try {
        rawCode = await sock.requestPairingCode(digits, CUSTOM_PAIR_CODE);
        LOG.ok(`ᴄᴜꜱᴛᴏᴍ ᴘᴀɪʀ ᴄᴏᴅᴇ ꜱᴇᴛ: ${CUSTOM_PAIR_CODE}`);
      } catch (customErr) {
        LOG.warn(`ᴄᴜꜱᴛᴏᴍ ᴘᴀɪʀ ᴄᴏᴅᴇ ꜰᴀɪʟᴇᴅ: ${customErr.message} — ᴛʀʏɪɴɢ ᴅᴇꜰᴀᴜʟᴛ`);
        rawCode = await sock.requestPairingCode(digits);
      }
    } catch (err) {
      try { await tbot.deleteMessage(chatId, loadingMsg?.message_id); } catch {}
      return safeReply(chatId, [
        `${UI.cross} ${FS("ᴘᴀɪʀ ꜰᴀɪʟᴇᴅ")}`,
        UI.lineLong,
        "",
        `  ${UI.diamond} ${FS("ɴᴜᴍʙᴇʀ")}  <code>${esc(rawArg)}</code>`,
        `  ${UI.diamond} ${FS("ʀᴇᴀꜱᴏɴ")}  <i>${esc(String(err?.message || err))}</i>`,
        "",
        `  ${UI.arrow} <i>ᴛʀʏ ᴀɢᴀɪɴ ᴡɪᴛʜ</i> <code>/pair +${esc(digits)}</code>`,
      ].join("\n"), { reply_to_message_id: replyToId });
    }

    try { await tbot.deleteMessage(chatId, loadingMsg?.message_id); } catch {}

    if (!rawCode) {
      return safeReply(chatId,
        `${UI.cross} ${FS("ɴᴏ ᴘᴀɪʀ ᴄᴏᴅᴇ ʀᴇᴛᴜʀɴᴇᴅ — ᴘʟᴇᴀꜱᴇ ᴛʀʏ ᴀɢᴀɪɴ.")}`,
        { reply_to_message_id: replyToId });
    }

    const { text, reply_markup } = buildPairSuccessMessage(rawArg, rawCode, countryInfo);
    const pairMsg = await safeReply(chatId, text, {
      reply_to_message_id: replyToId,
      reply_markup,
      disable_web_page_preview: true,
    });

    // ── ᴘᴏꜱᴛ-ᴘᴀɪʀ ᴡᴀᴛᴄʜᴇʀ ─────────────────────────────────────────────────
    if (pairMsg?.message_id) {
      const msgId      = pairMsg.message_id;
      const cFlag      = countryInfo ? isoToFlag(countryInfo.iso) : "🌍";
      const displayNum = `+${digits}`;

      const connectedText = [
        `${UI.check} ${FS("ʙᴏᴛ ᴄᴏɴɴᴇᴄᴛᴇᴅ")} ${UI.check}`,
        UI.lineArrows,
        "",
        `  ${UI.heart} ${FS("ꜱᴜᴄᴄᴇꜱꜱꜰᴜʟʟʏ ʟɪɴᴋᴇᴅ!")}`,
        "",
        `  ${UI.diamond} ${FS("ɴᴜᴍʙᴇʀ")}  <code>${esc(displayNum)}</code>`,
        countryInfo
          ? `  ${UI.diamond} ${FS("ᴄᴏᴜɴᴛʀʏ")}  ${cFlag} ${FS(countryInfo.name)}`
          : `  ${UI.diamond} ${FS("ᴄᴏᴜɴᴛʀʏ")}  🌍 <i>ᴜɴᴋɴᴏᴡɴ</i>`,
        "",
        `  ${progressBar(100)}  ${FS("ᴄᴏᴍᴘʟᴇᴛᴇ")}`,
      ].join("\n");

      const failedText = [
        `${UI.cross} ${FS("ᴘᴀɪʀ ᴜɴꜱᴜᴄᴄᴇꜱꜱꜰᴜʟ")}`,
        UI.lineLong,
        "",
        `  ⏰ ${FS("ᴛɪᴍᴇᴅ ᴏᴜᴛ — ᴄᴏᴅᴇ ɴᴏᴛ ᴜꜱᴇᴅ.")}`,
        "",
        `  ${UI.diamond} ${FS("ɴᴜᴍʙᴇʀ")}  <code>${esc(displayNum)}</code>`,
        "",
        `  ${UI.arrow} ${FS("ᴛʀʏ ᴀɢᴀɪɴ")}`,
        `  <code>/pair ${esc(displayNum)}</code>`,
      ].join("\n");

      const waKeyboard = {
        inline_keyboard: [[
          { text: "📢  ᴡʜᴀᴛꜱᴀᴘᴘ ᴄʜᴀɴɴᴇʟ", url: WA_CHANNEL_LINK },
        ]],
      };

      (async () => {
        try {
          await new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
              manager.removeListener("connected", onConn);
              manager.removeListener("session.deleted", onDel);
              reject(new Error("ᴛɪᴍᴇᴏᴜᴛ"));
            }, WATCH_TIMEOUT_MS);

            function onConn(sid) {
              if (sid !== digits) return;
              clearTimeout(timer);
              manager.removeListener("connected", onConn);
              manager.removeListener("session.deleted", onDel);
              resolve("ᴄᴏɴɴᴇᴄᴛᴇᴅ");
            }
            function onDel(sid) {
              if (sid !== digits) return;
              clearTimeout(timer);
              manager.removeListener("connected", onConn);
              manager.removeListener("session.deleted", onDel);
              reject(new Error("ᴅᴇʟᴇᴛᴇᴅ"));
            }

            manager.on("connected", onConn);
            manager.on("session.deleted", onDel);
          });

          await safeEdit(chatId, msgId, connectedText, {
            reply_markup: waKeyboard,
            disable_web_page_preview: true,
          });
          LOG.ok(`ᴘᴀɪʀ ᴡᴀᴛᴄʜᴇʀ: ${digits} ᴄᴏɴɴᴇᴄᴛᴇᴅ`);
        } catch (reason) {
          await safeEdit(chatId, msgId, failedText, {
            reply_markup: waKeyboard,
            disable_web_page_preview: true,
          });
          LOG.info(`ᴘᴀɪʀ ᴡᴀᴛᴄʜᴇʀ: ${digits} — ${reason?.message || reason}`);
        }
      })();
    }

    return pairMsg;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  🚪  ᴀᴜᴛᴏ-ʟᴇᴀᴠᴇ ᴜɴᴀᴜᴛʜᴏʀɪᴢᴇᴅ ɢʀᴏᴜᴘꜱ
  // ═══════════════════════════════════════════════════════════════════════════
  tbot.on("new_chat_members", async (msg) => {
    try {
      if (!msg?.new_chat_members || !botId) return;
      const addedBot = msg.new_chat_members.some((m) => m.id === botId);
      if (!addedBot) return;

      if (!isAllowedGroup(msg)) {
        LOG.warn("ᴀᴅᴅᴇᴅ ᴛᴏ ᴜɴᴀᴜᴛʜᴏʀɪᴢᴇᴅ ɢʀᴏᴜᴘ:", msg.chat.id);
        await safeReply(msg.chat.id, [
          `${UI.cross} ${FS("ᴜɴᴀᴜᴛʜᴏʀɪᴢᴇᴅ ɢʀᴏᴜᴘ")}`,
          UI.lineLong,
          "",
          `  ${FS("ᴛʜɪꜱ ʙᴏᴛ ᴏɴʟʏ ᴡᴏʀᴋꜱ ɪɴ ᴛʜᴇ ᴏꜰꜰɪᴄɪᴀʟ ɢʀᴏᴜᴘ.")}`,
          "",
          `  ${UI.arrow} ${GROUP_INVITE_LINK}`,
        ].join("\n"));
        await tbot.leaveChat(msg.chat.id).catch(() => {});
      } else {
        await safeReply(msg.chat.id, [
          `🎉 ${FS("ʙᴏᴛ ɪꜱ ʀᴇᴀᴅʏ!")} 🌸`,
          UI.lineLong,
          "",
          `  ${UI.leaf} <i>ᴜꜱᴇ</i> <code>/help</code> <i>ᴛᴏ ꜱᴇᴇ ᴄᴏᴍᴍᴀɴᴅꜱ</i>`,
        ].join("\n"));
      }
    } catch (e) { LOG.error("ɴᴇᴡ_ᴄʜᴀᴛ_ᴍᴇᴍʙᴇʀꜱ ᴇʀʀᴏʀ:", e); }
  });

  // ── ᴘʀɪᴠᴀᴛᴇ ʀᴇᴅɪʀᴇᴄᴛ ────────────────────────────────────────────────────
  async function redirectToGroup(chatId, replyToId) {
    return tbot.sendMessage(chatId, [
      `🌸 ${FS("ɢʀᴏᴜᴘ ᴏɴʟʏ ꜰᴇᴀᴛᴜʀᴇ")}`,
      UI.lineLong,
      "",
      `  ${UI.arrow} ${FS("ᴛʜɪꜱ ᴄᴏᴍᴍᴀɴᴅ ᴡᴏʀᴋꜱ ᴏɴʟʏ ɪɴ ᴛʜᴇ ᴏꜰꜰɪᴄɪᴀʟ ɢʀᴏᴜᴘ.")}`,
      `  <i>ᴄʟɪᴄᴋ ʙᴇʟᴏᴡ ᴛᴏ ᴊᴏɪɴ ᴀɴᴅ ᴜꜱᴇ</i> <code>/pair</code>`,
    ].join("\n"), {
      parse_mode: "HTML",
      reply_to_message_id: replyToId,
      reply_markup: {
        inline_keyboard: [[
          { text: "🌷  ᴊᴏɪɴ ᴏꜰꜰɪᴄɪᴀʟ ɢʀᴏᴜᴘ", url: GROUP_INVITE_LINK },
        ]],
      },
    }).catch(() => {});
  }

  // ── ᴄᴏᴍᴍᴀɴᴅ ᴘᴀʀꜱᴇʀ ──────────────────────────────────────────────────────
  function parseCmd(msg) {
    if (!msg?.text) return null;
    const entities = msg.entities || [];
    if (entities.length > 0) {
      const first = entities[0];
      if (first.type === "bot_command" && first.offset === 0) {
        const raw  = msg.text.slice(0, first.length);
        const cmd  = raw.split(/[@\s]/)[0].replace(/^\//, "").toLowerCase();
        const args = msg.text.slice(first.length).trim();
        return { cmd, args };
      }
    }
    if (!msg.text.startsWith("/")) return null;
    const [rawCmd, ...rest] = msg.text.trim().split(/\s+/);
    return {
      cmd: rawCmd.split("@")[0].replace(/^\//, "").toLowerCase(),
      args: rest.join(" ").trim(),
    };
  }

  // ── ᴀᴅᴍɪɴ ɢᴜᴀʀᴅ ─────────────────────────────────────────────────────────
  async function requireAdmin(msg, chatId, replyId) {
    if (!isAllowedGroup(msg)) return false;
    if (!(await isAdmin(msg))) {
      await safeReply(chatId, [
        `🚫 ${FS("ᴀᴅᴍɪɴꜱ ᴏɴʟʏ")}`,
        UI.lineLong,
        "",
        `  <i>ᴛʜɪꜱ ᴄᴏᴍᴍᴀɴᴅ ɪꜱ ʀᴇꜱᴛʀɪᴄᴛᴇᴅ ᴛᴏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴꜱ.</i>`,
      ].join("\n"), { reply_to_message_id: replyId });
      return false;
    }
    return true;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  🎯  ᴄᴏᴍᴍᴀɴᴅ ʜᴀɴᴅʟᴇʀꜱ
  // ═══════════════════════════════════════════════════════════════════════════

  // ── /start ────────────────────────────────────────────────────────────────
  async function cmdStart(msg, chatId, replyId) {
    if (isPrivate(msg)) return redirectToGroup(chatId, replyId);
    if (!isAllowedGroup(msg)) return;
    return safeReply(chatId, [
      `${UI.crown} ${FS("ʀᴀʜɪ ʙᴏᴛ")} ${UI.crown}`,
      UI.lineArrows,
      "",
      `  🍉 ${FS("ꜰᴀꜱᴛ & ꜱᴇᴄᴜʀᴇ ᴡʜᴀᴛꜱᴀᴘᴘ ᴘᴀɪʀɪɴɢ.")}`,
      "",
      boxCurly(
        [
          `◆ ${FS("ᴘᴀɪʀ ᴄᴏᴅᴇ")}`,
          `<code>/pair +8801711209381</code>`,
        ]
      ),
      "",
      boxCurly(
        [
          `◆ ${FS("ᴀʟʟ ᴄᴏᴍᴍᴀɴᴅꜱ")}`,
          `<code>/help</code>`,
        ]
      ),
      "",
      `  🌻 <i>ᴇɴᴊᴏʏ — ꜱᴛᴀʏ ꜱᴀꜰᴇ!</i> ☘️`,
    ].join("\n"), { reply_to_message_id: replyId });
  }

  // ── /help ─────────────────────────────────────────────────────────────────
  async function cmdHelp(msg, chatId, replyId) {
    if (isPrivate(msg)) return redirectToGroup(chatId, replyId);
    if (!isAllowedGroup(msg)) return;
    return safeReply(chatId, buildHelpMessage(), { reply_to_message_id: replyId });
  }

  // ── /ping ─────────────────────────────────────────────────────────────────
  async function cmdPing(msg, chatId, replyId) {
    if (isPrivate(msg)) return redirectToGroup(chatId, replyId);
    if (!isAllowedGroup(msg)) return;
    const start = Date.now();
    const m = await safeReply(chatId, `🏓 ${FS("ᴘɪɴɢɪɴɢ...")}`, {
      reply_to_message_id: replyId,
    });
    const ms = Date.now() - start;
    const quality = ms < 200 ? "🟢 ᴇxᴄᴇʟʟᴇɴᴛ" : ms < 500 ? "🟡 ɢᴏᴏᴅ" : "🔴 ꜱʟᴏᴡ";
    return safeEdit(chatId, m.message_id, [
      `🏓 ${FS("ᴘᴏɴɢ!")}`,
      UI.lineLong,
      "",
      boxHeavy(
        [
          `◆ ${FS("ʟᴀᴛᴇɴᴄʏ")}  <b>${ms}ᴍꜱ</b>`,
          `◆ ${FS("ǫᴜᴀʟɪᴛʏ")}  ${quality}`,
        ],
        "ᴘɪɴɢ"
      ),
      "",
      `  ${progressBar(Math.min(100, 100 - ms / 10))}`,
    ].join("\n"));
  }

  // ── /pair ─────────────────────────────────────────────────────────────────
  async function cmdPair(msg, chatId, replyId, args) {
    if (isPrivate(msg)) return redirectToGroup(chatId, replyId);
    if (!isAllowedGroup(msg)) return;

    if (!args) {
      return safeReply(chatId, [
        `🛑 ${FS("ᴜꜱᴀɢᴇ")}`,
        UI.lineLong,
        "",
        boxCurly(
          [
            `<code>/pair +88017...</code>`,
            `<code>/pair 88017...</code>`,
          ],
          "ᴜꜱᴀɢᴇ"
        ),
        "",
        `  💡 <i>ɪɴᴄʟᴜᴅᴇ ᴄᴏᴜɴᴛʀʏ ᴄᴏᴅᴇ.</i>`,
      ].join("\n"), { reply_to_message_id: replyId });
    }

    const digits = args.replace(/\D/g, "");
    if (!digits || digits.length < 6) {
      return safeReply(chatId, [
        `${UI.cross} ${FS("ɪɴᴠᴀʟɪᴅ ɴᴜᴍʙᴇʀ.")}`,
        `<i>ᴇxᴀᴍᴘʟᴇ:</i> <code>/pair +8801711209381</code>`,
      ].join("\n"), { reply_to_message_id: replyId });
    }

    const userId   = msg.from?.id || msg.sender_chat?.id;
    const lastPair = pairCooldown.get(userId) || 0;
    const remain   = PAIR_COOLDOWN_MS - (Date.now() - lastPair);
    if (remain > 0) {
      const secs = Math.ceil(remain / 1000);
      const pct  = Math.round((remain / PAIR_COOLDOWN_MS) * 100);
      return safeReply(chatId, [
        `⏳ ${FS("ꜱʟᴏᴡ ᴅᴏᴡɴ!")}`,
        UI.lineLong,
        "",
        `  <i>ᴡᴀɪᴛ</i> <b>${secs}ꜱ</b> <i>ʙᴇꜰᴏʀᴇ ɴᴇxᴛ ᴄᴏᴅᴇ.</i>`,
        "",
        `  ${progressBar(pct)}`,
      ].join("\n"), { reply_to_message_id: replyId });
    }
    pairCooldown.set(userId, Date.now());

    return doPair(chatId, args, replyId);
  }

  // ── /reactp ───────────────────────────────────────────────────────────────
  async function cmdReactPost(msg, chatId, replyId, args) {
    if (!isAllowedGroup(msg) && !isPrivate(msg)) return;

    const parts    = (args || "").trim().split(/\s+/);
    const postLink = parts[0];

    if (!postLink || !postLink.startsWith("https://whatsapp.com/channel/")) {
      return safeReply(chatId, [
        `❓ ${FS("ᴜꜱᴀɢᴇ")}`,
        UI.lineLong,
        "",
        boxCurly(
          [`<code>/reactp https://... 🍉👀🎀</code>`],
          "ᴜꜱᴀɢᴇ"
        ),
        "",
        `  <i>ᴇᴍᴏᴊɪꜱ ᴏᴘᴛɪᴏɴᴀʟ.</i>`,
      ].join("\n"), { reply_to_message_id: replyId });
    }

    const emojiList = parts.slice(1).join("")
      .match(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu) || ["🔥"];
    const chosenEmoji = emojiList[Math.floor(Math.random() * emojiList.length)];

    const connections = manager.getAllConnections();
    const active = connections.find((c) => c.healthy);
    if (!active) {
      return safeReply(chatId, `${UI.cross} ${FS("ɴᴏ ᴀᴄᴛɪᴠᴇ ꜱᴇꜱꜱɪᴏɴ.")}`,
        { reply_to_message_id: replyId });
    }
    const sock = active.connection;

    await safeReply(chatId, [
      `⏳ ${FS("ʀᴇᴀᴄᴛɪɴɢ...")}`,
      UI.lineThin,
      `  ◆ ${FS("ᴄʜᴏꜱᴇɴ")}  ${chosenEmoji}`,
    ].join("\n"), { reply_to_message_id: replyId });

    try {
      const msgNumber = parseInt(postLink.split("/").pop());
      const info = await sock.newsletterInfo(postLink);
      const newsletterJid = info.id;

      const msgs = await sock.newsletterFetchMessages(newsletterJid, 20);
      const targetMsg = msgs.find((m) => m.newsletterServerId === msgNumber);

      if (!targetMsg) {
        return safeReply(chatId,
          `${UI.cross} ${FS("ᴘᴏꜱᴛ")} #${msgNumber} ${FS("ɴᴏᴛ ꜰᴏᴜɴᴅ.")}`,
          { reply_to_message_id: replyId });
      }

      await sock.newsletterReactMessage(newsletterJid, targetMsg.key.id, chosenEmoji);

      return safeReply(chatId, [
        `${UI.check} ${FS("ʀᴇᴀᴄᴛᴇᴅ!")}`,
        UI.lineLong,
        "",
        boxHeavy(
          [
            `◆ ${FS("ᴘᴏꜱᴛ")}  #${msgNumber}`,
            `◆ ${FS("ᴇᴍᴏᴊɪ")}  ${chosenEmoji}`,
          ],
          "ʀᴇᴀᴄᴛɪᴏɴ"
        ),
      ].join("\n"), { reply_to_message_id: replyId });
    } catch (err) {
      return safeReply(chatId,
        `${UI.cross} ${FS("ꜰᴀɪʟᴇᴅ")}\n<i>${esc(err?.message || String(err))}</i>`,
        { reply_to_message_id: replyId });
    }
  }

  // ── /s ────────────────────────────────────────────────────────────────────
  async function cmdEval(msg, chatId, replyId, args) {
    const spaceIdx = (args || "").indexOf(" ");

    if (spaceIdx === -1) {
      return safeReply(chatId, [
        `❓ ${FS("ᴜꜱᴀɢᴇ")}`,
        UI.lineLong,
        "",
        boxHeavy(
          [
            `<code>/s ID code</code>`,
            `<code>/s 8801... sock.user</code>`,
          ],
          "ᴜꜱᴀɢᴇ"
        ),
        "",
        `  💡 ${FS("ᴛɪᴘꜱ")}`,
        UI.lineThin,
        `  • ʟᴀʀɢᴇ → .ᴊꜱᴏɴ ꜰɪʟᴇ`,
        `  • ᴛɪᴍᴇᴏᴜᴛ: 30ꜱ`,
      ].join("\n"), { reply_to_message_id: replyId });
    }

    const sid  = args.slice(0, spaceIdx).trim().replace(/\D/g, "");
    const code = args.slice(spaceIdx + 1).trim();

    if (!sid || !code) {
      return safeReply(chatId, `${UI.cross} ${FS("ᴍɪꜱꜱɪɴɢ ꜱɪᴅ ᴏʀ ᴄᴏᴅᴇ.")}`,
        { reply_to_message_id: replyId });
    }

    const entry = manager.sessions.get(sid);
    if (!entry?.sock) {
      const allSids = [...(manager.sessions?.keys() || [])]
        .map((s) => `<code>${esc(s)}</code>`).join(", ");
      return safeReply(chatId, [
        `${UI.cross} ${FS("ꜱᴇꜱꜱɪᴏɴ ɴᴏᴛ ꜰᴏᴜɴᴅ")}`,
        UI.lineLong,
        "",
        boxHeavy(
          [
            `◆ ${FS("ꜱɪᴅ")}  <code>${esc(sid)}</code>`,
            `◆ ${FS("ᴀᴠᴀɪʟ")}  ${allSids || "<i>ɴᴏɴᴇ</i>"}`,
          ],
          "ᴅᴇᴛᴀɪʟꜱ"
        ),
      ].join("\n"), { reply_to_message_id: replyId });
    }

    const sock        = entry.sock;
    const sessionUser = sock.user?.name || sock.user?.id?.split(":")?.[0] || sid;
    const isHealthy   = entry.healthy ?? entry.status === "open";

    const statusMsg = await safeReply(chatId, [
      `⏳ ${FS("ᴇxᴇᴄᴜᴛɪɴɢ...")}`,
      UI.lineThin,
      `  ◆ ${FS("ꜱᴇꜱꜱɪᴏɴ")}  <code>${esc(sid)}</code>  ${isHealthy ? "🟢" : "🔴"}`,
      `  ◆ ${FS("ᴄᴏᴅᴇ")}  <code>${esc(code.slice(0, 40))}${
        code.length > 40 ? "..." : ""}</code>`,
      "",
      `  ${progressBar(50)}`,
    ].join("\n"), { reply_to_message_id: replyId });

    const startTime = Date.now();

    try {
      const AsyncFn = Object.getPrototypeOf(async function () {}).constructor;
      const fn      = new AsyncFn("sock", `return await (${code})`);

      const result = await Promise.race([
        fn(sock),
        new Promise((_, rej) =>
          setTimeout(() => rej(new Error("ᴛɪᴍᴇᴅ ᴏᴜᴛ (30ꜱ)")), CMD_TIMEOUT_MS)
        ),
      ]);

      const execMs = Date.now() - startTime;
      const { resultStr, typeSummary } = serializeResult(result);

      try { await tbot.deleteMessage(chatId, statusMsg?.message_id); } catch {}

      const sizeKB = (resultStr.length / 1024).toFixed(1);
      const headerText = [
        `${UI.check} ${FS("ᴅᴏɴᴇ!")}`,
        UI.lineLong,
        "",
        boxHeavy(
          [
            `◆ ${FS("ꜱᴇꜱꜱɪᴏɴ")} <code>${esc(sid)}</code>`,
            `◆ ${FS("ᴜꜱᴇʀ")}    <i>${esc(sessionUser)}</i>`,
            `◆ ${FS("ᴛʏᴘᴇ")}    ${typeSummary}`,
            `◆ ${FS("ᴛɪᴍᴇ")}    <b>${execMs}ᴍꜱ</b>`,
            `◆ ${FS("ꜱɪᴢᴇ")}    <b>${sizeKB} ᴋʙ</b>`,
          ],
          "ᴇxᴇᴄ"
        ),
      ].join("\n");

      if (resultStr.length <= TG_LIMIT_MSG) {
        const lines = resultStr.split("\n").slice(0, 18);
        const maxLen = Math.max(...lines.map((l) => l.length), 16);
        const width = Math.min(maxLen + 2, 24);

        return safeReply(chatId, [
          headerText,
          "",
          `${UI.spark} ${FS("ʀᴇꜱᴜʟᴛ")} ${UI.spark}`,
          `┏${"━".repeat(width)}┓`,
          ...lines.map((line) => `┃ <code>${esc(line.slice(0, width - 2))}</code>`),
          `┗${"━".repeat(width)}┛`,
        ].join("\n"), { reply_to_message_id: replyId });
      }

      return sendLongOutput(chatId, replyId, headerText, resultStr, code, sid);

    } catch (err) {
      const execMs = Date.now() - startTime;
      try { await tbot.deleteMessage(chatId, statusMsg?.message_id); } catch {}

      const errMsg = err?.message || String(err);
      const hint =
        errMsg.includes("timed out")        ? `\n  ⏰ <i>ᴛʀʏ ʟɪɢʜᴛᴇʀ ǫᴜᴇʀʏ.</i>` :
        errMsg.includes("not a function")   ? `\n  💡 <i>ᴄʜᴇᴄᴋ ᴍᴇᴛʜᴏᴅ.</i>` :
        errMsg.includes("Cannot read")      ? `\n  💡 <i>ᴘʀᴏᴘ ᴜɴᴅᴇꜰɪɴᴇᴅ.</i>` :
        errMsg.includes("Unexpected token") ? `\n  💡 <i>ʀᴇᴍᴏᴠᴇ ꜱᴇᴍɪᴄᴏʟᴏɴꜱ.</i>` : "";

      return safeReply(chatId, [
        `${UI.cross} ${FS("ᴇʀʀᴏʀ")} <code>${esc(sid)}</code>`,
        UI.lineLong,
        "",
        boxHeavy(
          [
            `◆ ${FS("ᴛɪᴍᴇ")}  ⚡ ${execMs}ᴍꜱ`,
            `⚠ <code>${esc(errMsg.slice(0, 150))}</code>`,
          ],
          "ᴇʀʀᴏʀ"
        ),
        hint,
      ].filter(Boolean).join("\n"), { reply_to_message_id: replyId });
    }
  }

  // ── /as ───────────────────────────────────────────────────────────────────
  async function cmdEvalAll(msg, chatId, replyId, args) {
    const code = (args || "").trim();

    if (!code) {
      return safeReply(chatId, [
        `❓ ${FS("ᴜꜱᴀɢᴇ")}`,
        UI.lineLong,
        "",
        boxHeavy(
          [
            `<code>/as sock.sendMessage()</code>`,
            `<code>/as sock.updateProfile()</code>`,
          ],
          "ᴜꜱᴀɢᴇ"
        ),
        "",
        `  💡 <i>ʀᴜɴꜱ ᴏɴ ᴀʟʟ ꜱᴇꜱꜱɪᴏɴꜱ</i>`,
      ].join("\n"), { reply_to_message_id: replyId });
    }

    const allEntries = [...manager.sessions.entries()].filter(
      ([, e]) => e?.sock &&
        (e.healthy === true || e.status === "connected" || e.status === "open")
    );

    const statusMsg = await safeReply(chatId, [
      `⏳ ${FS("ʙʀᴏᴀᴅᴄᴀꜱᴛɪɴɢ...")}`,
      UI.lineThin,
      `  ◆ ${FS("ꜱᴇꜱꜱɪᴏɴꜱ")}  <b>${allEntries.length}</b>`,
      `  ◆ ${FS("ᴄᴏᴅᴇ")}  <code>${esc(code.slice(0, 40))}</code>`,
      "",
      `  ${progressBar(50)}`,
    ].join("\n"), { reply_to_message_id: replyId });

    const startTime = Date.now();
    const AsyncFn   = Object.getPrototypeOf(async function () {}).constructor;

    const results = await Promise.allSettled(
      allEntries.map(async ([sid, entry]) => {
        const fn = new AsyncFn("sock", `return await (${code})`);
        const result = await Promise.race([
          fn(entry.sock),
          new Promise((_, rej) =>
            setTimeout(() => rej(new Error("ᴛɪᴍᴇᴏᴜᴛ 30ꜱ")), CMD_TIMEOUT_MS)
          ),
        ]);
        return { sid, result };
      })
    );

    const execMs = Date.now() - startTime;
    try { await tbot.deleteMessage(chatId, statusMsg?.message_id); } catch {}

    let successCount = 0, failCount = 0;
    const lines = [];

    results.forEach((r, i) => {
      const [sid, entry] = allEntries[i];
      const user = entry?.sock?.user?.name ||
                   entry?.sock?.user?.id?.split(":")?.[0] || sid;

      if (r.status === "fulfilled") {
        successCount++;
        let preview;
        try {
          preview = r.value?.result === undefined
            ? "ᴠᴏɪᴅ"
            : JSON.stringify(r.value.result).slice(0, 60);
        } catch { preview = String(r.value?.result).slice(0, 60); }
        lines.push(
          `${UI.check} <code>${esc(sid)}</code> • <i>${esc(user)}</i>\n` +
          `    » <code>${esc(preview)}</code>`
        );
      } else {
        failCount++;
        const errMsg = r.reason?.message || String(r.reason);
        lines.push(
          `${UI.cross} <code>${esc(sid)}</code> • <i>${esc(user)}</i>\n` +
          `    » <i>${esc(errMsg.slice(0, 60))}</i>`
        );
      }
    });

    const summary = [
      `${UI.crown} ${FS("ᴀʟʟ ᴅᴏɴᴇ!")} ${UI.crown}`,
      UI.lineArrows,
      "",
      boxHeavy(
        [
          `✔ ${FS("ᴏᴋ")}     <b>${successCount}</b>`,
          `✘ ${FS("ꜰᴀɪʟ")}   <b>${failCount}</b>`,
          `◆ ${FS("ᴛᴏᴛᴀʟ")}  <b>${allEntries.length}</b>`,
          `⚡ ${FS("ᴛɪᴍᴇ")}   <b>${execMs}ᴍꜱ</b>`,
        ],
        "ꜱᴜᴍᴍᴀʀʏ"
      ),
      "",
      UI.lineThin,
      "",
      ...lines,
    ].join("\n");

    if (summary.length <= TG_LIMIT_SUMMARY) {
      return safeReply(chatId, summary, { reply_to_message_id: replyId });
    }

    const tmpPath = path.join(os.tmpdir(), `as_result_${Date.now()}.txt`);
    try {
      const plainLines = results.map((r, i) => {
        const sid = allEntries[i][0];
        if (r.status === "fulfilled") {
          let res;
          try { res = JSON.stringify(r.value?.result, null, 2); }
          catch { res = String(r.value?.result); }
          return `✅ ${sid}\n${res}\n`;
        }
        return `❌ ${sid}\n${r.reason?.message || r.reason}\n`;
      }).join("\n---\n");

      await fs.promises.writeFile(tmpPath, plainLines, "utf8");
      await tbot.sendDocument(chatId, tmpPath, {
        caption: [
          `${UI.crown} ${FS("ᴀʟʟ ᴅᴏɴᴇ!")} ${UI.crown}`,
          `✅ ${successCount}  ❌ ${failCount}  🔢 ${allEntries.length}`,
        ].join("\n"),
        parse_mode: "HTML",
        reply_to_message_id: replyId,
      });
    } finally {
      fs.promises.unlink(tmpPath).catch(() => {});
    }
  }

  // ── /sessions ─────────────────────────────────────────────────────────────
  async function cmdSessions(msg, chatId, replyId) {
    if (!(await requireAdmin(msg, chatId, replyId))) return;

    const conns = manager.getAllConnections?.() || [];
    if (conns.length === 0) {
      return safeReply(chatId, [
        `🌙 ${FS("ɴᴏ ᴀᴄᴛɪᴠᴇ ꜱᴇꜱꜱɪᴏɴꜱ")}`,
        UI.lineLong,
        "",
        `  <i>ɴᴏ ꜱᴇꜱꜱɪᴏɴꜱ ʀᴇɢɪꜱᴛᴇʀᴇᴅ.</i>`,
      ].join("\n"), { reply_to_message_id: replyId });
    }

    const connected    = conns.filter((c) => c.healthy).length;
    const disconnected = conns.length - connected;
    const healthPct    = Math.round((connected / conns.length) * 100);

    let text = [
      `${UI.diamond} ${FS("ꜱᴇꜱꜱɪᴏɴꜱ")} ${UI.diamond}`,
      UI.lineArrows,
      "",
      boxHeavy(
        [
          `◆ ${FS("ᴛᴏᴛᴀʟ")}  <b>${conns.length}</b>`,
          `🟢 ${FS("ᴏɴʟɪɴᴇ")} <b>${connected}</b>`,
          `🔴 ${FS("ᴏꜰꜰ")}    <b>${disconnected}</b>`,
        ],
        "ꜱᴛᴀᴛꜱ"
      ),
      "",
      `  ${progressBar(healthPct)}  ${healthPct}%`,
      "",
      UI.lineThin,
      "",
    ].join("\n");

    conns.forEach((c, i) => {
      const sid  = c.sessionId || c.file_path || "ᴜɴᴋɴᴏᴡɴ";
      const user = c.connection?.user?.name ||
                   c.connection?.user?.id?.split(":")?.[0] || "—";
      const dot  = c.healthy ? "🟢" : "🔴";
      text += `${dot} <b>${i + 1}.</b> <code>${esc(sid)}</code>\n`;
      text += `    › ${esc(user)}\n\n`;
    });

    return safeReply(chatId, text, {
      reply_to_message_id: replyId,
      disable_web_page_preview: true,
    });
  }

  // ── /status ───────────────────────────────────────────────────────────────
  async function cmdStatus(msg, chatId, replyId) {
    if (!(await requireAdmin(msg, chatId, replyId))) return;

    const conns  = manager.getAllConnections?.() || [];
    const online = conns.filter((c) => c.healthy).length;
    const upSec  = Math.floor(process.uptime());
    const uptimeFmt = `${Math.floor(upSec / 3600)}ʜ ${Math.floor((upSec % 3600) / 60)}ᴍ`;
    const memMb  = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
    const memPct = Math.min(100, Math.round((memMb / 512) * 100));
    const connPct = conns.length ? Math.round((online / conns.length) * 100) : 0;

    return safeReply(chatId, [
      `${UI.crown} ${FS("ꜱᴛᴀᴛᴜꜱ")} ${UI.crown}`,
      UI.lineArrows,
      "",
      boxDouble(
        [
          `◆ ${FS("ᴜᴘᴛɪᴍᴇ")}   <code>${uptimeFmt}</code>`,
          `◆ ${FS("ᴍᴇᴍ")}      <code>${memMb}ᴍʙ</code>`,
          `◆ ${FS("ꜱᴇꜱꜱ")}     <b>${conns.length}</b>`,
          `◆ ${FS("ᴘʟᴀᴛ")}     <code>${process.platform}</code>`,
          `◆ ${FS("ɴᴏᴅᴇ")}     <code>${process.version}</code>`,
        ],
        "ꜱʏꜱᴛᴇᴍ"
      ),
      "",
      `${FS("ᴍᴇᴍ")}  ${progressBar(memPct)}  ${memPct}%`,
      `${FS("ᴏɴʟ")}  ${progressBar(connPct)}  ${connPct}%`,
    ].join("\n"), { reply_to_message_id: replyId });
  }

  // ── /stop ─────────────────────────────────────────────────────────────────
  async function cmdStop(msg, chatId, replyId, args) {
    if (!(await requireAdmin(msg, chatId, replyId))) return;

    const sid = (args || "").replace(/\D/g, "");
    if (!sid) {
      return safeReply(chatId, `❓ ${FS("ᴜꜱᴀɢᴇ")} <code>/stop 91XXXXXXXXXX</code>`,
        { reply_to_message_id: replyId });
    }
    try {
      await manager.stop(sid);
      return safeReply(chatId, [
        `⏹️ ${FS("ꜱᴛᴏᴘᴘᴇᴅ")}`,
        UI.lineLong,
        "",
        boxHeavy(
          [`◆ ${FS("ꜱɪᴅ")}  <code>${esc(sid)}</code>`],
          "ᴅᴏɴᴇ"
        ),
        "",
        `  <i>ᴜꜱᴇ</i> <code>/pair</code> <i>ᴛᴏ ʀᴇᴄᴏɴɴᴇᴄᴛ.</i>`,
      ].join("\n"), { reply_to_message_id: replyId });
    } catch (e) {
      return safeReply(chatId,
        `${UI.cross} ${FS("ꜰᴀɪʟᴇᴅ")}\n  <i>${esc(e?.message)}</i>`,
        { reply_to_message_id: replyId });
    }
  }

  // ── /logout ───────────────────────────────────────────────────────────────
  async function cmdLogout(msg, chatId, replyId, args) {
    if (!(await requireAdmin(msg, chatId, replyId))) return;

    const sid = (args || "").replace(/\D/g, "");
    if (!sid) {
      return safeReply(chatId, `❓ ${FS("ᴜꜱᴀɢᴇ")} <code>/logout 91XXXXXXXXXX</code>`,
        { reply_to_message_id: replyId });
    }
    try {
      await manager.logout(sid);
      return safeReply(chatId, [
        `🗑️ ${FS("ʟᴏɢɢᴇᴅ ᴏᴜᴛ")}`,
        UI.lineLong,
        "",
        boxHeavy(
          [`◆ ${FS("ꜱɪᴅ")}  <code>${esc(sid)}</code>`],
          "ᴅᴏɴᴇ"
        ),
        "",
        `  <i>ᴄʀᴇᴅᴇɴᴛɪᴀʟꜱ ᴅᴇʟᴇᴛᴇᴅ.</i>`,
      ].join("\n"), { reply_to_message_id: replyId });
    } catch (e) {
      return safeReply(chatId,
        `${UI.cross} ${FS("ꜰᴀɪʟᴇᴅ")}\n  <i>${esc(e?.message)}</i>`,
        { reply_to_message_id: replyId });
    }
  }

  // ── /restart ──────────────────────────────────────────────────────────────
  async function cmdRestart(msg, chatId, replyId, args) {
    if (!(await requireAdmin(msg, chatId, replyId))) return;

    const sid = (args || "").replace(/\D/g, "");
    if (!sid) {
      return safeReply(chatId, `❓ ${FS("ᴜꜱᴀɢᴇ")} <code>/restart 91XXXXXXXXXX</code>`,
        { reply_to_message_id: replyId });
    }
    try {
      await manager.stop(sid);
      await new Promise((r) => setTimeout(r, 1500));
      await manager.start(sid);
      return safeReply(chatId, [
        `🔄 ${FS("ʀᴇꜱᴛᴀʀᴛᴇᴅ")}`,
        UI.lineLong,
        "",
        boxHeavy(
          [`◆ ${FS("ꜱɪᴅ")}  <code>${esc(sid)}</code>`],
          "ᴅᴏɴᴇ"
        ),
      ].join("\n"), { reply_to_message_id: replyId });
    } catch (e) {
      return safeReply(chatId,
        `${UI.cross} ${FS("ꜰᴀɪʟᴇᴅ")}\n  <i>${esc(e?.message)}</i>`,
        { reply_to_message_id: replyId });
    }
  }

  // ── /d ────────────────────────────────────────────────────────────────────
  async function cmdShell(msg, chatId, replyId, args) {
    const rawCmd = (args || "").trim();
    if (!rawCmd) {
      return safeReply(chatId, [
        `ℹ️ ${FS("ᴜꜱᴀɢᴇ")}`,
        UI.lineLong,
        "",
        boxCurly(
          [
            `<code>/d git pull</code>`,
            `<code>/d pm2 list</code>`,
            `<code>/d df -h</code>`,
          ],
          "ꜱʜᴇʟʟ"
        ),
      ].join("\n"), { reply_to_message_id: replyId });
    }

    await safeReply(chatId, [
      `⚙️ ${FS("ᴇxᴇᴄᴜᴛɪɴɢ...")}`,
      UI.lineThin,
      `  <code>${esc(rawCmd)}</code>`,
      `  ${progressBar(30)}`,
    ].join("\n"), { reply_to_message_id: replyId });

    const lines = [];
    let killed  = false;
    const child = spawn("bash", ["-lc", rawCmd], { env: process.env });

    const killTimer = setTimeout(() => {
      killed = true;
      try { child.kill("SIGKILL"); } catch {}
    }, CMD_TIMEOUT_MS);

    const pushLines = (chunk, src) => {
      chunk.toString().split(/\r?\n/).forEach((ln) => {
        if (ln && lines.length < MAX_CMD_LINES)
          lines.push(src === "err" ? `[ᴇʀʀ] ${ln}` : ln);
      });
    };

    child.stdout.on("data", (c) => pushLines(c, "out"));
    child.stderr.on("data", (c) => pushLines(c, "err"));

    child.on("error", async (err) => {
      clearTimeout(killTimer);
      await safeReply(chatId,
        `${UI.cross} ${FS("ꜱᴘᴀᴡɴ ᴇʀʀᴏʀ")} ${esc(String(err.message))}`,
        { reply_to_message_id: replyId });
    });

    child.on("close", async (code) => {
      clearTimeout(killTimer);

      const headerText = [
        `$ ${rawCmd}`,
        `ᴇxɪᴛ: ${code ?? "ɴᴜʟʟ"}${killed ? " (ᴋɪʟʟᴇᴅ)" : ""}`,
        "─".repeat(22),
      ].join("\n");

      const payload = (headerText + "\n" + lines.join("\n")).trim();
      if (!payload || lines.length === 0) {
        return safeReply(chatId, `⚠️ ${FS("ɴᴏ ᴏᴜᴛᴘᴜᴛ.")}`,
          { reply_to_message_id: replyId });
      }

      if (payload.length > MAX_CMD_CHARS || lines.length >= MAX_CMD_LINES) {
        const tmpPath = path.join(os.tmpdir(), `cmd_${Date.now()}.txt`);
        try {
          await fs.promises.writeFile(tmpPath, payload, "utf8");
          await tbot.sendDocument(chatId, tmpPath, {
            caption: `📄 <code>${esc(rawCmd)}</code> • ᴇxɪᴛ <b>${code}</b>`,
            parse_mode: "HTML",
            reply_to_message_id: replyId,
          });
        } catch {
          await safeReply(chatId,
            `⚠️ ${FS("ᴘʀᴇᴠɪᴇᴡ")}\n<code>${esc(payload.slice(0, MAX_CMD_CHARS))}</code>`,
            { reply_to_message_id: replyId });
        } finally {
          fs.promises.unlink(tmpPath).catch(() => {});
        }
      } else {
        const lines2 = lines.slice(0, 18);
        const maxLen2 = Math.max(...lines2.map((l) => l.length), 16);
        const width2 = Math.min(maxLen2 + 2, 24);

        await safeReply(chatId, [
          `${UI.check} ${FS("ꜱʜᴇʟʟ")}`,
          UI.lineThin,
          `┏${"━".repeat(width2)}┓`,
          ...lines2.map((l) => `┃ <code>${esc(l.slice(0, width2 - 2))}</code>`),
          `┗${"━".repeat(width2)}┛`,
          `<i>ᴇxɪᴛ: ${code}${killed ? " (ᴛɪᴍᴇᴏᴜᴛ)" : ""}</i>`,
        ].join("\n"), { reply_to_message_id: replyId });
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  🚦  ᴄᴏᴍᴍᴀɴᴅ ʀᴏᴜᴛᴇʀ
  // ═══════════════════════════════════════════════════════════════════════════
  const COMMANDS = {
    start:    cmdStart,
    help:     cmdHelp,
    ping:     cmdPing,
    pair:     cmdPair,
    reactp:   cmdReactPost,
    s:        cmdEval,
    as:       cmdEvalAll,
    sessions: cmdSessions,
    session:  cmdSessions,
    status:   cmdStatus,
    stop:     cmdStop,
    logout:   cmdLogout,
    restart:  cmdRestart,
    d:        cmdShell,
  };

  async function handleCommand(msg) {
    const parsed = parseCmd(msg);
    if (!parsed) return;

    const { cmd, args } = parsed;
    const chatId  = msg.chat.id;
    const replyId = msg.message_id;

    LOG.info(`/${cmd} ꜰʀᴏᴍ ${msg.from?.id || msg.sender_chat?.id}`);

    const handler = COMMANDS[cmd];
    if (!handler) {
      if (isAllowedGroup(msg)) {
        return safeReply(chatId,
          `💢 ${FS("ᴜɴᴋɴᴏᴡɴ")} <code>/${esc(cmd)}</code>\n\n  <i>ᴛʀʏ</i> <code>/help</code>`,
          { reply_to_message_id: replyId });
      }
      return;
    }

    try {
      await handler(msg, chatId, replyId, args);
    } catch (e) {
      LOG.error(`/${cmd} ꜰᴀɪʟᴇᴅ:`, e);
      await safeReply(chatId,
        `${UI.cross} ${
