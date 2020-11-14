const Command = require("../modules/Command.js");
const format = require("../modules/format.js");

const role = new Command();

role.setName("role")
    .setEnabled(true)
    .setGuildOnly(false)
    .setAliases([])
    .setPermLevel("Server Owner")
    .setCategory("System")
    .setDescription("Manage Moderator/Admin roles for this Bot.");

const reg = new RegExp(/<@&(\d+)>/);

role.default = async (ctx) => {
    const usage = () => ctx.message.reply(format.usage(ctx, [role.name, `[admin | mod]`], [`@role`]));
    if (ctx.args.length < 2) return usage();

    const mode = ctx.args[0];
    const result = reg.exec(ctx.args[1]);
    if (!result) return ctx.message.reply(`Invalid role ${ctx.args[1]}`);
    const r = ctx.guild.roles.find(r => r.id === result[1]);

    switch (mode) {
        case 'admin':
            ctx.settings.adminRole = `<@&${r.id}>`;
            ctx.self.settings.set(ctx.guild.id, ctx.settings);
            return ctx.message.reply(`Set Admin role to ${r}.`);
        case 'mod':
            ctx.settings.modRole = `<@&${r.id}>`;
            ctx.self.settings.set(ctx.guild.id, ctx.settings);
            return ctx.message.reply(`Set Mod role to ${r}.`);
        default:
            return usage();
    }
};


module.exports = role;