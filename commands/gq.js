const { inspect } = require("util");

/*
FOR GUILD SETTINGS SEE set.js !
This command is used to modify the bot's default configuration values, which affects all guilds. 
If a default setting is not specifically overwritten by a guild, changing a default here will
change it for that guild. The `add` action adds a key to the configuration of every guild in
your bot. The `del` action removes the key also from every guild, and loses its value forever.
*/

// Provide valid keywords to be used with this command, and a description for each one of them.

exports.conf = {
  name: "gq",
  enabled: true,
  guildOnly: true,
  aliases: ["guild quest"],
  permLevel: "User"
};

const keys = {
  add: { key: "add", desc: "Add a new key." },
  edit: { key: "update", desc: "Edit an existing key." },
  del: { key: "complete", desc: "Remove a key from defaults." },
  get: { key: "get", desc: "View a key." },
  restore: { key: "restore", desc: "Restore the default configuration from the file (resets all changes made by using this command, ever)." },
}

exports.help = {
  category: "Guild",
  description: "Add and modify guild quests",
  usage: `${exports.conf.name} [${Object.values(keys).map((v, idx) => v.key).join("|")}] <key> <value>`,
  keys: keys
};

exports.run = async (client, message, [action, ...value], level) => { // eslint-disable-line no-unused-vars

  // Retrieve Default Values from the default settings in the bot.
  const defaults = client.settings.get("default");

  // Adding a new key adds it to every guild (it will be visible to all of them)
  const add = async () => {
    console.log("add");
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

  switch(action){
    case keys.add.key: add(); break;
    default: 
    // Display all default settings.
    await message.channel.send(`***__Bot Default Settings__***\n\`\`\`json\n${inspect(defaults)}\n\`\`\``);
  }
};

