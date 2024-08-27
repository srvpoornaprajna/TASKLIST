const Names=require('./models/name')
const Lists=require('./models/list')
module.exports.isLoggedin=(req,res,next)=>{
    if(req.isAuthenticated()){
        console.log('Authemticated')
      return next()
    }
    req.session.returnTo=req.url
        console.log('You must be logged in')
        req.flash('error','You must be logged in')
        return res.redirect('/login')
}
module.exports.isAuthor=async(req,res,next)=>{
    const {id}=req.params
    const name=await Names.findById(id)
    if(!name.author.equals(req.user_id))
    {
        return res.redirect('/todos')
    }
    next()
}