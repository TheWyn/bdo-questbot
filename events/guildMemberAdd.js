// This event executes when a new member joins a server. Let's welcome them!

module.exports = (client, member) => {
    // Load the guild's settings
    const settings = client.getSettings(member.guild);

    // If welcome is off, don't proceed (don't welcome the user)
    if (settings.notifyDefault !== "true" || !settings.notifyRole) return;
    const reg = new RegExp(/<@&(\d+)>/);

    const id = reg.exec(settings.notifyRole);
    if (!id) return;
    const role = member.guild.roles.cache.find(r => r.id === id[1]);
    member.roles.add(role);
};
