const { sequelize, DataTypes, Sequelize } = require('sequelize');
const UserModel = require('../models/user');

const sequelize = new Sequelize(
    'groupomania',
    'root',
    '',
    {
        host: 'localhost',
        dialect: 'mariadb',
        port: 3306,
        dialectOptions: {
            timezone: 'Etc/GMT-2',
            socketPath: '/opt/lampp/var/mysql/mysql.sock'
        },
        logging: false
    }
)

const User = UserModel(sequelize, DataTypes);

module.exports = {
    User
};