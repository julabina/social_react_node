const { v4 } = require('uuid');
const { Post, UserInfo } = require('../db/sequelize');

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

exports.createPost = (req, res, next) => {
console.log(req.body.userId);
    const post = new Post({
        id: v4(),
        content: JSON.parse(req.body.text),
        picture: req.file !== undefined ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : null,
        userId: JSON.parse(req.body.userId)
    });
    
    post.save()
        .then(() => {
            const message = 'Post bien créé."';
            res.status(201).json({ message, success: true });
        })
        .catch(error => res.status(401).json({ error }));

};