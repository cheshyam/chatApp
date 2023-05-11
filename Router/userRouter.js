const express = require('express');
const userController = require('../Controller/userController');
const authController = require('../Controller/authController');
const router = express.Router();


router.post('/signup',authController.signup);
router.post ('/login',authController.login);
router.post('/forgotPassword',authController.forgotPassword);
router.patch('/resetPassword/:token',authController.resetPassword);
router.patch('/changePassword',authController.protected,authController.changePassword);
router.get('/userProfile/:id',userController.userUpdateProfile);
router.get ('/logOut',authController.protected,authController.logOut);

router.route('/')
.get(authController.protected,authController.restrictiTo('admin'),userController.getAllUser)
.post(authController.protected,userController.createUser)
.patch(authController.protected,userController.updateUser)


router.route('/:id')
.get(authController.protected,userController.getUser)
.delete(authController.protected,userController.deleteUser);


module.exports =router;

