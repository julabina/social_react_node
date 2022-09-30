const { v4 } = require('uuid');
const { Comment, User, UserInfo } = require('../db/sequelize');

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