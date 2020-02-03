
const Discord = require("discord.js");
const moment = require("moment");
const format = require("./modules/format");
const fs = require("fs");

module.exports = {
    extension: extension,
    getMissions: getMissions,
    getServers: getServers
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

function extension(client){
    client.gq = {};
    client.gq.lists = new Map();
    client.gq.msgs = new Map();

    client.gq.getQuests = (guild) => (client.gq.lists.get(guild) || []);

    function formatMissions(guild){
        const gqs = client.gq.getQuests(guild);
        let msg = ``;
        gqs.forEach((v, idx) => msg += `<${idx + 1}> [**${v.server}**] ${v.desc} --- Time left: ${format.interval(moment.duration(v.end.diff(curr)))}.\n`);
        return msg;
    }

    let curr = moment();

    let embed = new Discord.RichEmbed()
    .setColor('#0099ff')
    .setTitle('Current Missions')
    .setDescription('///')
    .attachFiles(['./assets/bdo-icon.png'])
    .setThumbnail('attachment://bdo-icon.png')
    .setTimestamp();

    setInterval(async () => {
        curr = moment();
        
        for (var [guild, quests] of client.gq.lists.entries()) {
            const settings = client.getSettings(guild);
            const r = new RegExp(/<#(\d+)>/);
            const channel = guild.channels.find(v => v.type == `text` && v.id == r.exec(settings.questChannel)[1]);
            if (!channel) continue;

            let [valid, expired] = [[], []];
            quests.forEach((v, _) => (curr > v.end ? expired : valid).push(v));
            expired.forEach((v, _) => channel.send(moment() + "Mission expired: " + v.desc));
            quests = valid;

            if (quests.length > 0){
                client.gq.lists.set(guild, quests);
                embed.setDescription(formatMissions(guild));
                if (!client.gq.msgs.has(guild)){
                    const msg = await channel.send(embed);
                    client.gq.msgs.set(guild, msg);
                }else{
                    client.gq.msgs.get(guild).edit(embed);
                }
            }else{
                client.gq.lists.delete(guild);
                embed.setDescription('///')
                if (client.gq.msgs.has(guild)) client.gq.msgs.get(guild).edit(embed);
            }
          }
    }, interval);
}
