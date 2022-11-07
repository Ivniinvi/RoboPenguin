// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const database = require('./db.js');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

const mmRegExp = /ModMail Channel (\d+)/

client.on(Events.ChannelCreate, async channel => {
	if(channel.constructor.name === "TextChannel") {
		match = mmRegExp.exec(channel.topic);
		if(match[1]) {
			const content = await database.db.findOne({ where: { discordid: match[1] } });
			if(content.get('entry')){
				await new Promise(res => setTimeout(res, 2000));
				channel.send({
					"content": "",
					"embeds": [
						{
							"type": "rich",
							"title": `⚠️ Watchlist detected! ⚠️`,
							"description": `This user has an active watchlist: ${content.get('entry')}`,
							"color": 0xffff00
						}
					]
				})
			}
		}
	}

});

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	database.db.sync();
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);
