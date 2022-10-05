const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friend');

const auth = require('../middleware/auth');

router.post('/query/:id', auth, friendController.createFriendQuery);
router.delete('/cancelQuery/:id', auth, friendController.cancelFriendQuery);
router.put('/acceptQuery/:id', auth, friendController.acceptFriendQuery);
router.delete('/cancelRelation/:id', auth, friendController.cancelRelation);
router.get('/isFriend/:id', auth, friendController.checkIfFriend);

module.exports = router;