// user send message
// latest message
// content

const mongoose = require('mongoose');



const messageSchema = new mongoose.Schema({
   sender:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
   },
   sending:{
       type:String,
       trim:true
   },
   chat:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'Chat'
   },
   received:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User"
   }
   
},
{
   timestamps:true
});



messageSchema.pre('save',function(next){
   console.log('save succesfully');
   next();
})


const Message =mongoose.model('Message',messageSchema);

module.exports =Message;