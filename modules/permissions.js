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
    check: (context) => {
      if (context.guild && context.settings.modRole) {
        const role = context.guild.roles.find(r => r.name.toLowerCase() === context.settings.modRole.toLowerCase)
        return role && context.message.member.role.has(role.id);
      }
      return false;
    }
  },
  {
    // Server Admin
    name: "Administrator",
    check: (context) => {
      if (context.guild && context.settings.adminRole) {
        const role = context.guild.roles.find(r => r.name.toLowerCase() === context.settings.adminRole.toLowerCase)
        return role && context.message.member.role.has(role.id);
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
    fromName: (name) => permLevels[name],
    fromContext: (context) => {
      const index = reversed.findIndex(p => p.check(context));
      return adjusted = index < 0 ? 0 : reversed.length - index - 1;
    },
    list: permissions
  }