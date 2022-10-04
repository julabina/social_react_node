const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

router.post('/sign', userController.sign);
router.post('/login', userController.login);
router.put('/changeBaneer/:id', auth, multer, userController.changeBaneer);
router.put('/edit/:id', auth, userController.editNames);
router.put('/editEmail/:id', auth, userController.editEmail);
router.get('/getUserInfos/:id', userController.findUserInfos);
router.get('/isAdmin/:id', auth, userController.isAdmin);

module.exports = router;