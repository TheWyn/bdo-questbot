// This event executes when a new guild (server) is joined.

module.exports = (client, guild) => {
    client.logger.cmd(`[GUILD JOIN] ${guild.name} (${guild.id}) added the bot. Owner: ${guild.member(guild.owner) ? guild.owner.toString() : guild.owner.user.tag})`);
};
