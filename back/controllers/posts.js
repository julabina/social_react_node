const { v4 } = require('uuid');
const { Post, UserInfo, User } = require('../db/sequelize');
const fs = require('fs');

/**
 * get all posts
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.findAllPosts = (req, res, next) => {

    Post.findAll()
        .then(posts => {
            if (posts === null) {
                const message = "Aucun message n'a été trouvé.";
                return res.status(404).json({ message });
            }
            let userArr = posts.map(el => {
                return el.dataValues.userId;
            });
            const uniqueUserArr = [...new Set(userArr)];
            UserInfo.findAll({
                where: {
                    userId: uniqueUserArr
                }
            })
                .then(users => {
                    if (users === null) {
                        const message = "Aucun utilisateur n'a été trouvé.";
                        return res.status(404).json({ message });
                    }
                    const message = posts.length + " ont bien été trouvé.";
                    res.status(200).json({ message, data: posts, users });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));

};

/**
 * create new post
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
exports.createPost = (req, res, next) => {

    if (req.file !== undefined || JSON.parse(req.body.text) !== "") {

        let textWithoutTag = "";
        
        if (JSON.parse(req.body.text) !== "") {  
            if(JSON.parse(req.body.text).length > 500) {
                const message = "La longueur du contenu ne doit pas dépasser 500 caractères.";
                return res.status(401).json({ error: message })
            } else {
                textWithoutTag = JSON.parse(req.body.text).replace(/<\/?[^>]+>/g,'');
            }
        }
        
        const post = new Post({
            id: v4(),
            content: textWithoutTag,
            picture: req.file !== undefined ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : null,
            userId: JSON.parse(req.body.userId),
        });
        
        post.save()
            .then(() => {
                const message = 'Post bien créé."';
                res.status(201).json({ message, success: true });
            })
            .catch(error => res.status(401).json({ error }));
        
    } else {
        return res.status(401).json({ error: new error('Aucun contenu ajouté.') });
    }
};

/**
 * delete one post
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
 exports.deletePost = (req, res, next) => {
    Post.findByPk(req.params.id)
        .then(post => {

            if (!post) {
                return res.status(404).json({ error: 'Post non trouvé.' });
            }
            
            if ((post.userId !== req.auth.userId) && (req.auth.isAdmin !== true)) {
                return res.status(401).json({ error: 'Requete non authorisée.' });
            } 

            if (post.picture) {
                const filename = post.picture.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Post.destroy({ where: {id: req.params.id} })
                    .then(() => {
                        const message = "Le post a bien été supprimer.";
                        res.status(200).json({ message });
                    })
                    .catch(error => res.status(400).json({ error }));
                });
            } else {
                Post.destroy({ where: {id: req.params.id} })
                .then(() => {
                    const message = "Le post a bien été supprimer.";
                    res.status(200).json({ message });
                })
                .catch(error => res.status(400).json({ error }));
            }
        })
        .catch(error => res.status(500).json({ error }));
    };
       
/**
 * modify one post
 *  
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
exports.modifyPost = (req, res, next) => {

    if (req.file !== undefined || JSON.parse(req.body.text) !== "") {
        
        Post.findByPk(req.params.id)
            .then(post => {

                if(!post) {
                    return res.status(404).json({ error : 'Post non trouvée.' });
                }
                
                if ((post.userId !== req.auth.userId) && (req.auth.isAdmin !== true)) {
                    return res.status(401).json({ error: 'Requete non authorisée.' });
                } 

                let textWithoutTag = ""

                if (JSON.parse(req.body.text) !== "") {  
                    if(JSON.parse(req.body.text).length > 500) {
                        const message = "La longueur du contenu ne doit pas dépasser 500 caractères.";
                        return res.status(401).json({ error: message })
                    } else {
                        textWithoutTag = JSON.parse(req.body.text).replace(/<\/?[^>]+>/g,'');
                    }
                }

                if(req.file) {
                    const imgUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
                    const filename = imgUrl.split('/images/')[1];
                    post.update(
                        {
                            content: textWithoutTag,
                            picture: req.file !== undefined ? `${req.protocol}://${req.get('host')}/images/${filename}` : null
                        }
                    )
                        .then(() => {
                            const message = "Post mis à jour.";
                            res.status(200).json({ message });   
                        })
                        .catch(error => res.status(500).json({ error }));                       
                } else {
                    post.update(
                        {
                            content: textWithoutTag
                        }
                    )
                        .then(() => {
                            const message = "Post mis à jour.";
                            res.status(200).json({ message });   
                        })
                        .catch(error => res.status(500).json({ error }));
                }
            })
            .catch(error => res.status(500).json({ error }));
    } else {
        return res.status(401).json({ error: new error('Aucun contenu ajouté.') });
    }
};

/**
 * delete post picture
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.deleteCurrentImg = (req, res, next) => {
    Post.findByPk(req.params.id)
        .then(post => {
            if(!post) {
                return res.status(404).json({ error : 'Post non trouvée.' });
            }
            
            if ((post.userId !== req.auth.userId) && (req.auth.isAdmin !== true)) {
                return res.status(401).json({ error: 'Requete non authorisée.' });
            }   

            const filename = post.picture.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                post.update(
                {
                    picture: null
                }
                )
                    .then(() => {
                        const message = "Image bien supprimé.";
                        res.status(200).json({ message });
                    })
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

/**
 * get post picture
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.getPicture = (req, res, next) => {
    Post.findByPk(req.params.id)
        .then(post => {
            if(!post) {
                return res.status(404).json({ error : 'Post non trouvée.' });
            }
            
            if ((post.userId !== req.auth.userId) && (req.auth.isAdmin !== true)) {
                return res.status(401).json({ error: 'Requete non authorisée.' });
            } 

            const image = post.picture;
            const message = "Une image a bien été trouvé.";
            res.status(200).json({ message, data: image })
        })
        .catch(error => res.status(500).json({ error }));
};

/**
 * find all user post
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.findAllPostForUser = (req, res, next) => {
    Post.findAll({
        where: {
            userId: req.params.id
        }
    })
        .then(posts => {
            if(!posts) {
                return res.status(404).json({ error : new error('Aucun post de trouvée.') });
            }

            const message = "Des posts ont bien été trouvé..";
            res.status(200).json({ message , data: posts });
        })
        .catch(error => res.status(500).json({ error }));
};

/**
 * handle post likes 
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.handleLike = (req, res, next) => {

    Post.findByPk(req.params.id)
        .then(post => {
            if(!post) {
                return res.status(404).json({ error : 'Post non trouvée.' });
            }
           
            let usersArr = post.usersLiked;
            let likeNum = post.liked;

            if(usersArr.length === 1 && usersArr[0] === "") {
                usersArr = [req.auth.userId];
                likeNum = 1;
            } else if (usersArr.length === 1 && usersArr[0] === req.auth.userId) {
                usersArr = [""];
                likeNum = 0;
            } else {

                if (usersArr.includes(req.auth.userId)) {
                    usersFiltered = usersArr.filter(el => {
                        return el !== req.auth.userId
                    });
                    usersArr = usersFiltered;
                } else {
                    usersArr.push(req.auth.userId);
                }

                likeNum = usersArr.length;

            }

            post.update({
                usersLiked : usersArr,
                likes: likeNum,
            }, {silent: true})
                .then(() => {
                    const message = "Like pris en compte.";
                    res.status(200).json({ message, success: true });
                })
                .catch(error => res.status(500).json({ error }));
            
        })
        .catch(error => res.status(500).json({ error }));

};