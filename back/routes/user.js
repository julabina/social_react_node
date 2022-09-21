const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

const auth = require('../middleware/auth');

router.post('/sign', userController.sign);
router.post('/login', userController.login);
router.get('/getUserInfos/:id', userController.findUserInfos);

module.exports = router;