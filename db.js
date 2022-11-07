const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
        host: 'localhost',
        dialect: 'sqlite',
        logging: false,
        // SQLite only
        storage: 'database.sqlite',
});

const Tags = sequelize.define('tags', {
        id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
        },
        discordid: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
        },
        entry: Sequelize.TEXT,
});

exports.db = Tags;
