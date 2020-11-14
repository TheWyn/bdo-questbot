const {inspect} = require("util");
const format = require("../modules/format.js");

// (client side) default settings
const Command = require("../modules/Command.js");

const defaults = new Command();

module.exports = defaults;

defaults.setName("defaults")
    .setEnabled(true)
    .setGuildOnly(false)
    .setPermLevel("Bot Owner")
    .setCategory("System")
    .setDescription("Modify the default configuration for the bot.");

// Flatten out inputs, for readability
let [settings, key, value, self, message] = [];

defaults.init = (context) => {
    settings = context.self.settings.get("default");
    key = context.args[0];
    value = context.args[1];
    self = context.self;
    message = context.message;
};

// Adding a new key adds it to every guild (it will be visible to all of them)
defaults.on("add", "Add a new key.", function (context) {
    if (!key) return message.reply("Please specify a key to add");
    if (settings[key]) return message.reply("This key already exists in the default settings");
    if (!value) return message.reply("Please specify a value");
    settings[key] = value;

    self.settings.set("default", settings);
    message.reply(`${key} successfully added with the value of ${value}`);
});

// Changing the default value of a key only modified it for guilds that did override it
defaults.on("edit", "Edit an existing key.", function (context) {
    if (!key) return message.reply("Please specify a key to edit");
    if (!settings[key]) return message.reply("This key does not exist in the settings");
    if (!value) return message.reply("Please specify a new value");
    settings[key] = value;

    self.settings.set("default", settings);
    message.reply(`${key} successfully edited to ${value}`);
});

// Delete a key, from all guilds as well.
defaults.on("del", "Delete a key.", async function (context) {
    if (!key) return message.reply("Please specify a key to delete.");
    if (!settings[key]) return message.reply("This key does not exist in the settings");

    const result = await self.awaitConfirmation(message, `Are you sure you want to permanently delete ${key} from all guilds? This **CANNOT** be undone.`);
    if (result) {
        // We delete the default `key` here.
        delete settings[key];
        self.settings.set("default", settings);

        // then we loop on all the guilds and remove this key if it exists.
        // "if it exists" is done with the filter (if the key is present and it's not the default config!)
        for (const [guildid, conf] of self.settings.filter((setting, id) => setting[key] && id !== "default")) {
            delete conf[key];
            self.settings.set(guildid, conf);
        }

        message.reply(`${key} was successfully deleted.`);
    } else {
        message.reply("Action cancelled.");
    }
});

defaults.on("get", "View a key.", function (context) {
    if (!key) return message.reply("Please specify a key to view");
    if (!settings[key]) return message.reply("This key does not exist in the settings");
    message.reply(`The value of ${key} is currently ${settings[key]}`);
});

defaults.on("reload", "Reload the initial default configuration file (resets all changes made by using this command, ever).", function (context) {
    self.settings.set("default", self.defaultSettings);
});

defaults.default = (context) => {
    let embed = format.embed().setTitle("Bot Defaults");

    Object.entries(settings).forEach(([key, value]) => {
        embed.addField(key, format.prettyPrint(value), true);
    });
    return message.channel.send(embed);
};

