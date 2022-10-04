const { v4 } = require('uuid');
const { Comment, User, UserInfo } = require('../db/sequelize');

/**
 * find all comments for one post
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.findAllComments = (req, res, next) => {

    User.hasOne(UserInfo);
    UserInfo.belongsTo(User);
    User.hasMany(Comment);
    Comment.belongsTo(User);

    Comment.findAndCountAll({
        where: {
            postId: req.params.id
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
        .then(({ count, rows }) => {
            if(count === 0) {
                return res.status(404).json({ error : new error('aucun commentaire trouvée.') });
            }
            const message = `${count} commentaires bien trouvé.`;
            res.status(200).json({ message, data: rows, count });
        })
        .catch(error => res.status(500).json({ error })); 

};

/**
 * create new comment
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.createComment = (req, res, next) => {

    if (req.body.content !== "" || req.body.content !== undefined) {     
        textWithoutTag = req.body.content.replace(/<\/?[^>]+>/g,'');
        console.log(req.body);
        const comment = new Comment({
            id: v4(),
            content: textWithoutTag,
            postId: req.body.postId,
            userId: req.auth.userId,
            commentId: req.body.commentId ? req.body.commentId : null
        })

        comment.save()
            .then(() => {
                const message = 'Commentaire bien créé.';
                res.status(201).json({ message, success: true });
            })
            .catch(error => res.status(500).json({ error }));
    }
};

/**
 * get all responses for one comment
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.findResponse = (req, res, next) => {
    
    User.hasOne(UserInfo);
    UserInfo.belongsTo(User);
    User.hasMany(Comment);
    Comment.belongsTo(User);

    Comment.findAndCountAll({
        where: {
            commentId: req.params.id
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
        .then(({ count, rows }) => {
            if(count === 0) {
                return res.status(404).json({ error : new error('aucune reponses trouvée.') });
            }
            const message = `${count} reponses bien trouvé.`;
            res.status(200).json({ message, data: rows, count });
        })
        .catch(error => res.status(500).json({ error })); 

};

/**
 * delete one comment
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.deleteComment = (req, res, next) => {

    Comment.findByPk(req.params.id)
        .then(comment => {
            if (!comment) {
                return res.status(404).json({ error: new error('Aucun commentaire trouvé.') });
            }
            if (comment.userId !== req.auth.userId) {
                return res.status(403).json({ error: new error('Requete non authorisée.') });
            }

            Comment.destroy({
                where: {
                    commentId: req.params.id
                }
            })
                .then(() => {

                    Comment.destroy({
                        where: {
                            id: req.params.id
                        }
                    })
                        .then(() => {  
                            const message = "Message bien supprimé.";
                            res.status(200).json({ message, success: true });
                        })
                        .catch(error => res.status(500).json({ error }));
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));

};

exports.modifyComment = (req, res, next) => {

    if (req.body.content !== "" || req.body.content !== undefined) {     
        textWithoutTag = req.body.content.replace(/<\/?[^>]+>/g,'');

        Comment.findByPk(req.params.id)
            .then(comment => {
                if(!comment) {
                    return res.status(404).json({ error : new error('Commentaire non trouvée.') });
                }
                if(comment.userId !== req.auth.userId) {
                    return res.status(403).json({ error : new error('Requete non authorisée.') });
                }

                comment.update({
                    content: textWithoutTag,
                })
                    .then(() => {
                        const message = "Commentaire bien modifié.";
                        res.status(201).json({ message, success : true });
                    })  
                    .catch(error => res.status(500).json({ error }));  

            })
            .catch(error => res.status(500).json({ error }));
    }
};