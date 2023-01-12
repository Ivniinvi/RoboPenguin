const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const index = require('../db.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('watchlist')
		.setDescription('Check or remove watchlist data')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.setDMPermission(false)
		.addSubcommand(subcommand =>
			subcommand
				.setName('check')
				.setDescription('Check a watchlist entry')
				.addStringOption(option => option.setName('user')
					.setDescription('The user to check a watchlist for')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('remove')
				.setDescription('Remove a watchlist entry')
				.addIntegerOption(option => option.setName('id')
					.setDescription('The ID of a watchlist to remove'))),
	async execute(interaction) {
		if (interaction.options.getSubcommand() === 'check') {
			const targetID = interaction.options.getString('user');
			if (!targetID) return interaction.reply('All fields must be filled!');
			const tag = await index.db.findAll({ where: { discordid: targetID, type: 1 } });
			if (tag) {
				var tagString = `Watchlists found for user ID ${targetID}:\n`;
				for (const dbitem of tag) {
					tagString += `${dbitem.id} | ${dbitem.entry}\n`;
				}
				return interaction.reply(tagString);
			}
			return interaction.reply(`Could not find watchlist for user ID ${targetID}`);
		}
		else if (interaction.options.getSubcommand() === 'remove') {
			const targetID = interaction.options.getInteger('id');
			if (!targetID) return interaction.reply('All fields must be filled!');
			const deletedCount = await index.db.destroy({ where: { id: targetID } });
			if (!deletedCount) return interaction.reply(`No watchlist found for ID ${targetID}`);
			return interaction.reply(`Watchlist ID ${targetID} deleted.`)
		}
	},
};
