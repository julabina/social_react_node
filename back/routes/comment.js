const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comments');

const auth = require('../middleware/auth');

router.get('/findAll/:id', auth, commentController.findAllComments);
router.post('/new', auth, commentController.createComment);
router.get('/findResponse/:id', commentController.findResponse);

module.exports = router;