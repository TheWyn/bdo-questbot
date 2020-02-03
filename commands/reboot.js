const Command = require("../cmd.js");

const shutdown = new Command();

shutdown.setName("shutdown")
.setEnabled(true)
.setGuildOnly(false)
.setAliases([])
.setPermLevel("Bot Admin")
.setCategory("System")
.setDescription("Shuts down the bot. If running under PM2, bot will restart automatically.");

shutdown.default = async (ctx) => {
  await ctx.message.reply("Bot is shutting down.");
  await Promise.all(ctx.self.commands.map(cmd =>
    ctx.self.unloadCommand(cmd)
  ));
  process.exit(0);
};

module.exports = shutdown;