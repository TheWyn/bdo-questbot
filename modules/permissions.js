const config = require("../config.js");
const reg = new RegExp(/<@&(\d+)>/);

// Permissions
const permissions = [
    // Default role
    {
        name: "User",
        check: () => true
    },
    // Server Moderator
    {
        name: "Moderator",
        check: (context) => {
            if (context.guild && context.settings.modRole) {
                const id = reg.exec(context.settings.modRole);
                if (!id) return false;
                const role = context.guild.roles.cache.find(r => r.id === id[1]);
                return role && context.message.member.roles.cache.has(role.id);
            }
            return false;
        }
    },
    {
        // Server Admin, Copy paste pattern, lazy.
        name: "Administrator",
        check: (context) => {
            if (context.guild && context.settings.adminRole) {
                const id = reg.exec(context.settings.adminRole);
                if (!id) return false;
                const role = context.guild.roles.cache.find(r => r.id === id[1]);
                return role && context.message.member.roles.cache.has(role.id);
            }
            return false;
        },
    },
    {
        name: "Server Owner",
        check: (context) => context.message.channel.type === "text" && context.guild.ownerID === context.message.author.id
    },
    {
        name: "Bot Owner",
        check: (context) => config.ownerID === context.message.author.id
    }
];

const reversed = permissions.slice().reverse();
let permLevels = {};
permissions.forEach((p, idx) => permLevels[p.name] = idx);

module.exports = {
    fromName: (name) => name ? permLevels[name] : -1,
    fromContext: (context) => {
        const index = reversed.findIndex(p => p.check(context));
        return adjusted = index < 0 ? 0 : reversed.length - index - 1;
    },
    list: permissions
}