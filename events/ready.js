const pre = require("../default.js");

module.exports = async client => {
    // Log that the bot is online.
    client.logger.log(`${client.user.tag}, ready to serve ${client.users.cache.size} users in ${client.guilds.cache.size} servers.`, "ready");

    // Make the bot "play the game" which is the help command with default prefix.
    await client.user.setActivity(`${pre.prefix}help`, {type: "PLAYING"});
};
