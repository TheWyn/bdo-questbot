const config = require("../config.js");

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
    check: (message) => {
      if (message.guild && message.settings.modRole) {
        const role = message.guild.roles.find(r => r.name.toLowerCase() === message.settings.modRole.toLowerCase)
        return role && message.member.role.has(role.id);
      }
      return false;
    }
  },
  {
    // Server Admin
    name: "Administrator",
    check: (message) => {
      if (message.guild && message.settings.modRole) {
        const role = message.guild.roles.find(r => r.name.toLowerCase() === message.settings.modRole.toLowerCase)
        return role && message.member.role.has(role.id);
      }
      return false;
    },
  },
  {
    name: "Server Owner",
    check: (message) => message.channel.type === "text" && message.guild.ownerID === message.author.id
  },
  {
    name: "Bot Owner",
    check: (message) => config.ownerID !== message.author.id
  }
];

const reversed = permissions.slice().reverse();
let permLevels = {};
permissions.forEach((p, idx) => permLevels[p.name] = idx);

module.exports = {
    fromName: (name) => permLevels[name],
    fromContext: (context) => {
      const index = reversed.findIndex(p => p.check(context));
      return adjusted = index < 0 ? 0 : reversed.length - index - 1;
    },
    list: permissions
  }