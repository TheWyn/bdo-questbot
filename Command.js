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
    on(key, desc = "", f){
        this.args[key] = {desc: desc, f: f};
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
            context.action = action;
            context.args.shift();
            arg.f(context);
        }
    }
};