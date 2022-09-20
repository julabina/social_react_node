const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

const auth = require('../middleware/auth');

router.post('/sign', userController.sign);
router.post('/login', userController.login);

module.exports = router;