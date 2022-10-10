const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message');

const auth = require('../middleware/auth');

router.get('/getMessages/:id', auth, messageController.getMessages);
router.post('/create/:id', auth, messageController.createMessage);

module.exports = router;