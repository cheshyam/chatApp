const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User =require('../Model/userModel');
const catchAsync =require('../utils/catchAsync');
const sendEmail = require('../utils/email');


const signToken = id =>{
    return jwt.sign({ id },process.env.JWT_SECRETE,{
    expiresIn:process.env.EXPIREIN
})};


exports.signup = catchAsync(async(req,res)=>{
    const user =await User.create(req.body)
    const token = await signToken(user._id) 


    // const token = await jwt.sign({id:user._id},process.env.SECRETE,{
    //     expiresIn:process.env.EXPIREIN
    // });
    res.status(201).json({
        status:'success',
        token,
        data:{
            users:user
        }
    })
});


exports.login = catchAsync(async(req,res,next)=>{
  const {email,password} = req.body;
 
  if(!email||!password){
     return next(new Error('please provided real email  and password '))
   };
 
  const user = await User.findOne({email}).select('+password');


  if(!user||!(await user.comparePassword (password,user.password))){
        return next(new Error('please check your email and password',401));
   }

   const token = await  signToken(user._id);

   
   
  res.status(201).json({
        status:'success',
        token,
        data:{
            users:user
        }
    });



});



exports.protected = catchAsync(async(req,res,next)=>{
    let token;
    if(req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')  
    ){
        token = req.headers.authorization.split(' ')[1]
    }

    if(!token){
        return next(new Error('please check your token vaild or expires',401))
    };


    const decode = await promisify(jwt.verify)(token,process.env.JWT_SECRETE);

    if(!decode){
        return next();
    };

    const currentUser = await User.findById(decode.id);

    if(!currentUser){
        return next('please check your token is experies',401)
    };

    req.user = currentUser;

    next();
});


exports.restrictiTo = (...roles)=>{
  
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(new Error('Admin was accessed a page',401))
        }
        next();
    }
};


exports.forgotPassword = catchAsync(async(req,res,next)=>{
const user = await User.findOne({email:req.body.email});

if(!user){
    return next(new Error('please check your email adderss to signup ',401));
}

const resetToken =user.changePasswordResetToken();
await user.save({validateBeforeSave:false});


const resetURL =`${req.protocol}://${req.get('host')}/api/v1/user/resetPassword/${resetToken}`;
const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`



    try{
        await sendEmail({
            email:user.email,
            subject:'forgot password for 10 minutes to wait for proceess',
            message
        });
        res.status(201).json({
            status:'success',
            message:'send token successfully for Gmail'
        })
    }catch(err){
        user.passwordResetToken=undefined,
        user.passwordResetExpiers=undefined
       await user.save({validateBeforeSave:false});
    }
});

exports.resetPassword = catchAsync(async(req,res,next)=>{

 const hasedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

 const user = await User.findOne({
    passwordResetToken:hasedToken,
    passwordResetExpiers: {$gt:Date.now()}
 });

 if(!user){
    return next(new Error('please user check your token or expires',401));
 }

  user.password = req.body.password,
  user.confirmPassword= req.body.confirmPassword,
  user.passwordResetToken = undefined;
  user.passwordResetExpiers=undefined;
  await user.save();

  const token = signToken(user._id);

    res.status(201).json({
        status:'success',
        token,
       data:{
         users:user
       }
    })
});



exports.changePassword = catchAsync(async(req,res,next)=>{
    const user = await User.findById(req.user.id).select('+password')
    if (!await user.comparePassword(req.body.passwordCurrent, user.password)){
        return next(new Error('your vaild for current password',400))
      };
   
      user.password=req.body.password;
      user.confirmPassword=req.body.confirmPassword;
    await user.save();



    const token =signToken(user._id);
    res.status(201).json({
        status:'success',
        token,
        data:{
         users:user
        }
    });
});

exports.logOut = catchAsync(async(req,res,next)=>{

  
    res.cookie('jwt','loggedOut',{
        expires:new Date(Date.now() + 10 * 1000),
        httpOnly:true
    });
    res.status(200).json({ status: 'success' });
});