const { v4 } = require('uuid');
const { Friend, Chat, User, UserInfo } = require('../db/sequelize');

/**
 * create friends relation with pending status
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.createFriendQuery = (req, res, next) => {

    Friend.findOne({
        where: {
            mainId: req.auth.userId,
            userId: req.params.id
        }
    })
        .then(friend => {
            
            if(friend !== null) {
                const message = "Une relation existe deja.";
                return res.status(401).json({ message });
            }
            
            const user1 = req.auth.userId;
            const user2 = req.params.id;
            const newChatId = v4();

            const newChat = new Chat({
                id: newChatId,
                userOne: user1,
                userTwo: user2
            });

            const friendsQuery = new Friend({
                mainId: user1,
                userId: user2,
                chatId: newChatId
            });
            
            const friendReceived = new Friend({
                mainId: user2,
                userId: user1,
                chatId: newChatId,
                status: "received"
            });
            
            newChat.save()
            .then(() => {
                    friendsQuery.save()
                        .then(() => {
                            friendReceived.save()
                                .then(() => {
                                    const message = "Demande bien créé.";
                                    res.status(201).json({ message, success: true });
                                })
                                .catch(error => res.status(501).json({ error }));
                        })
                        .catch(error => res.status(500).json({ error }));
                })
                .catch(error => res.status(500).json({ error }));
                
        })
        .catch(error => res.status(500).json({ error }));


};

/**
 * check is users are friends
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.checkIfFriend = (req, res, next) => {

    Friend.findOne({
        where: {
            mainId: req.auth.userId,
            userId: req.params.id
        }
    })
        .then(friendRelation => {
            if(!friendRelation) {
                const message = "Aucune relation trouvé.";
                return res.status(404).json({ message, status: "none" })
            }

            const message = "Relation bien trouvé.";
            res.status(200).json({ message, status: friendRelation.status });
        })
        .catch(error => res.status(500).json({ error }));

};

/**
 * cancel a relation pending query 
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.cancelFriendQuery = (req, res, next) => {
    let chatId = "";

    Friend.findOne({
        where: {
            mainId: req.auth.userId,
            userId: req.params.id
        }
    })
        .then(request => {
            if(!request) {
                const message = "Aucune relation trouvé.";
                return res.status(404).json({ message });
            }
            if(request.status !== "pending") {
                const message = "Aucune requete en attente.";
                return res.status(401).json({ message });
            }

            chatId = request.dataValues.chatId;

            request.destroy()
                .then(() => {

                    Friend.findOne({
                        where: {
                            mainId: req.params.id,
                            userId: req.auth.userId,
                        }
                    })
                        .then(received => {
                            if(!received) {
                                const message = "Aucune relation trouvé.";
                                return res.status(404).json({ message });
                            }

                            received.destroy()
                                .then(() => {
                                    Chat.findByPk(chatId)
                                        .then(chat => {
                                            if (!chat) {
                                                const message = 'Aucune conversation trouvé.';
                                                return res.status(404).json({ message });
                                            }

                                            chat.destroy()
                                                .then(() => {
                                                    const message = 'Demande annulée.';
                                                    res.status(201).json({ message, success: true });
                                                })
                                        })

                                })
                                .catch(error => res.status(500).json({ error }));
                        })
                        .catch(error => res.status(500).json({ error }));
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));

};

/**
 * accept a relation query and change the relation status to friend
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.acceptFriendQuery = (req, res, next) => {

    Friend.findOne({
        where: {
            mainId: req.auth.userId,
            userId: req.params.id,
        }
    })
        .then(relation => {
            if(!relation) {
                const message = "Aucune relation trouvé.";
                return res.status(404).json({ message });
            }
            if (relation.status !== "received") {
                const message = "Mauvais status de la relation.";
                return res.status(401).json({ message });
            }

            relation.update({
                status: "friend"
            })
                .then(() => {
                    Friend.findOne({
                        where: {
                            mainId: req.params.id,
                            userId: req.auth.userId,
                        }
                    })
                        .then(relation2 => {
                            if(!relation2) {
                                relation.destroy()
                                    .then(() => {

                                        const message = "Aucune relation trouvé.";
                                        return res.status(404).json({ message });
                                    })
                                    .catch(error => {
                                        return res.status(500).json({ error })
                                    });
                            }
                            
                            relation2.update({
                                status: "friend"
                            }) 
                                .then(() => {
                                    const message_= "Relation mise à jour.";
                                    res.status(201).json({ message, success: true });
                                })
                                .catch(error => res.status(500).json({ error }));
                        })
                        .catch(error => res.status(500).json({ error }));
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));

};

/**
 * delete users relation
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.cancelRelation = (req, res, next) => {

    let chatId = "";

    Friend.findOne({
        where: {
            mainId: req.auth.userId,
            userId: req.params.id,
        }
    })
        .then(firstRelation => {
            Friend.findOne({
                where: {
                    mainId: req.params.id,
                    userId: req.auth.userId,
                }
            })
                .then(secondRelation => {
                    if(!firstRelation && !secondRelation) {
                        const message = "Aucune relation trouvé.";
                        return res.status(404).json({ message });
                    } else if(!firstRelation) {
                        chatId = secondRelation.dataValues.chatId;
                        secondRelation.destroy()
                            .then(() => {
                                Chat.findByPk(chatId)
                                    .then(chat => {
                                        if (!chat) {
                                            const message = "Aucune conversation trouvé.";
                                            return res.status(201).json({ message });
                                        }

                                        chat.destroy()
                                            .then(() => {
                                                const message = "Relation bien supprimé.";
                                                return res.status(201).json({ message, success: true });
                                            })
                                            .catch(error => {
                                                return res.status(500).json({ error })
                                            });
                                    })
                                    .catch(error => {
                                        return res.status(500).json({ error })
                                    });

                            })
                            .catch(error => {
                                return res.status(500).json({ error })
                            });
                    } else if(!secondRelation) {
                        chatId = firstRelation.dataValues.chatId;
                        firstRelation.destroy()
                            .then(() => {
                                Chat.findByPk(chatId)
                                    .then(chat => {
                                        if (!chat) {
                                            const message = "Aucune conversation trouvé.";
                                            return res.status(201).json({ message });
                                        }

                                        chat.destroy()
                                            .then(() => {
                                                const message = "Relation bien supprimé.";
                                                return res.status(201).json({ message, success: true });
                                            })
                                            .catch(error => {
                                                return res.status(500).json({ error })
                                            });
                                    })
                                    .catch(error => {
                                        return res.status(500).json({ error })
                                    });
                            })
                            .catch(error => {
                                return res.status(500).json({ error })
                            });
                    }
                        
                    chatId = firstRelation.dataValues.chatId;
                    firstRelation.destroy()
                        .then(() => {
                                secondRelation.destroy()
                                    .then(() => {
                                        Chat.findByPk(chatId)
                                            .then(chat => {
                                                if (!chat) {
                                                    const message = "Aucune conversation trouvé.";
                                                    return res.status(201).json({ message });
                                                }

                                                chat.destroy()
                                                    .then(() => {
                                                        const message = "Relations bien supprimé.";
                                                        return res.status(201).json({ message, success: true });
                                                    })
                                                    .catch(error => {
                                                        return res.status(500).json({ error })
                                                    });
                                            })
                                            .catch(error => {
                                                return res.status(500).json({ error })
                                            });
                                            })
                                            .catch(error => res.status(500).json({ error }));
                            })
                            .catch(error => res.status(500).json({ error }));
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));

};


exports.getFriends = (req, res, next) => {

    User.hasOne(UserInfo);
    UserInfo.belongsTo(User);
    User.hasMany(Friend);
    Friend.belongsTo(User);

    Friend.findAll({
        where: {
            mainId: req.params.id,
            status: "friend"
        },
        include: [
            {
                model: User,
                include: {
                    model: UserInfo
                }
            }
        ]
    })
        .then(friends => {
            if(!friends) {
                const message = "Aucun ami trouvé.";
                return res.status(404).json({ message })
            }
            
            const message = "Amis trouvé.";
            res.status(200).json({ message, data: friends })
        })
        .catch(error => res.status(500).json({ error }));

};

exports.getRelations = (req, res, next) => {

    User.hasOne(UserInfo);
    UserInfo.belongsTo(User);
    User.hasMany(Friend);
    Friend.belongsTo(User);

    Friend.findAll({
        where: {
            mainId: req.params.id,
        },
        include: [
            {
                model: User,
                include: {
                    model: UserInfo
                }
            }
        ]
    })
        .then(relation => {
            if(!relation) {
                const message = "Aucune relation trouvé.";
                return res.status(404).json({ message })
            }
            
            const message = "Relations trouvé.";
            res.status(200).json({ message, data: relation })
        })
        .catch(error => res.status(500).json({ error }));

};