const express = require('express');
const router = express.Router();
const postController = require('../controllers/posts');

const multer = require('../middleware/multer-config');
const auth = require('../middleware/auth');

router.get('/findAll', postController.findAllPosts);
router.post('/new', auth, multer, postController.createPost);

module.exports = router;