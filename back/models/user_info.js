module.exports = (sequelize, DataTypes) => {
    return sequelize.define('User_info', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
            validate: {
                notEmpty: { msg: "L'id ne doit pas être vide." },
                notNull: { msg: "L'id est une propriété requise." },
            }
        },
        firstname: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "Le prénom ne doit pas être vide." },
                len: { args: [2, 25], msg: "Le prénom doit etre compris entre 2 et 25 caractères." },
                is: {args: /^[a-zA-Zé èà]*$/, msg: "le prénom ne doit contenir que des lettres"}
            }
        },
        lastname: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "Le nom ne doit pas être vide." },
                len: { args: [2, 25], msg: "Le nom doit etre compris entre 2 et 25 caractères." },
                is: {args: /^[a-zA-Zé èà]*$/, msg: "le nom ne doit contenir que des lettres"}
            }
        },
        profilImg: {
            type: DataTypes.TEXT, 
            allowNull: true
        },
        profilBaneer: {
            type: DataTypes.TEXT, 
            allowNull: true
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "L'id ne doit pas être vide." },
                notNull: { msg: "L'id est une propriété requise." },
            }
        }
    },{
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    })
};