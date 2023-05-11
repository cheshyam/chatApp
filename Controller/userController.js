const User = require("../Model/userModel");
const catchAsync = require("../utils/catchAsync");

exports.getAllUser = catchAsync(async(req,res)=>{

 const classification = req.query.search? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const user = await User.find(classification).find({ _id: { $ne: req.user._id } });
  
    res.status(201).json({
        status:'success',
        results:user.length,
        data:{
            users:user
        }
    })
});


exports.getUser = catchAsync(async(req,res)=>{
   
    const user = await User.findById(req.params.id)
   
    if(!user){ 
        res.status(401).json({
            status:'error',
            message:'can check for user id '
        })

    }else{
        res.status(201).json({
            status:'success',
            data:{
                users:user
            }
        })
    }
   

});

exports.createUser = catchAsync(async(req,res)=>{
 
    const createUser = await User.create(req.body);


    if(!createUser)
    {
        res.status(401).json({
         status:'error',
         message:'can check for all fields '
        })
    }else
    { 
        res.status(201).json({
          status:'success',
          data:{
             users:createUser
        }
     })
    }
    
 
});

exports.updateUser = catchAsync(async(req,res)=>{
    
    const { userId, name,email } = req.body;

   const user = await User.findByIdAndUpdate(userId,
    {
     name,
     email,
   },{
    new:true,
   })

 if(!user){
    res.status(401).json({
        status:"error",
        message:'please check your details and full fields all details'
    })
 }else{
        res.status(201).json({
            status:'success',
            data:{
                users:user
            }
        });
    } 
});

exports.deleteUser = catchAsync(async(req,res)=>{

   const users =  await User.findByIdAndDelete(req.params.id)
   
   if(!users){
        res.status(401).json({
            status:"error",
            message:"please check your userId"
        })
   }else{
        res.status(201).json({
            status:'success',
            message: "User Retrieve successfully"
        })
   }
});



exports.userUpdateProfile= catchAsync(async(req,res,next)=>{
 
    const user = await User.findById(req.user.id,{
      name:req.body.name,
      email:req.body.email,
     },{
      new:true,
      runValidators:true
     });
    
    const token =signToken(user._id);
     res.status(201).json({
         status:'success',
         token,
         data:{
           users:user
         }
    });
});



