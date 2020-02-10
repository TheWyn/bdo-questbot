const { version } = require("discord.js");
const format = require("../modules/format.js");
const moment = require("moment");
require("moment-duration-format");
const Command = require("../modules/Command.js");

const stats = new Command();

stats.setName("stats")
  .setEnabled(true)
  .setGuildOnly(false)
  .setAliases([])
  .setPermLevel("User")
  .setCategory("Misc")
  .setDescription("Gives some useful bot statistics.");

stats.default = async (ctx) => {
  const embed = format.embed();
  
  const duration = moment.duration(ctx.self.uptime).format(" D [days], H [hrs], m [mins], s [secs]");
  embed.setTitle("Statistics")
    .addField("Memory Usage", `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`, true)
    .addField("Uptime", duration, true)
    .addBlankField(true)
    .addField("Users", ctx.self.users.size.toLocaleString(), true)
    .addField("Servers", ctx.self.guilds.size.toLocaleString(), true)
    .addField("Channels", ctx.self.channels.size.toLocaleString(), true)
    .addField("Running on", `Discord.js v${version}\nNode ${process.version}`)
    .addField("Source Code", `[GitHub Link](https://github.com/Leyren/bdo-guildbot)`)
    .setFooter("Developed by: Leyren#3099");
  ctx.message.channel.send(embed);
};


module.exports = stats;