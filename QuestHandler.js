
const Discord = require("discord.js");
const moment = require("moment");
const format = require("./modules/format");
const fs = require("fs");
const Enmap = require("enmap");

const lists = new Enmap({name: "quests"});
const messages = new Enmap({name: "messages"});
for (var [id, quests] of lists.entries()) {
    quests.forEach(v => v.end = moment(v.end));
}

const interval = 1000

const serverNames = ["Olvia", "Valencia", "Balenos", "Arsha", "Mediah", "Calpheon", "Velia", "Serendia", "Kamasylvia"];

const missions = [
    ["Gather Rough Stone x350", 120],
    ["Gather Rough Stone x700", 120],
    ["Gather Rough Stone x1000", 150],
    ["Gather Rough Stone x1200", 180],
    ["Gather Rough Stone x1600", 210],
];

function getMissions(input){
    const words = input.split(/\s+/);
    return missions.filter(([desc, count]) => {
        const descWords = desc.split(/\s+/).map((v, _) => v.toUpperCase());
        return words.every(w => descWords.includes(w.toUpperCase()));
    });
}

function getServers(input){
    const r = /^([a-zA-Z]+)(\d+)$/;
    const match = r.exec(input);

    if (match){
        const [name, idx] = [match[1], match[2]];
        const resolved = serverNames.filter(s => s.toUpperCase().startsWith(name.toUpperCase()));
        return resolved.map((v, d) => v + idx);
    }
    return [];
}

function getActiveMissions(guild){
    return lists.get(guild.id) || [];
}

function addMission(guild, mission){
    const missions = questHandler.getActiveMissions(guild);
    if (missions.length <= 10) missions.push(mission);
    lists.set(guild.id, missions);
}

function extension(client){
    let curr = moment();

    function formatMissions(guild){
        const missions = getActiveMissions(guild);
        let msg = ``;
    
        missions.forEach((v, idx) => {
            msg += `<${idx + 1}> **[${v.server}]** ${v.description} --- Time left: ${format.interval(moment.duration(v.end.diff(curr)))}.\n`;
        });
        return msg;
    }

    let embed = format.embed()
    .setTitle('Current Missions')
    .setDescription('///')
    .attachFiles(['./assets/bdo-icon.png'])
    .setThumbnail('attachment://bdo-icon.png')
    .setTimestamp();

    async function update() {
        curr = moment();
        for (var [id, quests] of lists.entries()) {
            const guild = client.guilds.find(g => g.id === id);
            if (!guild){
                lists.delete(id);
                continue;
            }
            const settings = client.getSettings(guild);
            const r = new RegExp(/<#(\d+)>/);
            const channel = guild.channels.find(v => v.type == `text` && v.id == r.exec(settings.questChannel)[1]);
            if (!channel) continue;

            let [valid, expired] = [[], []];

            quests.forEach(v => (curr > v.end ? expired : valid).push(v));
            expired.forEach(v => channel.send(moment() + "Mission expired: " + v.description));
            quests = valid;

            const pin = settings.pinQuests;

            const send = async () => {
                const msg = await channel.send(embed);
                messages.set(id, msg.id);
                return msg;
            }

            if (quests.length > 0){
                lists.set(id, quests);
                embed.setDescription(formatMissions(guild));
            }else{
                lists.delete(id);
                embed.setDescription('No active missions.');
            }

            if (!messages.has(id)){
                await send();
            }else{
                // If message not existing, send.
                const msg = await channel.fetchMessage(messages.get(id))
                    .catch(async () => await send());

                // Message might be deleted in between fetch and processing. 
                // Simply consume the error in that case, message will be re-send in next tick.
                try{
                    // Embed has been deleted, repost.
                    if (msg.embeds.length == 0){
                         msg.delete().catch(() => {});
                         await send();
                    } else {
                        if (pin && !msg.pinned)  msg.pin().catch(() => {});
                        else if (!pin && msg.pinned)  msg.unpin().catch(() => {});
                        msg.edit(embed).catch(() => {});
                    }
                } catch (e) {}
            }
          }
          client.setTimeout(update, interval);
    }

    client.on("ready", () => client.setTimeout(update, interval));
}

module.exports = {
    extension: extension,
    getMissions: getMissions,
    getServers: getServers,
    getActiveMissions: getActiveMissions,
    lists: lists,
}
