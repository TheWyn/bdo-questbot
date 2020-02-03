const Discord = require("discord.js");

exports.usage = (ctx, cmds, args) => {
    return `Usage: \`${ctx.prefix}${cmds.join(` `)} ${args.map(arg => `<${arg}>`).join(` `)}\``;
};

exports.interval = i => i.format('HH:mm:ss', { trim: false });

exports.embed = () => new Discord.RichEmbed()
    .setColor(0xFF0092)
    .setTimestamp();

exports.prettyPrint = (value) => {
    if (value === undefined || value === null) return '/';
    if (Array.isArray(value)) return value.join(", ");
     switch(typeof(value)){
        case 'boolean': return value ? "Yes" : "No";
        case 'object': return JSON.stringify(value, undefined, 2);
        default: return value.toString();
    }
};