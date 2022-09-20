module.exports = (sequelize, DataTypes) => {
    return sequelize.define('User', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
            validate: {
                notEmpty: { msg: "L'id ne doit pas être vide." },
                notNull: { msg: "L'id est une propriété requise." },
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
                msg: "Un compte est déja lié à cet email."
            },
            validate: {
                notEmpty: { msg: "L'email ne doit pas être vide." },
                notNull: { msg: "L'email est une propriété requise." },
                is: {args : /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/i ,msg: "Format d'email non valide."},
            }
        },
        password: {
            type: DataTypes.STRING, 
            allowNull: false,
            validate: {
                notEmpty: { msg: "Le mot de passe ne doit pas être vide." }
            }
        },
        isAdmin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        }
    }
    ,{
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    })
};