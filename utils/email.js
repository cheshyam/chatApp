const nodemailer = require('nodemailer');





const sendEmail =async(options) =>{
   try{
        const transports = await nodemailer.createTransport({
            host:'sandbox.smtp.mailtrap.io',
            port:2525,
            auth:{
                user:'e33afa444e9523',
                pass:'d1922e4c5a1f83' 
            },
        });
        
        

      const mailOptions = {
        from:'milan Togadiya <milantogadiya@123.gmail.com>',
        to:options.email,
        subject:options.subject,
        text:options.message
      };
      
      

      await transports.sendMail(mailOptions);
    }catch(err){
     console.log(err);
    };



};



module.exports = sendEmail;