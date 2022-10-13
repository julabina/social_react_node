module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Comment', {
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
                notEmpty: { msg: "Le contenu ne doit pas être vide." },
                len: { args: [1, 300], msg: "Le contenu doit etre compris entre 1 et 300 caractères." }
            }
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "L'userId' ne doit pas être vide." },
                notNull: { msg: "L'userId' est une propriété requise." },
            }
        },
        postId: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "Le postId ne doit pas être vide." },
                notNull: { msg: "Le postId est une propriété requise." },
            }
        },
        commentId: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                notEmpty: { msg: "Le commentId ne doit pas être vide." },
            }
        },
        likes: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        usersLiked: {
            type: DataTypes.TEXT,
            allowNull: false,
            get() {
                return this.getDataValue('usersLiked').split(',')
            },
            set(usersLiked) {
                this.setDataValue('usersLiked', usersLiked.join())
            },
            defaultValue: ""
        }
    }, {
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    })
};