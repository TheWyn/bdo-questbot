const { inspect } = require("util");
const format = require("../modules/format.js");
const moment = require("moment");
const questHandler = require("../modules/QuestHandler");
const Quest = require("../modules/Quest");
const Command = require("../modules/Command.js");

const quest = new Command();

quest.setName("quest")
.setEnabled(true)
.setGuildOnly(true)
.setAliases(["q"])
.setPermLevel("User")
.setCategory("Quests")
.setDescription("Manage your guild quests.");

module.exports = quest;

quest.on("add", "Add a guild quest to the list.", async function(ctx){
  if (ctx.args.length < 2) return ctx.message.reply(format.usage(ctx, [quest.name, ctx.action], [`server`, `quest`]));
  const [server, ...name] = ctx.args;

  const serverOptions = questHandler.getServers(server);
  const questOptions = questHandler.getMissions(name);

  if (serverOptions.length > 1) return ctx.message.reply(`Unclear server name ${server}.`);
  if (serverOptions.length == 0) return ctx.message.reply(`Unknown server ${server}.`);
  var r;
  if (questOptions.length > 1){
    const embed = format.embed();
    embed.setTitle("Options");
    const output = `${questOptions.map((v, idx) => `<${idx + 1}> ${v[0]} (${v[1]}min)`).join(`\n`)}`
      + `\nSelect one by typing the quest number in the chat.`;
    embed.setDescription(output);
    const response = await ctx.self.awaitReply(ctx.message, embed);
    const idx = parseInt(response);
    if (idx > 0 && idx <= questOptions.length){
      r = questOptions[idx-1];
    }else{
      return ctx.message.reply(`Invalid value. Has to be between 0 and ${questOptions.length}`);
    }
  }else if (questOptions.length == 1){
    r = questOptions[0];
  }else{
    return ctx.message.reply(`No matches for ${name.join(" ")} found.`);
  }

  const q = new Quest(serverOptions[0], r[0], moment().add(r[1], 'minutes'));
  if (questHandler.addMission(ctx.guild, q)){
    const content = `Add guild mission ${q.description} on server ${q.server}.`;
    ctx.message.reply(content);
    const channel = questHandler.getChannel(ctx.guild, ctx.settings);
    if (channel) channel.send(content);
  } else {
    ctx.message.reply(`Failed to add mission.`);
  }
});

const r = new RegExp(/<#(\d+)>/);
quest.on("channel", "Select/View the channel to post the mission list in.", async function(ctx){
  const update = ctx.args[0];
  if (update){
    const result = questHandler.updateChannel(ctx, update)
    if (result) return ctx.message.reply(`Set channel to post quest list to ${ctx.settings.questChannel}.`)
    return ctx.message.reply(`Invalid channel ${update}.`);
  }
  return ctx.message.reply(`Channel to post quest list is ${ctx.settings.questChannel}.`);
}, "Moderator");

quest.on("pin", "Toggle pinning of the mission list on/off.", async function(ctx){
  const usage = () => ctx.message.reply(format.usage(ctx, [quest.name, ctx.action], [`on/off`]));
  if (ctx.args.length < 1) return usage();
  const update = ctx.args[0];
  if (["on", "off"].includes(update)){
    ctx.settings.pinQuests = update === "on";
    ctx.self.settings.set(ctx.guild.id, ctx.settings);
    return ctx.message.reply(`Set pinning of quest list to ${ctx.settings.pinQuests}`);
  }
  return usage();
}, "Moderator");

quest.on("complete", "Complete/Remove a guild mission from the list.", async function(ctx){
  if (ctx.args.length < 1) return ctx.message.reply(format.usage(ctx, [quest.name, ctx.action], [`mission-id`]));

  const idx = parseInt(ctx.args[0]);
  if (questHandler.removeMission(ctx.guild, idx - 1)){
    return ctx.message.reply(`Removed mission <${idx}> from the list.`);
  }
  return ctx.message.reply(`Failed to remove mission <${idx}>.`);
});

quest.on("edit", "Edit the remaining time of an existing mission.", async function(ctx){
  if (ctx.args.length < 2) return ctx.message.reply(format.usage(ctx, [quest.name, ctx.action], [`mission-id`, `value`]));

  const idx = parseInt(ctx.args[0]);
  const missions = questHandler.getActiveMissions(ctx.guild);
  if (!(idx > 0 && idx <= missions.length)) return ctx.message.reply(`Invalid mission id <${idx}>.`);
  const mission = missions[idx-1];
  const value = parseInt(ctx.args[1]);
  if (!(value > 0 && value < 999)) return ctx.message.reply(`Invalid time value ${value}.`);
  mission.end = moment().add(value, 'minutes');
  questHandler.setMission(ctx.guild, idx - 1, mission);
  return ctx.message.reply(`Successfully updated mission <${idx}>.`)
});

quest.on("repost", "Delete the current quest list message, and repost it on the next update tick.", async function(ctx){
  questHandler.triggerRepost(ctx);
});