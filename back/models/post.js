module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Post', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            unique: {
                msg: 'L\'id est deja utilisé.'
            },
            allowNull:false,
            validate: {
                notEmpty: { msg: "L'id ne doit pas être vide." },
                notNull: { msg: "L'id est une propriété requise." },
            }
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false, 
            validate: {
                notNull: { msg: "L'id est une propriété requise." },
            }
        },
        picture: {
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
        },
        likes: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        usersLiked: {
            type: DataTypes.TEXT,
            allowNull: true,
            get() {
                return this.getDataValue('usersLiked').split(',')
            },
            set(usersLiked) {
                this.setDataValue('usersLiked', usersLiked.join())
            },
        }
    }, {
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    })
};