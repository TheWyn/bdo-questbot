const Command = require("../modules/Command.js");

const shutdown = new Command();

shutdown.setName("shutdown")
    .setEnabled(true)
    .setGuildOnly(false)
    .setAliases([])
    .setPermLevel("Bot Owner")
    .setCategory("System")
    .setDescription("Shuts down the bot. If running under PM2 or configured through Systemd, will restart automatically.");

shutdown.default = async (ctx) => {
    await ctx.message.reply("Bot is shutting down.");
    await Promise.all(ctx.self.commands.map(cmd =>
        ctx.self.unloadCommand(cmd)
    ));
    process.exit(0);
};

module.exports = shutdown;