const mongoose = require('mongoose');
const validator =require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        unique:true,
        required:[true,"please given maximum length of name"]
    },
    email:{
        type:String,
        unique:true,
        lowercase:true,
        required:true,
        validate:[validator.isEmail,'please insert correct email adderss']
    },
    image:{
        type:String,
        default:'default.jpg'
    },
    password:{
        type:String,
        unique:true,
        required:true,
        minilength:5,
        select:false
    },
    confirmPassword:{
        type:String,
        required:true,
        validate:{
            validator:function(el){
                return el === this.password;
            },
            message:'please insert same  correct password'
        }
    },
    active:{
        type:Boolean,
        select:false,
        default:true
    },
    role:{
        type:String,
        enum:['admin','user'],
        default:'user'         
    },
    passwordChangedAt : Date,
   passwordResetToken : String,
   passwordResetExpiers : Date,
  
    
},{
    timestamps:true
});

// create password encode using bcrypt
userSchema.pre('save',async function(next){
    // check your password for bcxypt
    if(!this.isModified('password')) return next();
  // bcypt password create
   this.password = await bcrypt.hash(this.password,12);
 // undefined this confirmPassword in display
   this.confirmPassword = undefined
 //  next step for show database
 next();
});

// check passowrd chhange time 
userSchema.pre('save',function(next){
    if(!this.isModified('password')||this.isNew) return next();
    
    this.passwordChangedAt =Date.now()-1000;

    next();
})



// two password compare using bcrypt 
userSchema.methods.comparePassword = async function(candidatePassword,userPassword){
    return await bcrypt.compare(candidatePassword,userPassword);
}

// change password time
userSchema.methods.changePasswordAfter = async function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changeTimeStamp = parseInt(
            this.passwordChangedAt.getTime()/100000,
            10
        );
        return JWTTimestamp<changeTimeStamp;
    }
    return false
};

// change password resetToken 
userSchema.methods.changePasswordResetToken = function(){
    // create token types
    const resetToken = crypto.randomBytes(52).toString('hex');
  
//   create token
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
  
  
    console.log({ resetToken},this.passwordResetToken);
  
  //  reset token time for expires  
    this.passwordResetExpiers= Date.now() +10 * 60 * 1000;
  
    return resetToken;
      
}
  




const User = mongoose.model('User',userSchema);


module.exports = User;