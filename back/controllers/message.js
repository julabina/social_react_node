const { v4 } = require('uuid');
const { Message } = require("../db/sequelize");

exports.getMessages = (req, res, next) => {
    Message.findAll({
        where: {
            chatId: req.params.id
        }
    })
        .then(messages => {
            if(!messages) {
                const message = "Aucun messages trouvé.";
                res.status(404).json({ message })
            }

            const message = "Messages trouvé.";
            res.status(200).json({ message, data: messages })
        })
};

exports.createMessage = (req, res, next) => {
    
    const msg = new Message({
        id: v4(),
        chatId: req.params.id,
        fromId: req.auth.userId,
        username: req.body.username,
        content: req.body.content
    });

    msg.save()
        .then(() => {
            const message = "Message créé.";
            res.status(201).json({ message });
        })
        .catch(error => res.status(500).json({ error }));

};