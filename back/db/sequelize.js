const { DataTypes, Sequelize } = require('sequelize');
const UserModel = require('../models/user');
const UserInfoModel = require('../models/user_info');
const PostModel = require('../models/post');
const CommentModel = require('../models/comment');
const FriendModel = require('../models/friend');
const ChatModel = require('../models/chat');
const MessageModel = require('../models/message');

const sequelize = new Sequelize(
    'groupomania',
    'root',
    '',
    {
        host: 'localhost',
        dialect: 'mariadb',
        port: 3306,
        dialectOptions: {
            timezone: 'Etc/GMT-2',
            socketPath: '/opt/lampp/var/mysql/mysql.sock'
        },
        logging: false
    }
)

const User = UserModel(sequelize, DataTypes);
const UserInfo = UserInfoModel(sequelize, DataTypes);
const Post = PostModel(sequelize, DataTypes);
const Comment = CommentModel(sequelize, DataTypes);
const Friend = FriendModel(sequelize, DataTypes);
const Chat = ChatModel(sequelize, DataTypes);
const Message = MessageModel(sequelize, DataTypes);

module.exports = {
    User, Post, UserInfo, Comment, Friend, Chat, Message
};