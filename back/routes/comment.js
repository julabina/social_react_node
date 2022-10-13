const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comments');

const auth = require('../middleware/auth');

router.get('/findAll/:id', auth, commentController.findAllComments);
router.post('/new', auth, commentController.createComment);
router.get('/findResponse/:id', auth, commentController.findResponse);
router.delete('/delete/:id', auth, commentController.deleteComment);
router.put('/edit/:id', auth, commentController.modifyComment);
router.get('/addLike/:id', auth, commentController.handleLike);

module.exports = router;