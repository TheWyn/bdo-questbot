const {version} = require("discord.js");
const format = require("../modules/format.js");
const moment = require("moment");
require("moment-duration-format");
const Command = require("../modules/Command.js");
const pjson = require('../package.json');

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
        .addField('\u200b', '\u200b', true)
        .addField("Users", ctx.self.users.cache.size.toLocaleString(), true)
        .addField("Servers", ctx.self.guilds.cache.size.toLocaleString(), true)
        .addField("Channels", ctx.self.channels.cache.size.toLocaleString(), true)
        .addField("Running on", `Quest Bot v${pjson.version}\nDiscord.js v${version}\nNode ${process.version}`)
        .addField("Source Code", `[GitHub Link](https://github.com/TheWyn/bdo-questbot)`)
        .setFooter("Developed by: Leyren#3099 / Wyn#0004");
    await ctx.message.channel.send(embed);
};


module.exports = stats;