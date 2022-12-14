const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

router.post('/sign', userController.sign);
router.post('/login', userController.login);
router.put('/changeBaneer/:id', auth, multer, userController.changeBaneer);
router.put('/changeProfilImg/:id', auth, multer, userController.changeProfilImg);
router.put('/edit/:id', auth, userController.editNames);
router.put('/editEmail/:id', auth, userController.editEmail);
router.put('/editPwd/:id', auth, userController.editPwd);
router.get('/getUserInfos/:id', auth, userController.findUserInfos);
router.get('/isAdmin/:id', auth, userController.isAdmin);
router.delete('/delete/:id', auth, userController.deleteAccount);

module.exports = router;