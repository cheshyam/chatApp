const Message = require('../Model/messageModel');
const User = require('../Model/userModel');
const Chat = require('../Model/chatModel');
const catchAsync = require('../utils/catchAsync');




exports.sendMessage = catchAsync(async(req,res,next)=>{
  const { sending , chatId, receivedId  } = req.body;

  if(!sending||!chatId){
     return next(new Error('please check your input message and chatId',401));
   }
 
 var messageBox = {
    sender :req.user._id,
    sending : sending,
    chat:chatId,
    received:receivedId,
 };


 try{
      var message = await Message.create(messageBox);
     message = await message.populate("sender", "name image")
     message = await message.populate("chat")
     message = await User.populate(message, {
       path: "chat.users",
       select: "name image email",
     });
     message = await User.populate(message,{
      path:'received.users',
      select:'name image email'
     })
            
    
     await Chat.findByIdAndUpdate(req.body.chatId,{
        latestMessage:message,
     });
       
  
     res.status(201).json({
        status:"success",
        data:{
          message
        }
      });
    }catch(err){
     console.log(err);
    }
});



exports.allMessage =  catchAsync(async(req,res,next)=>{

const message = await Message.find({chat:req.params.chatId})
.populate("sender", "name image email" ).
populate("Chat");

res.status(201).json({
  status:"success",
  results:message.length,
  data:{
    message
  }
})

if(!message){
  return next( new Error("please check your chat id",401))
}


});


