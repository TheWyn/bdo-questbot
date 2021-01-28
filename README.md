# BDO Guild Quest Bot
[![GitHub package version](https://img.shields.io/github/package-json/v/TheWyn/bdo-questbot.svg)](https://github.com/TheWyn/bdo-questbot/blob/master/package.json)
[![discordversion](https://img.shields.io/badge/discord.js-12.5.1-blue)](https://github.com/discordjs/discord.js)
[![license](https://img.shields.io/github/license/TheWyn/bdo-questbot.svg)](https://github.com/TheWyn/bdo-questbot/blob/master/LICENSE)


This bot allows you to manage your guild missions within your Discord server, displaying currently running missions including their server and time.

Add the improved bot directly: https://discord.com/oauth2/authorize?client_id=665134638137737249&scope=bot&permissions=224256

If you're a nutjob and run two guilds: https://discord.com/oauth2/authorize?client_id=780212379749056522&scope=bot&permissions=224256

Main bot prefix is `~`, nutjobs get `-`.

# Commands
| Usage | Alias | Effect  |
|---|---|---|
| `~help` | `~h` | Lists usages of all avaialble commands  |
| `~prefix`| | Change the prefix|
| `~quest` | `~q` | Add/Edit/Remove guild quests and set the channel to use |
| `~notify` | | Configure notifications for quest updates
| `~role` | | Set admin/moderator roles, which have access to more commands than regular users |
| `~ping` | | Ping the bot |
| `~stats` | | Show statistics of the bot |
| `~config` | | Show your settings|

# Quick-Start
If you want to use the notification feature, set the role to use with
```
~notify role @myrole
```
To give every new member that role, use
```
~notify default on
```
and to give every existing member the role, use
```
~notify all on
```
Next, you can set up the channel to post quest notifications in by using
```
~quest channel #mychannel
```
You then can add quests by using
```
~quest add <server> <mission>
```
For example: `~quest add m1 basi 3800`

If the input for the mission was not clear, the bot offers you the possible matches to select from.

The timer is automatically set. However, if you added the quest at a later time than it was started ingame, you can edit the timer. For example:
```
~quest edit 1 200
```
sets the timer of the first quest in the list to 200 minutes.

If a quest is finished, you can remove it by using for example:
```
~quest finish 1
```
which would remove the first quest from the list.



