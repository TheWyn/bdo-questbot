const permissions = require("./permissions.js");

//General structure of a command, using builder pattern.
module.exports = class Command{
    constructor(){
        this.name = "";
        this.enabled = false;
        this.guildOnly = false;
        this.aliases = [];
        this.permLevel = "";
        this.category = "";
        this.description = "";
        this.usage = "";
        this.args = {};
    }

    // Allow external definition of sub-actions of this command.
    // Function f is being called with a context, see `run`.
    on(key, desc = "", f, perm = undefined){
        this.args[key] = {desc: desc, perm: perm, f: f};
    }

    // Initialising function which is called on each run of the command
    init(context){}
    
    // Fallback case for action resolving
    default(context){
        context.message.reply(`Unknown usage. Type ${context.prefix}help ${this.name} for details.`);
    }

    // Builder
    setName(n){ this.name = n; return this;}
    setEnabled(n){ this.enabled = n; return this;}
    setGuildOnly(n){ this.guildOnly = n; return this;}
    setAliases(n){ this.aliases = n; return this;}
    setPermLevel(n){ this.permLevel = n; return this;}
    setDescription(n){ this.description = n; return this;}
    setCategory(n){ this.category = n; return this;}
    setUsage(n){ this.usage = n; return this;}

    // Gets called from the message.js module, when the message resolved to a call to this command
     run(context){
        this.init(context);
        const action = context.args[0];
        if (action === undefined || !(action in this.args)){
            this.default(context);
        }else{
            const arg = this.args[action];
            if (arg.perm){
                const requiredLevel = permissions.fromName(arg.perm);
                if (context.level < requiredLevel) {
                    return context.message.channel.send(`You do not have permission to use this command.\n`
                    +`Your permission level is ${context.level} (${permissions.list[context.level].name})\n`
                    +`This command requires level ${requiredLevel} (${arg.perm})`);
                }
            }
            context.action = action;
            context.args.shift();
            arg.f(context);
        }
    }
};