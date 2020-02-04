const Command = require("../Command.js");

const ping = new Command();

ping.setName("ping")
.setEnabled(true)
.setGuildOnly(false)
.setAliases([])
.setPermLevel("User")
.setCategory("Misc")
.setDescription("Check the current ping.");

ping.default = async (ctx) => {
  const msg = await ctx.message.channel.send("Ping?");
  msg.edit(`Pong! Latency is ${msg.createdTimestamp - ctx.message.createdTimestamp}ms. API Latency is ${Math.round(ctx.self.ping)}ms`);
};

module.exports = ping;