import axios from "axios";

export const aiCommands = [
  {
    name: "gpt",
    aliases: ["gpt", "chatgpt", "ai"],
    category: "ai",
    execute: async (ctx) => {
      const q = ctx.args.join(" ");
      if (!q) return ctx.reply("❌ Usage: .gpt <question>");
      await ctx.react("🤔");
      try {
        const { data } = await axios.get(`https://api.lolhuman.xyz/api/openai?apikey=x&text=${encodeURIComponent(q)}`);
        await ctx.reply(`🤖 *GPT:*\n\n${data.result}`);
      } catch (e) { await ctx.reply("❌ AI failed"); }
    },
  },
  {
    name: "gemini",
    aliases: ["gemini", "bard"],
    category: "ai",
    execute: async (ctx) => {
      const q = ctx.args.join(" ");
      if (!q) return ctx.reply("❌ Usage: .gemini <question>");
      try {
        const { data } = await axios.get(`https://api.lolhuman.xyz/api/gemini?apikey=x&text=${encodeURIComponent(q)}`);
        await ctx.reply(`💎 *Gemini:*\n\n${data.result}`);
      } catch (e) { await ctx.reply("❌ Failed"); }
    },
  },
  {
    name: "imagine",
    aliases: ["imagine", "dalle", "aiimg"],
    category: "ai",
    execute: async (ctx) => {
      const prompt = ctx.args.join(" ");
      if (!prompt) return ctx.reply("❌ Usage: .imagine <prompt>");
      await ctx.reply("🎨 Generating image...");
      try {
        const url = `https://api.lolhuman.xyz/api/dall-e?apikey=x&text=${encodeURIComponent(prompt)}`;
        await ctx.sock.sendMessage(ctx.from, { image: { url }, caption: `🎨 ${prompt}` }, { quoted: ctx.msg });
      } catch (e) { await ctx.reply("❌ Failed"); }
    },
  },
];
