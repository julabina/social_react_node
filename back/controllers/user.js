const { v4 } = require('uuid');
const { User, UserInfo } = require('../db/sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');

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
        return res.status(401).json({ message });

    } else if(
        req.body.password !== "" && req.body.email !== "" &&
        req.body.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)  &&
        req.body.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/i) &&
        req.body.firstname.match(/^[a-zA-Zé èà]*$/) &&
        req.body.lastname.match(/^[a-zA-Zé èà]*$/) &&
        req.body.firstname.length > 1 && req.body.firstname.length < 26 && 
        req.body.lastname.length > 1 && req.body.lastname.length < 26
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
                            .catch(error => res.status(400).json({ message: "Une erreur est survenue lors de la création des informations de l'utilisateur.", error }));
                    })
                    .catch(error => res.status(401).json({ message: "Une erreur est survenue lors de la création de l'utilisateur.", error }));
            })
            .catch(error => res.status(500).json({ error }));

    } else {
        const message = 'Les informations sont incorrectes ou incomplètes.';
        return res.status(401).json({ message });
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
};

/**
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
                return res.status(404).json({ error : new error('Utilisateur non trouvée.') });
            }
            if(userInfo.userId !== req.auth.userId) {
                return res.status(403).json({ error : new error('Requete non authorisée.') });
            }

            if (!userInfo.profilBaneer) {
                
                userInfo.update({
                    profilBaneer: req.file !== undefined ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : null
                })
                .then(() => {
                    const message = "Bannière bien modifié.";
                    res.status(201).json({ message, success: true });
                })
                .catch(error => res.status(501).json({ error }));
            } else {
                    
                const filename = userInfo.profilBaneer.split('/images/')[1];
                
                fs.unlink(`images/${filename}`, () => {
                    userInfo.update({
                        profilBaneer: req.file !== undefined ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : null
                    })
                    .then(() => {
                        const message = "Bannière bien modifié.";
                        res.status(201).json({ message, success: true });
                    })
                    .catch(error => res.status(501).json({ error }));
                })
                
            }
            
        })
        .catch(error => res.status(503).json({ error }));
    } else {
        const message = 'Aucune image importé.';
        res.status(400).json({ message });
    }
};

/**
 * edit user fisrtname and lastname
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.editNames = (req, res, next) => {

    if((req.body.firstname !== undefined && req.body.firstname.match(/^[a-zA-Zé èà]*$/)) && (req.body.lastname !== undefined && req.body.lastname.match(/^[a-zA-Zé èà]*$/))) {

        UserInfo.findOne({
            where: {
                userId: req.params.id
            }
        })
            .then(userInfo => {
                if(!userInfo) {
                    return res.status(404).json({ error : new error('Utilisateur non trouvée.') });
                }
                if(userInfo.userId !== req.auth.userId) {
                    return res.status(403).json({ error : new error('Requete non authorisée.') });
                }

                userInfo.update({
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                })
                    .then(() => {
                        const message = "Informations bien modifiés.";
                        res.status(200).json({ message, success: true })
                    })
                    .catch(error => res.status(500).json({ error }));

            })
            .catch(error => res.status(500).json({ error }));
            
    } else {
        const error = "Une erreur s'est produite.";
        res.status(400).json({ error });
    }
};

/**
 * edit user email
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.editEmail = (req, res, next) => {

    if((req.body.email !== undefined && req.body.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/i)) && (req.body.new !== undefined && req.body.new.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/i)) && (req.body.password !== undefined && req.body.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/))) {

        User.findByPk(req.params.id)
            .then(user => {
                if(!user) {
                    return res.status(404).json({ error : new error('Utilisateur non trouvée.') });
                }
                if(user.id !== req.auth.userId) {
                    return res.status(403).json({ error : new error('Requete non authorisée.') });
                }

                if(user.email !== req.body.email) {
                    const message = "L'email ne correspond pas à celui du compte.";
                    return res.status(401).json({ message, error: "email" });
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
                            .catch(error => res.status(500).json({ error }));

                    })
                    .catch(error => res.status(500).json({ error }));

            })
            .catch(error => res.status(500).json({ error }));

    } else {
        const error = "Une erreur s'est produite.";
        res.status(400).json({ error });
    }

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
        res.status(500).json({ error: "Une erreur est survenu." });
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
                return res.status(404).json({ error :'Utilisateur non trouvée.' });
            }
            if(userInfo.userId !== req.auth.userId) {
                return res.status(401).json({ error : 'Requete non authorisée.' });
            }

            if (!userInfo.profilImg) {
                    
                 userInfo.update({
                    profilImg: req.file !== undefined ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : null
                })
                .then(() => {
                    const message = "Bannière bien modifié.";
                    res.status(201).json({ message, success: true });
                })
                .catch(error => res.status(501).json({ error }));
            } else {

                const filename = userInfo.profilImg.split('/images/')[1];
                
                fs.unlink(`images/${filename}`, () => {
                    userInfo.update({
                        profilImg: req.file !== undefined ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : null
                    })
                    .then(() => {
                        const message = "Bannière bien modifié.";
                        res.status(201).json({ message, success: true });
                    })
                    .catch(error => res.status(501).json({ error }));
                })
                
            }
        })
        .catch(error => res.status(503).json({ error }));
    } else {
        const message = 'Aucune image importé.';
        res.status(400).json({ message });
    }

};