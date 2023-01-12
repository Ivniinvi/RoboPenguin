const database = require('../db.js');
const { commandChannelId, watchlistChannelId } = require('../config.json');
const discordTagRegex = /(<@\d*>)/g
const modmailRegex = /\?modmail (\d*) ?(.*)/

module.exports = {
	name: 'messageCreate',
	async execute(message) {
		if (message.channelId != commandChannelId && message.channelId != watchlistChannelId) return; 
        if (message.channelId == watchlistChannelId)
        {
            if (message.content.match(discordTagRegex)) {
                console.log(message.content.match(discordTagRegex))
                for (const match of message.content.match(discordTagRegex)) {
                    try
                    {
                        console.log(match);
                        await database.db.create({
                            discordid: match.replace("<@","").replace(">",""),
                            entry: message.content,
                            type: 1,
                        });
                        message.react('✅');
                    }
                    catch(error)
                    {
                        console.log(error);
                        message.react('❗');
                        break;
                    }
                }
            }
        }
        else if (message.channelId == commandChannelId)
        {
            const match = message.content.match(modmailRegex);
            if (match) {
                if (match[2] != '')
                {
                    try
                    {
                        await database.db.create({
                            discordid: match[1],
                            entry: match[2],
                            type: 2,
                        });
                        message.react('✅');
                    }
                    catch(error)
                    {
                        console.log(error);
                        message.react('❗');
                    }
                }
                else
                {
                    message.reply('Please include a reason when applying restrictions!');
                }
            }
        }
    },
};

