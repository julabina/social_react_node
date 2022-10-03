const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comments');

const auth = require('../middleware/auth');

router.get('/findAll/:id', auth, commentController.findAllComments);
router.post('/new', auth, commentController.createComment);
router.get('/findResponse/:id', commentController.findResponse);
router.delete('/delete/:id', auth, commentController.deleteComment);
router.put('/edit/:id', auth, commentController.modifyComment);

module.exports = router;