const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const index = require('../db.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('watchlist')
		.setDescription('Add, read, or remove watchlist data')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.setDMPermission(false)
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('Add a watchlist entry')
				.addStringOption(option => option.setName('user')
					.setDescription('The user to add a watchlist for'))
				.addStringOption(option => option.setName('content')
					.setDescription('The content of the watchlist entry')))
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
				.addStringOption(option => option.setName('user')
					.setDescription('The user to remove a watchlist for'))),
	async execute(interaction) {
		if (interaction.options.getSubcommand() === 'add') {
			const targetID = interaction.options.getString('user');
			const content = interaction.options.getString('content');
			if (!targetID || !content) return interaction.reply('All fields must be filled!');
			try {
				const tag = await index.db.create({
					discordid: targetID,
					entry: content,
				});
				return interaction.reply(`Watchlist applied for user ID ${tag.discordid} with content ${tag.entry}`);
			}
			catch (error) {
				if (error.name === 'SequelizeUniqueConstraintError') {
					return interaction.reply('That user already has a watchlist on them!');
				}
				return interaction.reply('Something went wrong, call a dev!');
			}
		}
		else if (interaction.options.getSubcommand() === 'check') {
			const targetID = interaction.options.getString('user');
			if (!targetID) return interaction.reply('All fields must be filled!');
			const tag = await index.db.findOne({ where: { discordid: targetID } });
			if (tag) {
				return interaction.reply(`Watchlist for user ID ${tag.discordid} found: ${tag.entry}`);
			}
			return interaction.reply(`Could not find watchlist for user ID ${targetID}`);
		}
		else if (interaction.options.getSubcommand() === 'remove') {
			const targetID = interaction.options.getString('user');
			if (!targetID) return interaction.reply('All fields must be filled!');
			const deletedCount = await index.db.destroy({ where: { discordid: targetID } });
			if (!deletedCount) return interaction.reply(`No watchlist found for user ID ${targetID}`);
			return interaction.reply(`Watchlist for user ID ${targetID} deleted.`)
		}
	},
};
