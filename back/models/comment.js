module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Comment', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            unique: {
                msg: 'L\'id est deja utilisé.'
            }
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        postId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        commentId: {
            type: DataTypes.STRING,
            allowNull: true
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