const Discord = require("discord.js");

// Expects an object providing x: {name: .., desc: ...} mappings.
exports.formatUsage = (usage) => {
    return Object.entries(usage).map(([k, v], i) => `${v.name}: ${v.desc}. Usage: ${v.usage}`).join("\n");
};

exports.interval = i => i.format('HH:mm:ss', { trim: false });

exports.embed = () => new Discord.RichEmbed()
    .setColor('#0099ff')
    .setTimestamp();