const { v4 } = require('uuid');
const { User, UserInfo } = require('../db/sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ValidationError, UniqueConstraintError } = require('sequelize');

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

exports.findUserInfos = (req, res, next) => {
    console.log(req.params.id);
    console.log('zaezaea');
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