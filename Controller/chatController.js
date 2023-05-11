const { json } = require('express');
const Chat = require('../Model/chatModel');
const User = require('../Model/userModel');
const catchAsync = require('../utils/catchAsync');      


exports.acccessChatBox = catchAsync(async(req,res,next)=>{
 //1. user id  
    const { userId } = req.body;
 // 2.check user
    if(!userId){
        return next(new Error('please provided real user id',401));
    }
 //  3. create chat  using user id
    var isChatAdmin = await Chat.find({
        isGroupChat: false,
        $and: [
          { users: { $elemMatch: { $eq: req.user._id } } },
          { users: { $elemMatch: { $eq: userId } } },
        ],
    }).populate("users", "-password")
      .populate("latestMessage");
    
    isChatAdmin = await User.populate(isChatAdmin, {
        path: "latestMessage.sender",
        select: "name image email",
    });


  if(isChatAdmin.length > 0){
     res.send(isChatAdmin[0]);
    }else{
        var chatData = {
            chatName:'sender',
            isGroupChat:false,
            users:[req.user._id,userId]
        }
    }
   try{
    // create the chat box
    const createChat = await Chat.create(chatData);
    // chat with user details  
    const detailsBox = await Chat.find({id:createChat._id}).populate('users','-password')
    //   status for created chat 
    res.status(201).json({
        status:'success',
        data:{
            chat:detailsBox
        }
    })

   }catch(err){
       res.send(401).json({
            status:'error',
            message:'please can you check filed your data'
       })
   }
});


exports.allChat = catchAsync(async(req,res,next)=>{
  try{
    //  user id to all ckat showing
        Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
        .populate('users',' -password')
        .populate('groupAdmin','-password')    
        .populate('latestMessage')
          .sort({updatedAt :-1})
        .then(async(results)=>{
            results = await User.populate(results, {
                path: "latestMessage.sender",
                select: "name image email",
            });
            res.status(201).json({
                results:results.length,
                data:{
                    results
               }
            });
        });
    } catch(err){
        console.log(err);
    }
});


exports.groupChat = catchAsync(async(req,res,next)=>{
 //  check to this user and name are porvided
 if(!req.body.users || !req.body.name){
     return next(new Error('please check your name and user id',401));
    }
 //   user inserted into array,stringfiy types
 var users= JSON.parse(req.body.users);

 //   less than 2 user inserted  error showing
 if(users.length < 2){
     return next(new Error('please provided 2 users in group chat',401));
    }
 //  user push
 users.push(req.user);

   try{
     //   create group chat  with group types
     const groupChat =  await Chat.create({
        chatName:req.body.name,
        isGroupChat:true,
        users:users,
        groupAdmin:req.user,
     });
     
     //  group create show to this display populate
     const allgroupChat = await Chat.findOne({_id: groupChat._id})
     .populate("users","-password")
     .populate("groupAdmin","-password");    
      
     //  responsed to showing
     res.status(201).json({
        status:"success",
        data:{
            allgroupChat
        }
     })
    }catch(err){
     console.log(err);
    }

});


exports.upadatedChatName = catchAsync(async(req,res,next)=>{
 // enter the chatId and chatName
 const { chatId, chatName  } = req.body

 console.log(chatId);
 console.log(chatName);
 // update the chat by using chatid and chatName
 const updated = await Chat.findByIdAndUpdate(chatId,
    {
     chatName,        /* chat name defined which name is rename  */
    },
    {
     new:true,
    } 
 ) .populate("users","-password")
 .populate("groupAdmin","-password");

 // checked the updated
 if(!updated){
     return next( new Error('please check your chatID and chatName',401));
    };

 res.status(201).json({
     status:"success",
     data:{
        chat:updated
     }
  });

});

exports.addMembersInGroup = catchAsync(async(req,res,next)=>{
 // enter the chatud and userid
 const { chatId, userId} = req.body;
 // updated and add members
 const addMembers = await Chat.findByIdAndUpdate(chatId,
     {
      $push:{$users:userId},
     },
     {
       new:true,
     }
    ).populate("users","-password")
    .populate("groupAdmin","-password");
//  check the members
    if(!addMembers){
        return next( new Error('please check your chatId and userId',401));
    }
    
    res.status(201).json({
        status:"success",
        data:{
           chat:addMembers
        }
    });

});

exports.removeMembers = catchAsync(async(req,res,next)=>{
    // enter the chatId and userId
    const { chatId, userId} = req.body;
//  remove the members
 const deleteMember = await Chat.findByIdAndUpdate(chatId,
     {
      $pull:{$users:userId},
     },
     {
       new:true,
     }
    ).populate("users","-password")
    .populate("groupAdmin","-password");
//  check members
    if(!deleteMember){
        return next( new Error('please check your chatId and userId',401));
    }
    
    res.status(201).json({
        status:"success",
        data:{
           chat:deleteMember
        }
    });

});
