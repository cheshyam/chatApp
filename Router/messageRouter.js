const express = require('express');
const messageController = require('../Controller/messageController');
const authController = require('../Controller/authController');


const router = express.Router();


router.post('/send',authController.protected,messageController.sendMessage);
router.get('/allMessage/:chatId',authController.protected,messageController.allMessage);
router.delete('/deleteMessage',authController.protected,messageController.deleteMessage);

module.exports = router;