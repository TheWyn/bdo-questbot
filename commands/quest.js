const { inspect } = require("util");
const format = require("../modules/format.js");
const moment = require("moment");
const questHandler = require("../QuestHandler");
const Quest = require("../Quest");
const Command = require("../Command.js");

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
  const [server, name] = ctx.args;

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
    return ctx.message.reply(`No quest with name ${name} found.`);
  }

  const q = new Quest(serverOptions[0], r[0], moment().add(r[1], 'minutes'));
  const gqs = questHandler.getActiveMissions(ctx.guild);
  gqs.push(q);
  questHandler.lists.set(ctx.guild, gqs);
  
  ctx.message.reply(`Add guild mission ${q.description} on server ${q.server}.`);
});

quest.on("channel", "Select/View the channel to post the mission list in.", async function(ctx){
  const update = ctx.args[0];
  const r = new RegExp(/<#(\d+)>/);
  if (update){
    const resolved = r.exec(update)[1];
    const ch = ctx.guild.channels.find(c => c.id == resolved && c.type == `text`);
    if (ch){
      ctx.settings.questChannel = `<#${ch.id}>`;
      ctx.self.settings.set(ctx.guild.id, ctx.settings);
      return ctx.message.reply(`Set channel to post quest list to ${ctx.settings.questChannel}.`)
    }
  }else{
    return ctx.message.reply(`Channel to post quest list is ${ctx.settings.questChannel}.`);
  }
});

quest.on("complete", "Complete/Remove a guild mission from the list.", async function(ctx){
  if (ctx.args.length < 1) return ctx.message.reply(format.usage(ctx, [quest.name, ctx.action], [`number`]));

  const idx = parseInt(ctx.args[0]);
  const gqs = questHandler.getActiveMissions(ctx.guild);
  if (idx > 0 && idx <= gqs.length){
    questHandler.lists.set(ctx.guild, gqs.splice(idx - 1, 1));
    return ctx.message.reply(`Removed mission <${idx}> from the list.`);
  }
  return ctx.message.reply(`Failed to remove mission <${idx}>.`);
});

