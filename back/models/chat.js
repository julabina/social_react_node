module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Chat', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        userOne: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userTwo: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },{
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    })
};