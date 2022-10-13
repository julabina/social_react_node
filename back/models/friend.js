module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Friend', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            unique: {
                msg: 'L\'id est deja utilisé.'
            },
            validate: {
                notEmpty: { msg: "Le mainId ne doit pas être vide." },
                notNull: { msg: "Le mainId est une propriété requise." },
            }
        },
        mainId: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "Le mainId ne doit pas être vide." },
                notNull: { msg: "Le mainId est une propriété requise." },
            }
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "L'userId ne doit pas être vide." },
                notNull: { msg: "L'userId est une propriété requise." },
            }
        },
        status: {
            type: DataTypes.ENUM("pending","friend","received"),
            allowNull: false,
            defaultValue: "pending"
        },
        chatId: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "Le chatId ne doit pas être vide." },
                notNull: { msg: "Le chatId est une propriété requise." },
            }
        }
    },{
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    })
};