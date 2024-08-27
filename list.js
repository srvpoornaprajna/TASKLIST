const mongoose =require('mongoose')
const Name=require('./name')
const listSchema=new mongoose.Schema({
    work:{type:String,required:true},
    name:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Name'
    }
})
const List=new mongoose.model('List',listSchema)
module.exports=List
