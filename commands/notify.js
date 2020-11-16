const Command = require("../modules/Command.js");
const format = require("../modules/format.js");
const questHandler = require("../modules/QuestHandler");

const notify = new Command();

notify.setName("notify")
    .setEnabled(true)
    .setGuildOnly(false)
    .setAliases([])
    .setPermLevel("User")
    .setCategory("Quests")
    .setDescription("Turn on/off notifications on quests.");

const error = () => 'Not enough permissions to set notification role. Please check the permissions & role hierarchy (the bot role has to be above the notification role)';

const reg = new RegExp(/<@&(\d+)>/);

notify.on("role", "Set the notification role", async function (ctx) {
    if (ctx.args.length < 1) return await ctx.message.reply(format.usage(ctx, [notify.name, ctx.action], [`@role`]));

    const result = reg.exec(ctx.args[0]);
    if (!result) return ctx.message.reply(`Invalid role ${ctx.args[0]}`);
    const r = ctx.guild.roles.cache.find(r => r.id === result[1]);
    ctx.settings.notifyRole = `<@&${r.id}>`;
    ctx.self.settings.set(ctx.guild.id, ctx.settings);
    return ctx.message.reply(`Set notify role to ${r}.`);

}, "Moderator");

notify.on("on", "Turn notifications on.", async ctx => {
    const role = questHandler.resolveRole(ctx);
    if (!role) return await ctx.message.reply(`No valid notification role set.`);
    await ctx.message.member.roles.add(role);
    return await ctx.message.reply('Notifications turned on.');
});

notify.on("off", "Turn notifications off.", async ctx => {
    const role = questHandler.resolveRole(ctx);
    if (!role) return await ctx.message.reply(`No valid notification role set.`);
    await ctx.message.member.roles.remove(role);
    return await ctx.message.reply('Notifications turned off.');
});

notify.on("default", "Default setting for notifications for new members.", async ctx => {
    const usage = async () => await ctx.message.reply(format.usage(ctx, [notify.name, ctx.action], [`on | off`]));
    if (ctx.args.length < 1) return usage();

    switch (ctx.args[0].toLowerCase()) {
        case 'on':
            ctx.settings.notifyDefault = true;
            break;
        case 'off':
            ctx.settings.notifyDefault = false;
            break;
        default:
            return usage();
    }
    ctx.self.settings.set(ctx.guild.id, ctx.settings);
    return await ctx.message.reply(`Set default for notifications to ${ctx.args[0]}.`);
}, "Moderator");

notify.on("all", "Turn on/off notifications for everybody.", async ctx => {
    const usage = async () => await ctx.message.reply(format.usage(ctx, [notify.name, ctx.action], [`on | off`]));
    if (ctx.args.length < 1) return usage();

    const role = questHandler.resolveRole(ctx);
    if (!role) return ctx.message.reply(`No valid notification role set.`);

    switch (ctx.args[0].toLowerCase()) {
        case 'on':
            await ctx.guild.members.filter(m => !m.user.bot).array().forEach(member => member.roles.add([role.id]));
            return await ctx.message.reply(`Turning on notifications for everybody... this may take a while.`);
        case 'off':
            await ctx.guild.members.filter(m => !m.user.bot).array().forEach(member => member.roles.remove([role.id]));
            return await ctx.message.reply(`Turning off notifications for everybody... this may take a while.`);
        default:
            return usage();
    }
}, "Administrator");

module.exports = notify;