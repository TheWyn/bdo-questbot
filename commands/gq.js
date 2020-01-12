const { inspect } = require("util");
const format = require("../modules/format.js");
const moment = require("moment");

const actions = {
  add: {name: "add", desc: "Add stuff."}
};

exports.conf = {
  name: "gq",
  enabled: true,
  guildOnly: true,
  aliases: ["guildquest"],
  permLevel: "User"
};

exports.help = {
  category: "Guild",
  description: "Manage your guild quests",
  usage: `${exports.conf.name} [${Object.values(actions).map((v, _) => v.name).join("|")}] ...`,
};

exports.run = async (client, message, [action, ...value], level) => { // eslint-disable-line no-unused-vars

  // Retrieve Default Values from the default settings in the bot.
  const defaults = client.settings.get("default");

  // Adding a new key adds it to every guild (it will be visible to all of them)
  const add = async () => {
    if (value.length < 2) return message.reply("Please specify the name and server of the mission.");
    const [server, name] = value;

    const serverOptions = client.gq.getServer(server);
    const questOptions = client.gq.getMission(name);

    const quest = {};
    if (serverOptions.length > 1){
      return message.reply("Unclear."); //TODO
    } else if (serverOptions.length == 0){
      return message.reply(`Unknown server ${server}.`);
    }
    quest.server = serverOptions[0];

    if (questOptions.length > 1){
      let msg = `Multiple options found:\n`;
      questOptions.forEach((v, idx) => msg += `<${idx + 1}> ${v}\n`);
      msg += `Select one by typing the number in the chat.`
      const response = await client.awaitReply(message, msg, {code: "asciidoc"});
      const idx = parseInt(response);
      if (idx > 0 && idx <= questOptions.length){
        quest.desc = questOptions[idx-1][0];
        quest.end = moment().add(questOptions[idx-1][1], 'minutes');
      }else{
        return message.reply("Invalid value.");
      }
    }
    
    const gqs = client.gq.lists.get(message.guild) || [];
    gqs.push(quest);
    client.gq.lists.set(message.guild, gqs);
    
    message.reply(`Add guild mission ${quest.desc} on server ${quest.server}.`).then(message => message.delete(5000));
  };

  if (!action){
    return message.reply(format.formatUsage(actions));
  }

  switch(action){
    case actions.add.name: add(); break;
    default:
      return message.reply(`Unknown action ${action}. Supported actions are: ${Object.values(actions).join(", ")}`);
  }
};

