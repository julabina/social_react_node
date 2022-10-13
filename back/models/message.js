module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Message', {
        id:{
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
        chatId: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "Le chatId ne doit pas être vide." },
                notNull: { msg: "Le chatId est une propriété requise." },
            }
        },
        fromId: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "Le fromId ne doit pas être vide." },
                notNull: { msg: "Le fromId est une propriété requise." },
            }
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "L'username ne doit pas être vide." },
                is: {args: /^[a-zA-Zé èà]*$/, msg: "l'username ne doit contenir que des lettres"}
            }
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: { msg: "Le contenu ne doit pas être vide." },
                len: { args: [1, 500], msg: "Le contenu doit etre compris entre 1 et 500 caractères." }
            }
        }
    },{
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    })
};