const { inspect } = require("util");
const format = require("../modules/format.js");

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
    if (value.length < 3) return message.reply("Please specify a name, server and time.");
    const [name, server, time] = value;

    const serverOptions = client.gq.getServer(server);
    const questOptions = client.gq.getMission(name);

    var s;
    var gq;
    if (serverOptions.length > 1){
      return message.reply("Unclear."); //TODO
    } else if (serverOptions.length == 0){
      return message.reply(`Unknown server ${server}.`);
    }
    s = serverOptions[0];

    if (questOptions.length > 1){
      let msg = `Multiple options found:\n`;
      questOptions.forEach((v, idx) => msg += `<${idx + 1}> ${v}\n`);
      msg += `Select one by typing the number in the chat.`
      const response = await client.awaitReply(message, msg, {code: "asciidoc"});
      const idx = parseInt(response);
      if (idx > 0 && idx <= questOptions.length){
        gq = questOptions[idx-1];
      }else{
        return message.reply("Invalid value.");
      }
    }

    const gqs = client.gq.lists.get(message.guild) || [];
    gqs.push({
      server: s,
      desc: gq,
      time: time
    });
    client.gq.lists.set(message.guild, gqs);
    
    message.reply(`Add guild mission ${gq} on server ${s}, time left: ${time}.`).then(message => message.delete(5000));
  };

  if (!action){
    return message.reply(format.formatUsage(actions));
  }

  switch(action){
    case actions.add: add(); break;
    default:
      return message.reply(`Unknown action ${action}. Supported actions are: ${Object.values(actions).join(", ")}`);
  }
};

