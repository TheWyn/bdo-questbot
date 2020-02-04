const format = require("../modules/format.js");
const Command = require("../Command.js");

const config = new Command();

config.setName("config")
  .setEnabled(true)
  .setGuildOnly(true)
  .setAliases([])
  .setPermLevel("Administrator")
  .setCategory("System")
  .setDescription("View or restore settings for your server.");

  config.default = function(ctx){
    let embed = format.embed().setTitle("Server Settings");

    Object.entries(ctx.settings).forEach(([key, value]) => {
      embed.addField(key, format.prettyPrint(value), true);
    });
    ctx.message.channel.send(embed);
  }

config.on("restore", "Reset all settings back to default", async function(ctx){
  const response = await ctx.self.awaitConfirmation(ctx.message, `Are you sure you want to restore the default configuration?`);
  if (response) {
    ctx.self.settings.delete(ctx.guild.id);
    ctx.message.reply(`Successfully restored default configuration.`);
  } else {
    ctx.message.reply(`Action cancelled.`);
  }
});

module.exports = config;


