const Discord = require("discord.js");
const moment = require("moment");
const format = require("./format");
const fs = require("fs");
const Enmap = require("enmap");
const QuestData = require("./QuestData.js");

const interval = 5000
const chanReg = new RegExp(/<#(\d+)>/);
const roleReg = new RegExp(/<@&(\d+)>/);

function resolveRole(ctx) {
    if (!ctx.settings.notifyRole) return undefined;
    const id = roleReg.exec(ctx.settings.notifyRole);
    if (!id) return undefined;
    return ctx.guild.roles.cache.find(r => r.id === id[1]);
}
const lists = new Enmap({name: "quests"});
const messages = new Enmap({name: "messages"});
for (var [id, quests] of lists.entries()) {
    quests.forEach(v => v.end = moment(v.end));
}


function getMissions(words) {
    return QuestData.missions.filter(([desc, count]) => {
        const descWords = desc.split(/\s+/).map((v, _) => v.toUpperCase().replace(/[.,;:()]/g, ''));
        return words.map(w => w.toUpperCase())
            .every(w => descWords.some(w2 => w2 === w || w2.match(/X\d+/) && w2.substring(1) === w || w.length > 2 && w2.includes(w)));
    });
}

function getServers(input) {
    const r = /^([a-zA-Z]+)(\d+)$/;
    const match = r.exec(input);

    if (match) {
        const [name, idx] = [match[1], match[2]];
        const resolved = QuestData.serverNames.filter(s => s.toUpperCase().startsWith(name.toUpperCase()));
        return resolved.map((v, d) => v + idx);
    }
    return [];
}

function getActiveMissions(guild) {
    return lists.get(guild.id) || [];
}

function getListDelete(id) {
    return lists.delete(id);
}

function addMission(guild, mission) {
    const missions = getActiveMissions(guild);
    if (missions.length <= 10) {
        missions.push(mission);
        lists.set(guild.id, missions);
        return true;
    }
    return false;
}

function setMission(guild, index, mission) {
    const missions = getActiveMissions(guild);
    if (index >= 0 && index < missions.length) {
        missions[index] = mission;
        lists.set(guild.id, missions);
        return true;
    }
    return false;
}

function removeMission(guild, index) {
    const missions = getActiveMissions(guild);
    if (index >= 0 && index < missions.length) {
        missions.splice(index, 1);
        lists.set(guild.id, missions);
        return true;
    }
    return false;
}

function getChannel(guild, settings) {
    if (!settings.questChannel) return undefined;
    return guild.channels.cache.find(v => v.type === `text` && v.id === chanReg.exec(settings.questChannel)[1]);
}

function updateChannel(ctx, update) {
    const result = chanReg.exec(update);
    if (!result) return undefined;
    const ch = ctx.guild.channels.cache.find(c => c.id === result[1] && c.type === `text`);
    if (ch) {
        const old = getChannel(ctx.guild, ctx.settings);
        // Delete the old message
        if (old && messages.has(ctx.guild.id)) {
            old.messages.fetch(messages.get(id))
                .then(msg => msg.delete().catch(() => {
                }))
                .catch(() => {
                });
        }
        ctx.settings.questChannel = `<#${ch.id}>`;
        ctx.self.settings.set(ctx.guild.id, ctx.settings);
        return ctx.settings.questChannel;
    }
    return undefined;
}

// Delete the message so that it will be reposted on the next update
function triggerRepost(ctx) {
    const settings = ctx.settings;
    if (!settings.questChannel) return;
    const channel = getChannel(ctx.guild, settings);
    if (!channel || !messages.has(ctx.guild.id)) return;
    channel.messages.fetch(messages.get(ctx.guild.id))
        .then(async msg => {
            const m = await channel.send(makeMessage(ctx.guild, moment())).then(msg => {
                if (settings.pinQuests) msg.pin();
                return msg;
            });
            messages.set(ctx.guild.id, m.id);
            return msg;
        }).then(msg => msg.delete()).catch(() => {
    });
}

function makeMessage(guild, curr) {
    const missions = getActiveMissions(guild);
    let msg = ``;

    if (missions.length > 0) {
        missions.forEach((v, idx) => {
            msg += `<${idx + 1}> **[${v.server}]** ${v.description} --- Time left: ${format.interval(moment.duration(v.end.diff(curr)))}.\n`;
        });
    } else {
        msg = `No active missions.`;
    }

    return format.embed()
        .setTitle('Current Missions')
        .setDescription(msg);
}


function extension(client) {
    let curr = moment();

    async function update() {
        curr = moment();
        for (var [id, quests] of lists.entries()) {
            const guild = client.guilds.cache.find(g => g.id === id);
            if (!guild) {
                lists.delete(id);
                continue;
            }
            const settings = client.getSettings(guild);
            if (!settings.questChannel) continue;
            const channel = getChannel(guild, settings);
            if (!channel) continue;

            // Update the active missions in case some expired
            let [valid, expired] = [[], []];

            quests.forEach(v => (curr > v.end ? expired : valid).push(v));
            expired.forEach(v => channel.send(`Mission expired: **[${v.server}]** ${v.description}`));
            quests = valid;

            const pin = settings.pinQuests;

            if (quests.length > 0) lists.set(id, quests); else lists.delete(id);

            const embed = makeMessage(guild, curr);

            // Send the embed and pin, if required
            const send = async () => {
                const msg = await channel.send(embed).then(msg => {
                    if (pin) msg.pin();
                    return msg;
                });
                messages.set(id, msg.id);
                return msg;
            }

            if (!messages.has(id)) {
                await send();
            } else {
                // If message not existing (got deleted), resend.
                const msg = await channel.messages.fetch(messages.get(id))
                    .catch(async () => await send());

                // Embed has been deleted, repost.
                if (msg.embeds.length === 0) {
                    await msg.delete();
                    await send();
                } else {
                    if (pin && !msg.pinned) await msg.pin();
                    else if (!pin && msg.pinned) await msg.unpin();
                    await msg.edit(embed);
                }
            }

        }
        client.setTimeout(update, interval);
    }

    client.on("ready", () => client.setTimeout(update, interval));

    client.on("message", msg => {
        if (msg.type === `PINS_ADD` && msg.author.id === `665515707689205784`) msg.delete();
    });
}

module.exports = {
    extension: extension,
    getMissions: getMissions,
    getServers: getServers,
    getActiveMissions: getActiveMissions,
    addMission: addMission,
    setMission: setMission,
    removeMission: removeMission,
    updateChannel: updateChannel,
    getChannel: getChannel,
    triggerRepost: triggerRepost,
    resolveRole: resolveRole,
    getListsDelete: getListDelete
}
