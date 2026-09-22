import axios from "axios";
import yts from "yt-search";

export const downloadCommands = [
  {
    name: "play",
    aliases: ["play", "song"],
    category: "download",
    execute: async (ctx) => {
      const query = ctx.args.join(" ");
      if (!query) return ctx.reply("❌ Usage: .play <song name>");
      await ctx.reply("🔍 Searching...");
      const { videos } = await yts(query);
      if (!videos?.length) return ctx.reply("❌ No results");
      const v = videos[0];
      await ctx.sock.sendMessage(ctx.from, {
        image: { url: v.thumbnail },
        caption: `🎵 *${v.title}*\n⏱️ ${v.timestamp}\n👤 ${v.author.name}\n\n⏳ Downloading audio...`,
      }, { quoted: ctx.msg });

      try {
        const api = `https://api.lolhuman.xyz/api/ytplaymp3?apikey=x&query=${encodeURIComponent(query)}`;
        const { data } = await axios.get(api);
        await ctx.sock.sendMessage(ctx.from, {
          audio: { url: data.result.audio },
          mimetype: "audio/mpeg",
        }, { quoted: ctx.msg });
      } catch (e) { await ctx.reply("❌ Download failed"); }
    },
  },
  {
    name: "ytmp3",
    aliases: ["ytmp3", "yta"],
    category: "download",
    execute: async (ctx) => {
      const url = ctx.args[0];
      if (!url || !url.includes("youtu")) return ctx.reply("❌ Provide YouTube URL");
      await ctx.reply("⏳ Downloading MP3...");
      try {
        const api = `https://api.lolhuman.xyz/api/ytaudio?apikey=x&url=${encodeURIComponent(url)}`;
        const { data } = await axios.get(api);
        await ctx.sock.sendMessage(ctx.from, {
          audio: { url: data.result.link },
          mimetype: "audio/mpeg",
        }, { quoted: ctx.msg });
      } catch (e) { await ctx.reply("❌ Failed"); }
    },
  },
  {
    name: "ytmp4",
    aliases: ["ytmp4", "ytv"],
    category: "download",
    execute: async (ctx) => {
      const url = ctx.args[0];
      if (!url || !url.includes("youtu")) return ctx.reply("❌ Provide YouTube URL");
      await ctx.reply("⏳ Downloading MP4...");
      try {
        const api = `https://api.lolhuman.xyz/api/ytvideo?apikey=x&url=${encodeURIComponent(url)}`;
        const { data } = await axios.get(api);
        await ctx.sock.sendMessage(ctx.from, {
          video: { url: data.result.link },
          caption: "🎬 Downloaded",
        }, { quoted: ctx.msg });
      } catch (e) { await ctx.reply("❌ Failed"); }
    },
  },
  {
    name: "tiktok",
    aliases: ["tiktok", "tt"],
    category: "download",
    execute: async (ctx) => {
      const url = ctx.args[0];
      if (!url || !url.includes("tiktok")) return ctx.reply("❌ Provide TikTok URL");
      await ctx.reply("⏳ Downloading...");
      try {
        const api = `https://api.lolhuman.xyz/api/tiktok?apikey=x&url=${encodeURIComponent(url)}`;
        const { data } = await axios.get(api);
        await ctx.sock.sendMessage(ctx.from, {
          video: { url: data.result.link },
          caption: `🎵 ${data.result.title}`,
        }, { quoted: ctx.msg });
      } catch (e) { await ctx.reply("❌ Failed"); }
    },
  },
  {
    name: "instagram",
    aliases: ["instagram", "ig"],
    category: "download",
    execute: async (ctx) => {
      const url = ctx.args[0];
      if (!url || !url.includes("instagram")) return ctx.reply("❌ Provide Instagram URL");
      await ctx.reply("⏳ Downloading...");
      try {
        const api = `https://api.lolhuman.xyz/api/instagram?apikey=x&url=${encodeURIComponent(url)}`;
        const { data } = await axios.get(api);
        await ctx.sock.sendMessage(ctx.from, {
          video: { url: data.result[0] },
          caption: "📸 Downloaded",
        }, { quoted: ctx.msg });
      } catch (e) { await ctx.reply("❌ Failed"); }
    },
  },
  {
    name: "facebook",
    aliases: ["facebook", "fb"],
    category: "download",
    execute: async (ctx) => {
      const url = ctx.args[0];
      if (!url || !url.includes("facebook")) return ctx.reply("❌ Provide FB URL");
      await ctx.reply("⏳ Downloading...");
      try {
        const api = `https://api.lolhuman.xyz/api/facebook?apikey=x&url=${encodeURIComponent(url)}`;
        const { data } = await axios.get(api);
        await ctx.sock.sendMessage(ctx.from, {
          video: { url: data.result },
        }, { quoted: ctx.msg });
      } catch (e) { await ctx.reply("❌ Failed"); }
    },
  },
];
