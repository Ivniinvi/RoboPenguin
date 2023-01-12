const database = require('../db.js');

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		database.db.sync();
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};
