const database = require('../db.js');

const mmRegExp = /ModMail Channel (\d+)/

module.exports = {
	name: 'channelCreate',
	async execute(channel) {
		if(channel.constructor.name === "TextChannel") {
			match = mmRegExp.exec(channel.topic);
			if(match[1]) {
				const content = await database.db.findAll({ where: { discordid: match[1] } });
				if(content[0].get('entry')){
					await new Promise(res => setTimeout(res, 2000));
					for (const dbitem of content){
						if (dbitem.get('type') === 1) {
							channel.send({
								"content": "",
								"embeds": [
									{
										"type": "rich",
										"title": `⚠️ Watchlist detected! ⚠️`,
										"description": `This user has an active watchlist: ${dbitem.get('entry')}`,
										"color": 0xffff00,
										"footer": {
											"text": `Watchlist ID: ${dbitem.get('id')}`
										}
									}
								]
							});
						}
						else if (dbitem.get('type') === 2) {
							channel.send({
								"content": "",
								"embeds": [
									{
										"type": "rich",
										"title": `ℹ️ Modmail reason: ℹ️`,
										"description": `${dbitem.get('entry')}`,
										"color": 0x5eaeeb
									}
								]
							});
							await database.db.destroy({ where: { id: dbitem.get('id') } });
						}
					}
				}
			}
		}

	},
};
