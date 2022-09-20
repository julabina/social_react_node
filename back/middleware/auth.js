const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodeToken = jwt.verify(token, '' + process.env.REACT_APP_JWT_PRIVATE_KEY + '');
        const userId = decodeToken.userId;

        req.auth = { userId : userId };

        if(req.body.userId && req.body.userId !== userId) {
            throw 'User id non valable.';
        } else {
            next();
        }

    } catch (error) {
        res.status(401).json({ message: 'Requête non authentifié.' });
    }

};