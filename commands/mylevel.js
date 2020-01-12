exports.run = async (client, message, args, level) => {
  const friendly = client.config.permLevels.find(l => l.level === level).name;
  message.reply(`Your permission level is: ${level} - ${friendly}`);
};

exports.conf = {
  name: "permlevel",
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: "User"
};

exports.help = {
  category: "Miscellaneous",
  description: "Tells you your permission level for the current message location.",
  usage: exports.conf.name,
  keys: {}
};
