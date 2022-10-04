module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Post', {
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
        picture: {
            type: DataTypes.TEXT, 
            allowNull: true
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false
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