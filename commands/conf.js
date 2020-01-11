const { inspect } = require("util");

/*
FOR GUILD SETTINGS SEE set.js !
This command is used to modify the bot's default configuration values, which affects all guilds. 
If a default setting is not specifically overwritten by a guild, changing a default here will
change it for that guild. The `add` action adds a key to the configuration of every guild in
your bot. The `del` action removes the key also from every guild, and loses its value forever.
*/

// Provide valid keywords to be used with this command, and a description for each one of them.

const keys = {
  add: { key: "add", desc: "Add a new key." },
  edit: { key: "edit", desc: "Edit an existing key." },
  del: { key: "del", desc: "Remove a key from defaults." },
  get: { key: "get", desc: "View a key." },
  restore: { key: "restore", desc: "Restore the default configuration from the file (resets all changes made by using this command, ever)." },
}

exports.conf = {
  name: "conf",
  enabled: true,
  guildOnly: true,
  aliases: ["defaults"],
  permLevel: "Bot Admin"
};

exports.help = {
  category: "System",
  description: "Modify the default configuration for all guilds.",
  usage: `${exports.conf.name} [${Object.values(keys).map((v, idx) => v.key).join("|")}] <key> <value>`,
  keys: keys
};

exports.run = async (client, message, [action, key, ...value], level) => { // eslint-disable-line no-unused-vars

  // Retrieve Default Values from the default settings in the bot.
  const defaults = client.settings.get("default");
  
  // Adding a new key adds it to every guild (it will be visible to all of them)
  const add = () => {
    if (!key) return message.reply("Please specify a key to add");
    if (defaults[key]) return message.reply("This key already exists in the default settings");
    if (value.length < 1) return message.reply("Please specify a value");

    // `value` being an array, we need to join it first.
    defaults[key] = value.join(" ");
  
    // Once the settings is modified, we write it back to the collection
    client.settings.set("default", defaults);
    message.reply(`${key} successfully added with the value of ${value.join(" ")}`);
  };

  // Changing the default value of a key only modified it for guilds that did not change it to another value.
  const edit = () => {
    if (!key) return message.reply("Please specify a key to edit");
    if (!defaults[key]) return message.reply("This key does not exist in the settings");
    if (value.length < 1) return message.reply("Please specify a new value");

    defaults[key] = value.join(" ");

    client.settings.set("default", defaults);
    message.reply(`${key} successfully edited to ${value.join(" ")}`);
  };

  // WARNING: DELETING A KEY FROM THE DEFAULTS ALSO REMOVES IT FROM EVERY GUILD
  // MAKE SURE THAT KEY IS REALLY NO LONGER NEEDED!
  const del = async () => {
    if (!key) return message.reply("Please specify a key to delete.");
    if (!defaults[key]) return message.reply("This key does not exist in the settings");
    
    // Throw the 'are you sure?' text at them.
    const response = await client.awaitReply(message, `Are you sure you want to permanently delete ${key} from all guilds? This **CANNOT** be undone.`);

    // If they respond with y or yes, continue.
    if (["y", "yes"].includes(response)) {

      // We delete the default `key` here.
      delete defaults[key];
      client.settings.set("default", defaults);
      
      // then we loop on all the guilds and remove this key if it exists.
      // "if it exists" is done with the filter (if the key is present and it's not the default config!)
      for (const [guildid, conf] of client.settings.filter((setting, id) => setting[key] && id !== "default")) {
        delete conf[key];
        client.settings.set(guildid, conf);
      }
      
      message.reply(`${key} was successfully deleted.`);
    } else
    // If they respond with n or no, we inform them that the action has been cancelled.
    if (["n","no","cancel"].includes(response)) {
      message.reply("Action cancelled.");
    }
  };

  // Display a key's default value
  const get = () => {
    if (!key) return message.reply("Please specify a key to view");
    if (!defaults[key]) return message.reply("This key does not exist in the settings");
    message.reply(`The value of ${key} is currently ${defaults[key]}`);
  };

  // Restore the default settings from the default file.
  const restore = () => client.settings.set("default", client.defaultSettings);
  
  switch(action){
    case keys.add.key: add(); break;
    case keys.edit.key: edit(); break;
    case keys.get.key: get(); break;
    case keys.del.key: del(); break;
    case keys.restore.key: restore(); break;
    default: 
    // Display all default settings.
    await message.channel.send(`***__Bot Default Settings__***\n\`\`\`json\n${inspect(defaults)}\n\`\`\``);
  }
};

