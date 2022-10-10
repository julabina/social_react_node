module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Message', {
        id:{
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        chatId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fromId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        }
    },{
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    })
};