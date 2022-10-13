const { v4 } = require('uuid');
const { Message } = require("../db/sequelize");
const { ValidationError, UniqueConstraintError } = require('sequelize');

exports.getMessages = (req, res, next) => {
    Message.findAll({
        where: {
            chatId: req.params.id
        }
    })
        .then(messages => {
            if(!messages) {
                const message = "Aucun messages trouvés.";
                res.status(404).json({ message })
            }

            const message = "Messages trouvés.";
            res.status(200).json({ message, data: messages })
        })
};

exports.createMessage = (req, res, next) => {

    const textWithoutTag = req.body.content.replace(/<\/?[^>]+>/g,'');
    
    const msg = new Message({
        id: v4(),
        chatId: req.params.id,
        fromId: req.auth.userId,
        username: req.body.username,
        content: textWithoutTag
    });

    msg.save()
        .then(() => {
            const message = "Message créé.";
            res.status(201).json({ message });
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

};