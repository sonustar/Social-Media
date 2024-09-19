const mongoose = require('mongoose')
// const user = require('./user')


const postSchema = mongoose.Schema({

    user:{

        type : mongoose.Schema.Types.ObjectId,
        ref:'user'
    },

    date:{
        type: String,
        default:()=>{
            const datetime = new Date();
            return datetime.toISOString().split('T')[0]; 
        }
    },

    content : String ,
    likes : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'user'
        }
    ]





})

module.exports = mongoose.model('post',postSchema)