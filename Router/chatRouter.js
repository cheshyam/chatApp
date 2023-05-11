const express = require('express');
const authController = require('../Controller/authController');
const chatController = require('../Controller/chatController');

const router =express.Router();


router.post('/accessChat',authController.protected,chatController.acccessChatBox);
router.get('/allChat',authController.protected,chatController.allChat);
router.post('/groupChat',authController.protected,chatController.groupChat);
router.patch('/updatedChat',authController.protected,chatController.upadatedChatName);
router.post('/addMembers',authController.protected,chatController.addMembersInGroup);
router.delete('/removeMember',authController.protected,chatController.removeMembers);


module.exports = router





// create chat
// All chat 
// Group Chat
// Rename chat
// Delete member
// add member