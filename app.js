const express = require('express');
const path = require('path')
const helmet = require('helmet');
const userRouter = require('./Router/userRouter');
const messageRouter = require('./Router/messageRouter');
const chatRouter =require('./Router/chatRouter');

const app = express();

app.use(express.json());
app.use(helmet());



app.get('/',(req,res)=>{
    res.send("hello chartBox Application ");
});

app.use('/api/v1/user',userRouter);
app.use('/api/v1/chat',chatRouter);
app.use('/api/v1/message',messageRouter);


app.use('*',(req,res)=>{
    res.status(401).json({
        status:'error',
        message:'error',
    })
})

module.exports = app;