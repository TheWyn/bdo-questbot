const { version } = require("discord.js");
const Command = require("../Command.js");
const format = require("../modules/format.js");

const prefix = new Command();

prefix.setName("prefix")
.setEnabled(true)
.setGuildOnly(false)
.setAliases([])
.setPermLevel("Server Admin")
.setCategory("System")
.setDescription("Change the prefix of this Bot.");

prefix.default = async (ctx) => {
  if (ctx.args.length < 1) return ctx.message.reply(format.usage(ctx, [prefix.name], [`prefix`]));
  
  const p = ctx.args[0];
  if (p.length > 1 || /^[a-z0-9]+$/i.test(p)) return ctx.message.reply(`Invalid prefix ${p}.`);
  ctx.settings.prefix = p;
  ctx.self.settings.set(ctx.guild.id, ctx.settings);
  return ctx.message.reply(`Set prefix to ${p}`);
};


module.exports = prefix;