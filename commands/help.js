const format = require("../modules/format.js");
const Command = require("../Command.js");
const permissions = require("../modules/permissions");

const help = new Command();

help.setName("help")
.setEnabled(true)
.setGuildOnly(false)
.setAliases(["h"])
.setPermLevel("User")
.setCategory("System")
.setDescription("Displays all available commands.");

help.default = (ctx) => {
  let output = ``;
  let embed = format.embed();
  // If no specific command is called, show all filtered commands.
  if (!ctx.args[0]) {
    // Filter all commands by which are available for the user's level, using the <Collection>.filter() method.
    
    const myCommands = ctx.guild ? 
        ctx.self.commands.filter(cmd => permissions.fromName(cmd.permLevel) <= ctx.level) : 
        ctx.self.commands.filter(cmd => permissions.fromName(cmd.permLevel) <= ctx.level && cmd.guildOnly !== true);

    embed.setTitle('Command List')

    let currentCategory = "";
    output += `Use \`${ctx.prefix}help <command>\` for details\n`;
    const sorted = myCommands.array().sort((p, c) => p.category > c.category ? 1 :  p.name > c.name && p.category === c.category ? 1 : -1 );
    
    sorted.forEach( c => {
      const cat = c.category;
      if (currentCategory !== cat) {
        output += `\n**${cat}**\n`;
        currentCategory = cat;
      }
      output += `\`${ctx.prefix}${c.name}\` → ${c.description}\n`;
    });

    embed.setDescription(output);
    ctx.message.channel.send(embed);
  } else {
    // Show individual command's help.
    let c = ctx.args[0];
    const command = ctx.self.commands.get(c) || ctx.self.commands.get(ctx.self.aliases.get(c));
    if (!command)
      return ctx.message.channel.send(`Unknown command \`${c}\`.`);

      embed.setTitle(`Command \`${command.name}\``);

      if (ctx.level < permissions.fromName(command.permLevel)) return;

      output += `${command.description}\n`;

      if (command.aliases.length != 0){
        output += `\n**Aliases**\n`+
        `${command.aliases.join(", ")}\n`;
      }

      if (Object.keys(command.args).length != 0){
        output += `\n**Arguments**\n`;
        Object.entries(command.args).forEach(([k, v])=> {
          if (ctx.level >= permissions.fromName(v.perm))
            output += `\`${k}\` → ${v.desc}\n`;
        });
      }

      embed.setDescription(output);
      ctx.message.channel.send(embed);
  }
};

module.exports = help;
