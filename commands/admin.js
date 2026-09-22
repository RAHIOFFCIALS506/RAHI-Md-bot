export const adminCommands = [
  {
    name: "kick",
    aliases: ["kick", "remove"],
    category: "admin",
    execute: async (ctx) => {
      if (!ctx.isGroup) return ctx.reply("❌ Group only");
      const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      if (!mentioned.length) return ctx.reply("❌ Mention a user to kick");
      try {
        await ctx.sock.groupParticipantsUpdate(ctx.from, mentioned, "remove");
        await ctx.reply("✅ User kicked");
      } catch (e) { await ctx.reply(`❌ ${e.message}`); }
    },
  },
  {
    name: "promote",
    aliases: ["promote"],
    category: "admin",
    execute: async (ctx) => {
      const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      if (!mentioned.length) return ctx.reply("❌ Mention a user");
      await ctx.sock.groupParticipantsUpdate(ctx.from, mentioned, "promote");
      await ctx.reply("✅ Promoted to admin");
    },
  },
  {
    name: "demote",
    aliases: ["demote"],
    category: "admin",
    execute: async (ctx) => {
      const mentioned = ctx.msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      if (!mentioned.length) return ctx.reply("❌ Mention a user");
      await ctx.sock.groupParticipantsUpdate(ctx.from, mentioned, "demote");
      await ctx.reply("✅ Demoted");
    },
  },
  {
    name: "mute",
    aliases: ["mute", "close"],
    category: "admin",
    execute: async (ctx) => {
      await ctx.sock.groupSettingUpdate(ctx.from, "announcement");
      await ctx.reply("🔇 Group muted");
    },
  },
  {
    name: "unmute",
    aliases: ["unmute", "open"],
    category: "admin",
    execute: async (ctx) => {
      await ctx.sock.groupSettingUpdate(ctx.from, "not_announcement");
      await ctx.reply("🔊 Group unmuted");
    },
  },
  {
    name: "tagall",
    aliases: ["tagall", "everyone"],
    category: "admin",
    execute: async (ctx) => {
      const meta = await ctx.sock.groupMetadata(ctx.from);
      const mentions = meta.participants.map((p) => p.id);
      const text = ctx.args.join(" ") || "Attention everyone!";
      await ctx.sock.sendMessage(ctx.from, {
        text: `📢 *${text}*\n\n${mentions.map((m) => `@${m.split("@")[0]}`).join(" ")}`,
        mentions,
      });
    },
  },
  {
    name: "hidetag",
    aliases: ["hidetag", "ht"],
    category: "admin",
    execute: async (ctx) => {
      const meta = await ctx.sock.groupMetadata(ctx.from);
      const mentions = meta.participants.map((p) => p.id);
      const text = ctx.args.join(" ") || "👋";
      await ctx.sock.sendMessage(ctx.from, { text, mentions });
    },
  },
  {
    name: "antilink",
    aliases: ["antilink"],
    category: "admin",
    execute: async (ctx) => {
      await ctx.reply("🔗 Antilink toggled");
    },
  },
  {
    name: "welcome",
    aliases: ["welcome"],
    category: "admin",
    execute: async (ctx) => {
      await ctx.reply("👋 Welcome message toggled");
    },
  },
  {
    name: "groupinfo",
    aliases: ["groupinfo", "ginfo"],
    category: "admin",
    execute: async (ctx) => {
      const meta = await ctx.sock.groupMetadata(ctx.from);
      await ctx.reply(`📊 *Group Info*\n\n• Name: ${meta.subject}\n• Members: ${meta.participants.length}\n• Owner: ${meta.owner?.split("@")[0] || "N/A"}\n• Created: ${new Date(meta.creation * 1000).toLocaleString()}`);
    },
  },
];
