const { Friend, User } = require('../db/sequelize');

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
            friendOne: req.auth.userId,
            friendTwo: req.params.id
        }
    })
        .then(friend => {

            if(friend !== null) {
                const message = "Une relation existe deja.";
                return res.status(401).json({ message });
            }

            const user1 = req.auth.userId;
            const user2 = req.params.id;
        
            const friendsQuery = new Friend({
                friendOne: user1,
                friendTwo: user2
            });
            
            const friendReceived = new Friend({
                friendOne: user2,
                friendTwo: user1,
                status: "received"
            });
        
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
            friendOne: req.auth.userId,
            friendTwo: req.params.id
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

    Friend.findOne({
        where: {
            friendOne: req.auth.userId,
            friendTwo: req.params.id
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

            request.destroy()
                .then(() => {

                    Friend.findOne({
                        where: {
                            friendOne: req.params.id,
                            friendTwo: req.auth.userId,
                        }
                    })
                        .then(received => {
                            if(!received) {
                                const message = "Aucune relation trouvé.";
                                return res.status(404).json({ message });
                            }

                            received.destroy()
                            .then(() => {
                                const message = 'Demande annulée.';
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
 * accept a relation query and change the relation status to friend
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.acceptFriendQuery = (req, res, next) => {

    Friend.findOne({
        where: {
            friendOne: req.auth.userId,
            friendTwo: req.params.id,
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
                            friendOne: req.params.id,
                            friendTwo: req.auth.userId,
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

    Friend.findOne({
        where: {
            friendOne: req.auth.userId,
            friendTwo: req.params.id,
        }
    })
        .then(firstRelation => {
            Friend.findOne({
                where: {
                    friendOne: req.params.id,
                    friendTwo: req.auth.userId,
                }
            })
                .then(secondRelation => {
                    if(!firstRelation && !secondRelation) {
                        const message = "Aucune relation trouvé.";
                        return res.status(404).json({ message });
                    } else if(!firstRelation) {
                        secondRelation.destroy()
                        .then(() => {
                                const message = "Relation bien supprimé.";
                                return res.status(201).json({ message, success: true });
                            })
                            .catch(error => {
                                return res.status(500).json({ error })
                            });
                    } else if(!secondRelation) {
                        firstRelation.destroy()
                        .then(() => {
                                const message = "Relation bien supprimé.";
                                return res.status(201).json({ message, success: true });
                            })
                            .catch(error => {
                                return res.status(500).json({ error })
                            });
                    }
                        
                    firstRelation.destroy()
                        .then(() => {
                                secondRelation.destroy()
                                    .then(() => {
                                        const message = "Relations bien supprimés.";
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


exports.getFriends = (req, res, next) => {

    Friend.findAll({
        where: {
            friendOne: req.params.id,
            status: "friend"
        }
    })
        .then(friends => {
            if(!friends) {
                const message = "Aucun ami trouvé.";
                return res.status(404).json({ message })
            }
            
            const message = "amis trouvé.";
            res.status(200).json({ message, data: friends })
        })
        .catch(error => res.status(500).json({ error }));

};