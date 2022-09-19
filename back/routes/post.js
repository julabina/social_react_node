const express = require('express');
const router = express.Router();
const postController = require('../controllers/posts');

/* const auth = require('../middleware/auth'); */

router.get('/findAll', postController.findAllPosts);
router.post('/new', postController.createPost);

module.exports = router;