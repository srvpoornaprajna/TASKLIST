const mongoose=require('mongoose')
const List=require('./list')
const User=require('./users')
const nameSchema=new mongoose.Schema({
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
          user:{
              type:mongoose.Schema.Types.ObjectId,
              ref:'User'
          }
})
nameSchema.post('findOneAndDelete',async function(name){
    if(name.lists.length){
        const result=await List.deleteMany({_id:{$in:name.lists}})
    }
})
module.exports=new mongoose.model('Name',nameSchema)