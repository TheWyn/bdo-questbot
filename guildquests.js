const interval = 1000

const serverNames = ["Olvia", "Valencia", "Balenos", "Arsha", "Mediah", "Calpheon", "Velia", "Serendia", "Kamasylvia"];

const missionNames = [
"Hexe Sanctuary Skeleton",
"Southwestern Calpheon Rhutum",
"Soldier's Grave Frenzied Skeleton",
"Keplan Primal Giant Post Giant",
"Calpheon Shrine enemy",
"Wandering Rogue Den Wandering Rogue",
"Hasrah Ancient Ruins Ancient Weapons",
"Sherekhan during the day",
"Hungry Margoria Sea Monster",
"Gather Rough Stone x700",
"Gather Rough Stone x350",
"Gather Rough Stone x1000",
"Gather Rough Stone x1200",
"Gather Rough Stone x1600"
];

module.exports = (client) => {
    client.gq = {};
    client.gq.lists = new Map();
    client.gq.msgs = new Map();

    client.gq.getServer = (input) => {
        const r = /^([a-zA-Z]+)(\d+)$/;
        const match = r.exec(input);

        if (match){
            const [name, idx] = [match[1], match[2]];
            const resolved = serverNames.filter(s => s.toUpperCase().startsWith(name.toUpperCase()));
            return resolved.map((v, d) => v+idx);
        }
    };

    client.gq.getMission = (input) => {
        const words = input.split(/\s+/);
        return missionNames.filter(s => {
            const sWords = s.split(/\s+/).map((v, _) => v.toUpperCase());
            return words.every(w => sWords.includes(w.toUpperCase()));
        });
    };

    const currentGQs = (guild) => {
        const gqs = client.gq.lists.get(guild) || [];
        let msg = ``;
        gqs.forEach((v, idx) => msg += `<${idx + 1}> [${v.server}] ${v.desc} --- ${v.time} minutes left.\n`);
        return msg;
      };

    setInterval(async () => {
        for (var [guild, quests] of client.gq.lists.entries()) {
            if (quests.length > 0){
                const content = currentGQs(guild);
                if (!client.gq.msgs.has(guild)){
                    const msg = await guild.channels.find(v => v.type == `text`).send(content);
                    client.gq.msgs.set(guild, msg);
                }else{
                    client.gq.msgs.get(guild).edit(content);
                }
            }

            quests.forEach((v, _) => {
                v.time = v.time - 1;
                if (v.time <= 0){
                    guild.channels.find(v => v.type == `text`).send("Mission expired: " + v.gq);
                }
            });

            quests = quests.filter(v => v["time"] > 0);

            if (quests.length > 0){
                client.gq.lists.set(guild, quests);
            }else{
                client.gq.lists.delete(guild);
            }
          }
    }, interval);
};