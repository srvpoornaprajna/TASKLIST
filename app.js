if(process.env.NODE_ENV!=='production')
{
    require('dotenv').config()
}
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const path = require('path')
const ejsMate = require('ejs-mate')
const Name = require('./models/name')
const List = require('./models/list')
const Completed = require('./models/completed')
const methodOverride = require('method-override')
const session = require('express-session')
const passport = require('passport')
const mongo_sanitize=require('express-mongo-sanitize')
const user1 = require('./models/users')
const localStrategy = require('passport-local')
const { isLoggedin } = require('./middleware')
const users = require('./controllers/users')
const flash = require('connect-flash')
const db_url = process.env.DB_URL||'mongodb://localhost:27017/todo-list'
// ||'mongodb://localhost:27017/todo-list'
mongoose.connect(db_url, { useNewUrlParser: true, useUnifiedTopology: true  })
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error!'))
db.once("open", () => {
    console.log('Datbase connected')
})
const secret = process.env.SECRET||'thisissecret'
const MongoDbStore= require('connect-mongo')
const { truncateSync } = require('fs')
const { request } = require('http')

app.engine('ejs', ejsMate)
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded())
app.use(methodOverride('_method'))
app.use(mongo_sanitize())
const store=new MongoDbStore({
    mongoUrl:db_url,
    secret,
    touchAfter:24*60*60
})
// const store = new MongoDbStore({
//     mongoUrl:db_url,
//     secret,
//     touchAfter: 24 * 60 * 60
// })
store.on('error', function(e) {
    console.log(e)
})
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrategy(user1.authenticate()))
passport.serializeUser(user1.serializeUser())
passport.deserializeUser(user1.deserializeUser())
app.use((req, res, next) => {
        res.locals.currentUser = req.user
        res.locals.success = req.flash('success')
        res.locals.error = req.flash('error')
        next()
    })
    // app.use(express.json())
    // app.get('/fakeuser',async(req,res)=>{
    //     const user=new user1({email:'vadi@gmail.com',username:'vadii'})
    //   const newuser= await user1.register(user,'bike')
    //   res.send(newuser)
    // })
    app.get('/register',(req,res)=>{
        res.render('register')
    })
    app.post('/register',async(req,res,next)=>{
        try{
        const {email,username,password}=req.body
       const user= new user1({email,username})
       const registeredUser=await user1.register(user,password)
      
       req.logIn(registeredUser,err=>{
           if(err)
           {
               return next(err)
           }
       })
       res.redirect('/todos')
        }
        catch(error){
            // console.log(e.message)
            res.redirect('/register')
        }
    })
    app.get('/login',(req,res)=>{
        res.render('login')
    })
    app.post('/login',passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),(req,res)=>{
        req.flash('success','Welcome back to todo')
        res.redirect('/todos')
    })
    app.get('/logout',(req,res)=>{
        req.logOut()
        res.redirect('/')
    })
app.get('/', (req, res) => {
    res.render('home')
})
app.get('/todos', async(req, res) => {
   
    if(!req.isAuthenticated()){
        req.flash('You must be signed in')
      return  res.redirect('/login')
    }
    const names = await Name.find({user:req.user._id}).populate('lists').populate('user')
    res.render('todos', { names })
})
app.post('/todos', async(req, res) => {
    const name = new Name(req.body)
    name.user=req.user._id
    // console.log(name)
    
    await name.save();
    
    res.redirect('/todos')
})
app.get('/completed', async(req, res) => {
    if(!req.isAuthenticated()){
        req.flash('You must be signed in')
        res.redirect('/login')
    }
    const completedTasks = await Completed.find({author:req.user._id}).populate('author')
    console.log(completedTasks)
    res.render('completedTasks', { completedTasks })
})
app.delete('/completed/:id',async(req,res)=>{
    await Completed.findByIdAndDelete({_id:req.params.id,user:req.user._id})
    res.redirect('/completed')
})
app.post('/todos/:id/lists', async(req, res) => {
    const name = await Name.findById(req.params.id)
    const work = new List(req.body)
    work.name = req.params.id
    await work.save()
    await name.lists.push(work)
    await name.save()
    res.redirect(`/todos`)
})
app.post('/todos/:id', async(req, res) => {
    const { todo, lists } = await Name.findById(req.params.id)
    const completed2 = new Completed({ todo, lists })
    completed2.author=req.user._id
    await completed2.save()
    const deleted = await Name.findByIdAndDelete(req.params.id)
    res.redirect('/todos')
})
app.delete('/todos/:id', async(req, res) => {
    const deleted = await Name.findByIdAndDelete(req.params.id)
    res.redirect('/todos')
})
app.delete('/todos/:id/lists', async(req, res) => {
    const deleted = await List.findByIdAndDelete(req.params.id).populate('name')
    res.redirect(`/todos`)
})
app.use('*', (req, res) => {
    res.redirect('/todos')
})
const port=process.env.PORT||3000
app.listen(port, () => {
    console.log('Listening to port 3000')
})