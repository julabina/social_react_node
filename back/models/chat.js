module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Chat', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
            unique: {
                msg: 'L\'id est deja utilisé.'
            },
            validate: {
                notEmpty: { msg: "L'id ne doit pas être vide." },
                notNull: { msg: "L'id est une propriété requise." },
            }
        },
        userOne: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "L'user 1 ne doit pas être vide." },
                notNull: { msg: "L'user 1 est une propriété requise." },
            }
        },
        userTwo: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "L'user 2 ne doit pas être vide." },
                notNull: { msg: "L'user 2 est une propriété requise." },
            }
        }
    },{
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    })
};