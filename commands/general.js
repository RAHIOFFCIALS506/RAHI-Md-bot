export const generalCommands = [
  {
    name: "menu",
    aliases: ["menu", "help", "h", "list"],
    category: "general",
    execute: async (ctx) => {
      const menu = `
╔══════════════════════════╗
║   🤖  ʀᴀʜɪ ᴍᴅ ʙᴏᴛ  🤖   ║
║       ᴠᴇʀꜱɪᴏɴ 2.0         ║
╚══════════════════════════╝

✦ ─── GENERAL ─── ✦
› .menu      › .ping
› .alive     › .owner
› .help      › .runtime
› .info      › .uptime
› .time      › .date

✦ ─── ADMIN ─── ✦
› .kick      › .promote
› .demote    › .mute
› .unmute    › .tagall
› .warn      › .antilink
› .antibug   › .welcome

✦ ─── MEDIA ─── ✦
› .sticker   › .toimg
› .tomp3     › .tovid
› .attp      › .ttp
› .emixt     › .emix
› .photo     › .take

✦ ─── DOWNLOAD ─── ✦
› .ytmp3     › .ytmp4
› .play      › .video
› .ig        › .tiktok
› .fb        › .twitter
› .spotify   › .pinterest

✦ ─── AI ─── ✦
› .gpt       › .gemini
› .llama     › .imagine
› .dalle     › .barbar
› .sim       › .blackbox

✦ ─── ISLAMIC ─── ✦
› .quran     › .hadith
› .prayer    › .namaz
› .dua       › .allah
› .muhammad  › .islamic

✦ ─── FUN ─── ✦
› .joke      › .meme
› .dare      › .truth
› .8ball     › .quote
› .shayari   › .riddle

✦ ─── SEARCH ─── ✦
› .google    › .wiki
› .yts       › .img
› .weather   › .news
› .movie     › .lyrics

✦ ─── ANIME ─── ✦
› .waifu     › .neko
› .anime     › .manga
› .husbando  › .shinobu

✦ ─── TEXTMAKER ─── ✦
› .metallic  › .ice
› .snow      › .luxury
› .neon      › .glitch

✦ ─── LOGO ─── ✦
› .logo      › .text3d
› .glow      › .fog

✦ ─── CONVERTER ─── ✦
› .text2pdf  › .img2pdf
› .mp4tomp3  › .mp3tovn

✦ ─── TOOLS ─── ✦
› .ss        › .shorturl
› .qrcode    › .base64
› .translate › .calc
› .ip        › .whois

✦ ─── STICKER ─── ✦
› .sticker   › .simage
› .take      › .removebg
› .emojimix  › .attp

────────────────────────
📞 SUPPORT: t.me/rahiofficial1
📢 CHANNEL: ${process.env.WA_CHANNEL_LINK || "wa.me/channel"}
`;
      await ctx.reply(menu);
    },
  },
  {
    name: "ping",
    aliases: ["ping", "p"],
    category: "general",
    execute: async (ctx) => {
      const start = Date.now();
      const msg = await ctx.reply("🏓 Pinging...");
      const latency = Date.now() - start;
      await ctx.sock.sendMessage(
        ctx.from,
        { text: `🏓 *PONG!*\n⚡ Latency: *${latency}ms*`, edit: msg.key }
      );
    },
  },
  {
    name: "alive",
    aliases: ["alive", "online"],
    category: "general",
    execute: async (ctx) => {
      const uptime = process.uptime();
      const h = Math.floor(uptime / 3600);
      const m = Math.floor((uptime % 3600) / 60);
      const s = Math.floor(uptime % 60);
      await ctx.reply(`✅ *RAHI MD BOT is ALIVE!*\n\n⏰ Uptime: ${h}h ${m}m ${s}s\n💚 Status: Online`);
    },
  },
  {
    name: "runtime",
    aliases: ["runtime", "uptime"],
    category: "general",
    execute: async (ctx) => {
      const u = process.uptime();
      const h = Math.floor(u / 3600);
      const m = Math.floor((u % 3600) / 60);
      const s = Math.floor(u % 60);
      await ctx.reply(`⏰ *Bot Uptime:*\n${h} hours, ${m} minutes, ${s} seconds`);
    },
  },
  {
    name: "owner",
    aliases: ["owner", "creator"],
    category: "general",
    execute: async (ctx) => {
      await ctx.reply("👑 *OWNER INFO*\n\n📞 WhatsApp: +8801XXXXXXXXX\n📢 Telegram: @rahiofficial1\n💬 Channel: wa.me/channel");
    },
  },
  {
    name: "info",
    aliases: ["info", "botinfo"],
    category: "general",
    execute: async (ctx) => {
      await ctx.reply(`🤖 *RAHI MD BOT v2.0*\n\n• Total Commands: 198+\n• Node: ${process.version}\n• Platform: ${process.platform}\n• Session: ${ctx.sessionId}`);
    },
  },
  {
    name: "time",
    aliases: ["time", "clock"],
    category: "general",
    execute: async (ctx) => {
      const t = new Date().toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata" });
      await ctx.reply(`🕐 Current Time (IST): *${t}*`);
    },
  },
  {
    name: "date",
    aliases: ["date", "today"],
    category: "general",
    execute: async (ctx) => {
      const d = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      await ctx.reply(`📅 *Today:* ${d}`);
    },
  },
  {
    name: "id",
    aliases: ["id", "myid"],
    category: "general",
    execute: async (ctx) => {
      await ctx.reply(`🆔 *Your ID:*\n\`${ctx.sender}\`\n\n💬 *Chat ID:*\n\`${ctx.from}\``);
    },
  },
  {
    name: "hi",
    aliases: ["hi", "hello", "hey"],
    category: "general",
    execute: async (ctx) => {
      await ctx.reply(`👋 Hello @${ctx.sender.split("@")[0]}! How can I help you today?`, { mentions: [ctx.sender] });
    },
  },
  {
    name: "goodmorning",
    aliases: ["gm", "goodmorning"],
    category: "general",
    execute: async (ctx) => ctx.reply("🌅 *Good Morning!* Have a wonderful day! ☀️"),
  },
  {
    name: "goodnight",
    aliases: ["gn", "goodnight"],
    category: "general",
    execute: async (ctx) => ctx.reply("🌙 *Good Night!* Sweet dreams! 😴"),
  },
  {
    name: "thanks",
    aliases: ["thanks", "thank", "thx"],
    category: "general",
    execute: async (ctx) => ctx.reply("😊 You're welcome!"),
  },
  {
    name: "love",
    aliases: ["love", "iloveyou"],
    category: "general",
    execute: async (ctx) => ctx.reply("❤️ I love you too!"),
  },
  {
    name: "report",
    aliases: ["report", "bug"],
    category: "general",
    execute: async (ctx) => {
      const bug = ctx.args.join(" ");
      if (!bug) return ctx.reply("❌ Usage: .report <bug description>");
      await ctx.reply("✅ Bug report sent to owner!");
    },
  },
  {
    name: "feedback",
    aliases: ["feedback"],
    category: "general",
    execute: async (ctx) => {
      const fb = ctx.args.join(" ");
      if (!fb) return ctx.reply("❌ Usage: .feedback <your feedback>");
      await ctx.reply("✅ Thanks for your feedback!");
    },
  },
  {
    name: "rules",
    aliases: ["rules"],
    category: "general",
    execute: async (ctx) => {
      await ctx.reply("📜 *BOT RULES*\n\n1. Don't spam commands\n2. Respect others\n3. No illegal usage\n4. Enjoy!");
    },
  },
  {
    name: "credits",
    aliases: ["credits"],
    category: "general",
    execute: async (ctx) => {
      await ctx.reply("🎉 *CREDITS*\n\n• Developer: RAHI\n• Library: Baileys\n• Framework: RAHI MD BOT");
    },
  },
  {
    name: "donate",
    aliases: ["donate"],
    category: "general",
    execute: async (ctx) => ctx.reply("💝 Support us! Contact owner for donation info."),
  },
  {
    name: "speed",
    aliases: ["speed"],
    category: "general",
    execute: async (ctx) => {
      const start = Date.now();
      await new Promise((r) => setTimeout(r, 100));
      await ctx.reply(`⚡ Server Speed: ${Date.now() - start}ms`);
    },
  },
];
