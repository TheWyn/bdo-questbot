// The MESSAGE event runs anytime a message is received
// Note that due to the binding of client to every event, every event
// goes `client, other, args` when this function is run.
const permissions = require("../modules/permissions.js");

module.exports = async (client, message) => {
    // Ignore other bots
    if (message.author.bot) return;

    // Grab the settings for this server from Enmap.
    // If there is no guild, get default conf (DMs)
    const settings = client.getSettings(message.guild);

    // Checks if the bot was mentioned, with no message after it, returns the prefix.
    const prefixMention = new RegExp(`^<@!?${client.user.id}>( |)$`);
    if (message.content.match(prefixMention)) {
        return message.reply(`My prefix on this guild is \`${settings.prefix}\``);
    }

    // Ignore all messages which are not starting with the prefix
    if (message.content.indexOf(settings.prefix) !== 0) return;

    // Split arguments
    const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    // If the member on a guild is invisible or not cached, fetch them.
    if (message.guild && !message.member) await message.guild.members.fetch(message.author);

    // Check whether the command, or alias, exist in the collections defined
    // in app.js.
    const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));

    if (!cmd)
        return message.reply(`Unknown command ${command}`);

    // Some commands may not be useable in DMs. This check prevents those commands from running
    // and return a friendly error message.
    if (cmd && !message.guild && cmd.guildOnly)
        return message.channel.send("This command is unavailable via private message. Please run this command in a server.");

    const context = {
        self: client,
        message: message,
        guild: message.guild,
        settings: settings,
        prefix: settings.prefix,
        args: args,
    }

    // Get the users permission level
    const level = permissions.fromContext(context);
    const requiredLevel = permissions.fromName(cmd.permLevel);
    if (level < requiredLevel) {
        return message.channel.send(`You do not have permission to use this command.
  Your permission level is ${level} (${permissions.list[level].name})
  This command requires level ${requiredLevel} (${cmd.permLevel})`);
    }

    // If the command exists, and the user has permission, run it.
    client.logger.cmd(`[CMD] ${permissions.list[level].name} ${message.author.username} (${message.author.id}) ran command ${cmd.name}`);

    context.level = level;
    cmd.run(context);
};
