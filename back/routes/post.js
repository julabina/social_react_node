const express = require('express');
const router = express.Router();
const postController = require('../controllers/posts');

const multer = require('../middleware/multer-config');
const auth = require('../middleware/auth');

router.get('/findAll', postController.findAllPosts);
router.get('/findAllForUser/:id', postController.findAllPostForUser);
router.post('/new', auth, multer, postController.createPost);
router.delete('/delete/:id', auth, postController.deletePost);
router.put('/modify/:id', auth, multer, postController.modifyPost);
router.put('/deleteImg/:id', auth, multer, postController.deleteCurrentImg);
router.get('/picture/:id', auth, postController.getPicture);
router.get('/addLike/:id', auth, postController.handleLike);

module.exports = router;