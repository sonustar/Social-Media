
const mongoose = require('mongoose')


const UserSchema = mongoose.Schema({
    
    name:String,
    username:String,
    age:Number,
    email:String,
    password:String,
    posts :[{ 
        type: mongoose.Schema.Types.ObjectId ,
          ref:'post'
    }]



})

module.exports = mongoose.model('user',UserSchema)