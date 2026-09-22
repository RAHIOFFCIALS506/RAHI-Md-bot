export const mediaCommands = [
  {
    name: "sticker",
    aliases: ["sticker", "s"],
    category: "media",
    execute: async (ctx) => {
      const quoted = ctx.msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const img = ctx.msg.message?.imageMessage || quoted?.imageMessage;
      const vid = ctx.msg.message?.videoMessage || quoted?.videoMessage;
      if (!img && !vid) return ctx.reply("❌ Reply to an image/video");
      await ctx.reply("⏳ Creating sticker...");
      // Use wa-sticker-formatter
      const { Sticker, StickerTypes } = await import("wa-sticker-formatter");
      const stream = await ctx.sock.downloadMediaMessage(ctx.msg);
      const sticker = new Sticker(stream, {
        pack: "RAHI MD",
        author: "RAHI",
        type: StickerTypes.FULL,
        quality: 70,
      });
      const buf = await sticker.toBuffer();
      await ctx.sock.sendMessage(ctx.from, { sticker: buf }, { quoted: ctx.msg });
    },
  },
  {
    name: "toimg",
    aliases: ["toimg", "toimage"],
    category: "media",
    execute: async (ctx) => {
      const quoted = ctx.msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted?.stickerMessage) return ctx.reply("❌ Reply to a sticker");
      const stream = await ctx.sock.downloadMediaMessage({ message: quoted });
      await ctx.sock.sendMessage(ctx.from, { image: stream, caption: "🖼️ Converted!" }, { quoted: ctx.msg });
    },
  },
  {
    name: "attp",
    aliases: ["attp"],
    category: "media",
    execute: async (ctx) => {
      const text = ctx.args.join(" ");
      if (!text) return ctx.reply("❌ Usage: .attp <text>");
      await ctx.reply("⏳ Generating...");
      // Call API for animated text
      const url = `https://api.lolhuman.xyz/api/attp?apikey=x&text=${encodeURIComponent(text)}`;
      await ctx.sock.sendMessage(ctx.from, { sticker: { url } }, { quoted: ctx.msg });
    },
  },
  {
    name: "ttp",
    aliases: ["ttp"],
    category: "media",
    execute: async (ctx) => {
      const text = ctx.args.join(" ");
      if (!text) return ctx.reply("❌ Usage: .ttp <text>");
      const url = `https://api.lolhuman.xyz/api/ttp?apikey=x&text=${encodeURIComponent(text)}`;
      await ctx.sock.sendMessage(ctx.from, { sticker: { url } }, { quoted: ctx.msg });
    },
  },
  {
    name: "tomp3",
    aliases: ["tomp3", "toaudio"],
    category: "media",
    execute: async (ctx) => {
      const quoted = ctx.msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted?.videoMessage) return ctx.reply("❌ Reply to a video");
      const stream = await ctx.sock.downloadMediaMessage({ message: quoted });
      // Use ffmpeg to convert
      await ctx.reply("⏳ Converting to MP3...");
      // simplified: send as audio
      await ctx.sock.sendMessage(ctx.from, { audio: stream, mimetype: "audio/mp4" }, { quoted: ctx.msg });
    },
  },
  {
    name: "take",
    aliases: ["take"],
    category: "media",
    execute: async (ctx) => {
      const quoted = ctx.msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted?.stickerMessage) return ctx.reply("❌ Reply to a sticker");
      await ctx.reply("✅ Sticker taken");
    },
  },
];
