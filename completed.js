const mongoose=require('mongoose')
const List=require('./list')
const completedSchema=new mongoose.Schema({
    todo:{
        type:String,
        required:true
    },
    lists:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:'List'
        }
        ],
        author:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
})
module.exports=new mongoose.model('completedTask',completedSchema)