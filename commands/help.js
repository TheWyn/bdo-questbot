/*
The HELP command is used to display every command's name and description
to the user, so that he may see what commands are available. The help
command is also filtered by level, so if a user does not have access to
a command, it is not shown to them. If a command name is given with the
help command, its extended help is shown.
*/
const format = require("../modules/format.js");

exports.conf = {
  name: "help",
  enabled: true,
  guildOnly: false,
  aliases: ["h"],
  permLevel: "User"
};

exports.help = {
  category: "System",
  description: "Displays all available commands.",
  usage: `${exports.conf.name} <command>`,
  keys: {}
};

exports.run = (client, message, args, level) => {
  let output = ``;
  let embed = format.embed();
  const prefix = message.guild.settings.prefix;
  // If no specific command is called, show all filtered commands.
  if (!args[0]) {
    // Filter all commands by which are available for the user's level, using the <Collection>.filter() method.
    const myCommands = message.guild ? 
        client.commands.filter(cmd => client.levelCache[cmd.conf.permLevel] <= level) : 
        client.commands.filter(cmd => client.levelCache[cmd.conf.permLevel] <= level && cmd.conf.guildOnly !== true);
        
    embed.setTitle('Command List')

    let currentCategory = "";
    output += `Use \`${prefix}help <commandname>\` for details\n`;
    const sorted = myCommands.array().sort((p, c) => p.help.category > c.help.category ? 1 :  p.conf.name > c.conf.name && p.help.category === c.help.category ? 1 : -1 );
    sorted.forEach( c => {
      const cat = c.help.category.toProperCase();
      if (currentCategory !== cat) {
        output += `\n**${cat}**\n`;
        currentCategory = cat;
      }
      output += `\`${prefix}${c.conf.name}\` → ${c.help.description}\n`;
    });
    embed.setDescription(output);
    message.channel.send(embed);
  } else {
    // Show individual command's help.
    let c = args[0];
    if (!client.commands.has(c)){
      message.channel.send(`Unknown command \`${c}\`.`);
      return;
    }
      const command = client.commands.get(c);
      embed.setTitle(`Command \`${command.conf.name}\``);
      if (level < client.levelCache[command.conf.permLevel]) return;
      output += `${command.help.description}\n`+
      `\n**Usage**\n`+
      `${prefix}${command.help.usage}\n`;
      if (command.conf.aliases.length != 0){
        output += `\n**Aliases**\n`+
        `${command.conf.aliases.join(", ")}\n`;
      }
      output += `\n**Arguments**\n`;

      Object.values(command.help.keys).forEach(h => {
       output += `\`${h.key}\` → ${h.desc}\n`;
      });
      embed.setDescription(output);
      message.channel.send(embed);
  }
};


