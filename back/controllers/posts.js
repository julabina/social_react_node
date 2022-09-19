const { v4 } = require('uuid');
const { Post } = require('../db/sequelize');

exports.findAllPosts = (req, res, next) => {

    Post.findAndCountAll()
        .then(({count, rows}) => {
            if (count === 0) {
                const message = "Aucun post trouvé.";
                return res.status(404).json({ message });
            }
            const message = `${count} posts ont bien été trouvés.`;
            res.status(200).json({ message, data: rows })
        })
        .catch(error => res.status(500).json({ error }));

}

exports.createPost = (req, res, next) => {

    const post = new Post({
        id: v4(),
        title: req.body.title,
        content: req.body.text,
        userId: 'jean-luc'
    });
   
    post.save()
        .then(() => {
            const message = 'Post bien créé."';
            res.status(201).json({ message });
        })
        .catch(error => res.status(401).json({ error }));

}