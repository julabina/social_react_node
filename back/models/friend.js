module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Friend', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        friendOne: {
            type: DataTypes.STRING,
            allowNull: false
        },
        friendTwo: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM("pending","friend","received"),
            allowNull: false,
            defaultValue: "pending"
        },
        chatId: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },{
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    })
};