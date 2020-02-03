const Command = require("../cmd.js");

const reload = new Command();

reload.setName("reload")
.setEnabled(true)
.setGuildOnly(false)
.setAliases([])
.setPermLevel("Bot Admin")
.setCategory("System")
.setDescription("Reloads a command that\"s been modified.");

reload.default = async (ctx) => {
  if (!ctx.args || ctx.args.length < 1) return ctx.message.reply("Must provide a command to reload.");
  const command = ctx.self.commands.get(ctx.args[0]) || ctx.self.commands.get(ctx.self.aliases.get(ctx.args[0]));
  let response = await ctx.self.unloadCommand(ctx.args[0]);
  if (response) return ctx.message.reply(`Error Unloading: ${response}`);

  response = ctx.self.loadCommand(command.name);
  if (response) return ctx.message.reply(`Error Loading: ${response}`);

  ctx.message.reply(`The command \`${command.name}\` has been reloaded`);
};

module.exports = reload;