const { v4 } = require('uuid');
const { User, UserInfo, Comment, Post, Friend, Chat, Message } = require('../db/sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { ValidationError, UniqueConstraintError } = require('sequelize');

/**
 * create an user account
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
exports.sign = (req, res, next) => {

    if(req.body.email === undefined || req.body.password === undefined || req.body.firstname === undefined || req.body.lastname === undefined) {
        const message = "Toutes les informations n'ont pas été envoyées.";
        return res.status(400).json({ message });

    } else if(
        req.body.password !== "" &&
        req.body.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
    ) {
        
        bcrypt.hash(req.body.password, 10)
            .then(hash => {
                const userId = v4();
                const user = new User({
                    id: userId,
                    email: req.body.email,
                    password: hash
                });
                user.save()
                    .then(() => {
                        const userInfo = new UserInfo({
                            id: v4(),
                            firstname: req.body.firstname,
                            lastname: req.body.lastname,
                            userId: userId
                        })
                        userInfo.save()
                            .then(() => {
                                const message = "Utilisateur bien créé.";
                                res.status(201).json({ message });
                            })
                            .catch(error => {
                                if (error instanceof ValidationError) {
                                    return res.status(400).json({message: error.message, data: error}); 
                                }
                                if (error instanceof UniqueConstraintError) {
                                    return res.status(400).json({message: error.message, data: error});
                                }
                                res.status(500).json({ message: "Une erreur est survenue lors de la création de l'utilisateur.", error });
                            });
                    })
                    .catch(error => {
                        if (error instanceof ValidationError) {
                            return res.status(400).json({message: error.message, data: error}); 
                        }
                        if (error instanceof UniqueConstraintError) {
                            return res.status(400).json({message: error.message, data: error});
                        }
                        res.status(500).json({ message: "Une erreur est survenue lors de la création de l'utilisateur.", error });
                    });
            })
            .catch(error => res.status(500).json({ error }));

    } else {
        const message = 'Les informations sont incorrectes ou incomplètes.';
        return res.status(400).json({ message });
    }
};

/**
 * log one user
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.login = (req, res, next) => {

    if (
        req.body.password !== "" && req.body.email !== "" &&
        req.body.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)  &&
        req.body.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/i) 
    ) {    
        User.findOne({ where: {email: req.body.email} })
            .then(user => {
                if(user === null) {
                    const message = "Aucun utilisateur trouvé.";
                    return res.status(404).json({ message });
                }
                bcrypt.compare(req.body.password, user.password)
                    .then(valid => {
                        if(!valid) {
                            const message = "Le mot de passe est incorrect.";
                            return res.status(401).json({ message });
                        }
                        res.status(200).json({
                            userId: user.id,
                            token: jwt.sign(
                                {userId: user.id},
                                '' + process.env.REACT_APP_JWT_PRIVATE_KEY + '',
                                { expiresIn: '24h' }
                            )
                        })
                    })
                    .catch(error => res.status(500).json({ error }));
            })
            .catch(error => res.status(500).json({ error }));
        } else {
            const message = 'Les informations sont incorrectes ou incomplètes.';
            res.status(400).json({ message });
        }
};

/**
 * get info for one user
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.findUserInfos = (req, res, next) => {
    UserInfo.findOne({ where: { userId: req.params.id } })
        .then(user => {
            if (user === null) {
                const message = "Aucun utilisateur trouvé.";
                res.status(404).json({ message });
            }
            const message = "Un utilisateur a bien été trouvé.";
            res.status(200).json({ message, data: user });
        })
        .catch(error => res.status(500).json({ error }))
};

/**
 * change the banneer image
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.changeBaneer = (req, res, next) => {
    if(req.file!== undefined) {

        UserInfo.findOne({
            where: {
                userId: req.params.id
            }
        })
        .then(userInfo => {
            if(!userInfo) {
                return res.status(404).json({ error : 'Utilisateur non trouvée.' });
            }
            if(userInfo.userId !== req.auth.userId) {
                return res.status(403).json({ error : 'Requete non authorisée.' });
            }

            if (!userInfo.profilBaneer) {
                
                userInfo.update({
                    profilBaneer: req.file !== undefined ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : null
                })
                .then(() => {
                    const message = "Bannière bien modifiée.";
                    res.status(201).json({ message, success: true });
                })
                .catch(error => res.status(500).json({ error }));
            } else {
                    
                const filename = userInfo.profilBaneer.split('/images/')[1];
                
                fs.unlink(`images/${filename}`, () => {
                    userInfo.update({
                        profilBaneer: req.file !== undefined ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : null
                    })
                    .then(() => {
                        const message = "Bannière bien modifiée.";
                        res.status(201).json({ message, success: true });
                    })
                    .catch(error => res.status(500).json({ error }));
                })
                
            }
            
        })
        .catch(error => res.status(500).json({ error }));
    } else {
        const message = 'Aucune image importée.';
        res.status(400).json({ message });
    }
};

/**
 * edit user firstname and lastname
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.editNames = (req, res, next) => {

        UserInfo.findOne({
            where: {
                userId: req.params.id
            }
        })
            .then(userInfo => {
                if(!userInfo) {
                    return res.status(404).json({ error : 'Utilisateur non trouvée.' });
                }
                if(userInfo.userId !== req.auth.userId) {
                    return res.status(403).json({ error : 'Requete non authorisée.' });
                }

                userInfo.update({
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                })
                    .then(() => {
                        const message = "Informations bien modifiés.";
                        res.status(201).json({ message, success: true })
                    })
                    .catch(error => {
                        if (error instanceof ValidationError) {
                            return res.status(400).json({message: error.message, data: error}); 
                        }
                        if (error instanceof UniqueConstraintError) {
                            return res.status(400).json({message: error.message, data: error});
                        }
                        res.status(500).json({ error });
                    });

            })
            .catch(error => res.status(500).json({ error }));
            
};

/**
 * edit user email
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.editEmail = (req, res, next) => {

        User.findByPk(req.params.id)
            .then(user => {
                if(!user) {
                    return res.status(404).json({ error: 'Utilisateur non trouvée.' });
                }
                if(user.id !== req.auth.userId) {
                    return res.status(403).json({ error : 'Requete non authorisée.' });
                }

                if(user.email !== req.body.email) {
                    const message = "L'email ne correspond pas à celui du compte.";
                    return res.status(403).json({ message, error: "email" });
                }

                bcrypt.compare(req.body.password, user.password)
                    .then(valid => {
                        if (!valid) {
                            const message = "Le mot de passe ne correspond pas.";
                            return res.status(401).json({ message, error: "pwd" });
                        }

                        user.update({
                            email: req.body.new
                        })
                            .then(() => {
                                const message = "Email bien modifié.";
                                res.status(201).json({ message, success: true });
                            })
                            .catch(error => {
                        if (error instanceof ValidationError) {
                            return res.status(400).json({message: error.message, data: error}); 
                        }
                        if (error instanceof UniqueConstraintError) {
                            return res.status(400).json({message: error.message, data: error});
                        }
                        res.status(500).json({ message: "Une erreur est survenue lors de la création de l'utilisateur.", error });
                    });

                    })
                    .catch(error => {
                        if (error instanceof ValidationError) {
                            return res.status(400).json({message: error.message, data: error}); 
                        }
                        if (error instanceof UniqueConstraintError) {
                            return res.status(400).json({message: error.message, data: error});
                        }
                        res.status(500).json({ error });
                    });

            })
            .catch(error => res.status(500).json({ error }));


};

/**
 * check if user is an admin
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.isAdmin = (req, res, next) => {

    if(req.auth) {
        if (req.auth.isAdmin === true) {
            res.status(200).json({ isAdmin: true });
        } else {
            res.status(200).json({ isAdmin: false });
        }
    } else {
        res.status(500).json({ error: "Une erreur est survenue." });
    }

};

/**
 * edit profil picture
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.changeProfilImg = (req, res, next) => {

    if(req.file!== undefined) {

        UserInfo.findOne({
            where: {
                userId: req.params.id
            }
        })
        .then(userInfo => {
            if(!userInfo) {
                return res.status(404).json({ error :'Utilisateur non trouvé.' });
            }
            if(userInfo.userId !== req.auth.userId) {
                return res.status(403).json({ error : 'Requete non authorisée.' });
            }

            if (!userInfo.profilImg) {
                    
                 userInfo.update({
                    profilImg: req.file !== undefined ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : null
                })
                .then(() => {
                    const message = "Photo de profil bien modifiée.";
                    res.status(201).json({ message, success: true });
                })
                .catch(error => res.status(500).json({ error }));
            } else {

                const filename = userInfo.profilImg.split('/images/')[1];
                
                fs.unlink(`images/${filename}`, () => {
                    userInfo.update({
                        profilImg: req.file !== undefined ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : null
                    })
                    .then(() => {
                        const message = "Photo de profil bien modifiée.";
                        res.status(201).json({ message, success: true });
                    })
                    .catch(error => res.status(500).json({ error }));
                })
                
            }
        })
        .catch(error => res.status(500).json({ error }));
    } else {
        const message = 'Aucune image importée.';
        res.status(400).json({ message });
    }

};

exports.deleteAccount = (req, res, next) => {
    
    if (req.params.id === req.auth.userId) { 
        
        let commentsByUser = [];
        let chatsForUser = []
        
        User.findByPk(req.params.id)
            .then(user => {
                if (!user) {
                    const message = "L'utilisateur n'a pas été trouvé.";
                    return res.status(404).json({ message });
                }
                // get comment create by user 
                
                Comment.findAll({where: {userId: req.params.id, commentId: null}})
                    .then(comments => {
                        if (comments) {  
                            for (let i = 0; i < comments.length; i++) {
                                commentsByUser.push(comments[i].id);
                            }
                        }
                        // get chat room used by user
                        Friend.findAll({where: { mainId: req.params.id }})
                            .then(friendRelations => {
                                if (friendRelations) {  
                                    for (let i = 0; i < friendRelations.length; i++) {
                                        chatsForUser.push(friendRelations[i].chatId);
                                    }
                                }

                                //start to destroy

                                Comment.destroy({where: { commentId: commentsByUser }})
                                    .then(() => {
                                        Comment.destroy({where: { userId: req.params.id }})
                                            .then(() => {
                                                Message.destroy({where: { chatId: chatsForUser }})
                                                    .then(() => {
                                                        Chat.destroy({ where: { id: chatsForUser } })
                                                            .then(() => {
                                                                Post.destroy({ where: { userId: req.params.id } })
                                                                    .then(() => {
                                                                        Friend.destroy({ where: { chatId: chatsForUser } })
                                                                            .then(() => {
                                                                                UserInfo.destroy({where: { userId: req.params.id }})
                                                                                    .then(() => {
                                                                                        User.destroy({ where: { id: req.params.id } })
                                                                                            .then(() => {
                                                                                                const message = "Utilisateur bien supprimé";
                                                                                                res.status(200).json({ message, success: true });
                                                                                            })
                                                                                            .catch(error =>  res.status(500).json({ error }));
                                                                                    })
                                                                                    .catch(error =>  res.status(500).json({ error }));
                                                                            })
                                                                            .catch(error =>  res.status(500).json({ error }));
                                                                    })
                                                                    .catch(error =>  res.status(500).json({ error }));
                                                            })
                                                            .catch(error =>  res.status(500).json({ error }));
                                                    })
                                                    .catch(error =>  res.status(500).json({ error }));
                                            })
                                            .catch(error =>  res.status(500).json({ error }));
                                    })
                                    .catch(error =>  res.status(500).json({ error }));
                            })
                            .catch(error =>  res.status(500).json({ error }));
                    })
                    .catch(error =>  res.status(500).json({ error }));

            })
            .catch(error => res.status(500).json({ error }));
    } else {
        const message = "L'id ne correspond pas.";
        res.status(401).json({ message });
    }

};