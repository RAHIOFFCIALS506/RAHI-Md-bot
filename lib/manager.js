import { EventEmitter } from "events";
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from "@whiskeysockets/baileys";
import pino from "pino";
import path from "path";
import fs from "fs";

export class SessionManager extends EventEmitter {
  constructor() {
    super();
    this.sessions = new Map();
    this.sessionsDir = path.join(process.cwd(), "sessions");
    if (!fs.existsSync(this.sessionsDir)) fs.mkdirSync(this.sessionsDir, { recursive: true });
  }

  isRunning(sessionId) {
    const s = this.sessions.get(sessionId);
    return s?.status === "open" || s?.healthy === true;
  }

  async start(sessionId) {
    if (this.sessions.has(sessionId)) {
      const existing = this.sessions.get(sessionId);
      if (existing.sock) return existing.sock;
    }

    const sessionPath = path.join(this.sessionsDir, sessionId);
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: state,
      logger: pino({ level: "silent" }),
      printQRInTerminal: false,
      browser: ["RAHI MD", "Chrome", "1.0.0"],
      generateHighQualityLinkPreview: true,
    });

    const entry = {
      sock,
      sessionId,
      status: "connecting",
      healthy: false,
      file_path: sessionPath,
      createdAt: Date.now(),
    };
    this.sessions.set(sessionId, entry);

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === "open") {
        entry.status = "open";
        entry.healthy = true;
        this.emit("connected", sessionId);
        console.log(`✅ Session connected: ${sessionId}`);
      }

      if (connection === "close") {
        const code = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = code !== DisconnectReason.loggedOut;

        entry.status = "closed";
        entry.healthy = false;

        if (shouldReconnect) {
          console.log(`🔄 Reconnecting ${sessionId}...`);
          setTimeout(() => this.start(sessionId).catch(console.error), 3000);
        } else {
          console.log(`❌ Logged out: ${sessionId}`);
          this.emit("session.deleted", sessionId);
        }
      }
    });

    // Message handler
    sock.ev.on("messages.upsert", async ({ messages, type }) => {
      if (type !== "notify") return;
      for (const msg of messages) {
        if (!msg.message) continue;
        try {
          await this.handleMessage(sock, msg, sessionId);
        } catch (e) {
          console.error("Message error:", e);
        }
      }
    });

    return sock;
  }

  async handleMessage(sock, msg, sessionId) {
    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption ||
      "";

    if (!text) return;

    const prefix = ".";
    if (!text.startsWith(prefix)) return;

    const args = text.slice(prefix.length).trim().split(/\s+/);
    const command = args.shift().toLowerCase();
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const isGroup = from.endsWith("@g.us");

    const cmd = this.commands?.get(command);
    if (!cmd) return;

    const ctx = {
      sock,
      msg,
      from,
      sender,
      isGroup,
      sessionId,
      text: text.slice(prefix.length),
      args,
      reply: (content, opts = {}) =>
        sock.sendMessage(from, { text: content, ...opts }, { quoted: msg }),
      react: (emoji) =>
        sock.sendMessage(from, { react: { text: emoji, key: msg.key } }),
    };

    try {
      await cmd.execute(ctx);
    } catch (e) {
      console.error(`Command .${command} error:`, e);
      await ctx.reply(`❌ Error: ${e.message}`);
    }
  }

  async stop(sessionId) {
    const entry = this.sessions.get(sessionId);
    if (!entry) throw new Error("Session not found");
    try { entry.sock?.end?.(); } catch {}
    this.sessions.delete(sessionId);
    this.emit("session.deleted", sessionId);
  }

  async logout(sessionId) {
    const entry = this.sessions.get(sessionId);
    if (!entry) throw new Error("Session not found");
    try { await entry.sock?.logout?.(); } catch {}
    try {
      if (fs.existsSync(entry.file_path)) {
        fs.rmSync(entry.file_path, { recursive: true, force: true });
      }
    } catch {}
    this.sessions.delete(sessionId);
    this.emit("session.deleted", sessionId);
  }

  getAllConnections() {
    return [...this.sessions.values()].map((e) => ({
      sessionId: e.sessionId,
      connection: e.sock,
      healthy: e.healthy,
      status: e.status,
      file_path: e.file_path,
    }));
  }
}
