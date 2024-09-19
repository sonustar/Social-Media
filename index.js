const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const userModel = require('./model/user')
const postModel = require('./model/post')
const db = require('mongoose')
const jwt = require('jsonwebtoken')

const bcrypt = require('bcrypt')
const express = require('express')
const path = require('path')
const multer = require('multer')
const app = express()


app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static(path.resolve(__dirname,"public")))
app.set('view engine','ejs')

app.use((req,res,next)=>{
    next()
})

db.connect("mongodb+srv://Sonutsar:1234@cluster0.fuwi1x9.mongodb.net/").then(()=>{
    console.log("data base connected")
  }).catch((err)=>{
    console.log(err)
  })



  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/uploads')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }
  })
  
  const up = multer({ storage: storage })


  app.post('/update', up.single('avatar'), function (req, res, next) {
    // req.file is the `avatar` file
    console.log(req.file)
    // req.body will hold the text fields, if there were any
  })


app.get('/',isLoggedIn,async (req,res)=>{



    // const user = req.cookies
    // console.log(user)
    const {email} = req.user
    // // console.log(email) 
    
    const user = await userModel.findOne({email})
    console.log(user) 

    res.render("Home.ejs",{
        value : user.username
    })
    // res.send("Home page")
})






// Registration Page : 
app.get('/create',(req,res)=>{
    res.render("form")
})

// Profile page : 
app.get('/profile',isLoggedIn, async (req,res)=>{

    
    // Getting the user 
    const user = await userModel.findOne({email : req.user.email}).populate("posts")
    
   
    

    res.render('profile',
        {user}
    )
})



//form page se : data upload :- 
app.post('/upload',isLoggedIn, async (req,res)=>{

    
    // Getting the user 
    const user = await userModel.findOne({email : req.user.email})
    
    

    const {content} = req.body;
    // console.log(req.body)
    
    // Post creation 
    let post = await postModel.create({
        user:user._id,
        content
    })

    // console.log(post)

    // user->post 
    user.posts.push(post._id)
    // save kijiye user ka post 
    await user.save();

    res.redirect('/profile')

    


})

app.get('/like/:id',isLoggedIn,async(req,res)=>{
    
    // Like diye ki asche : 
    // const user = req.user.u
    const user = await userModel.findOne({_id:req.user.userid})
    // console.log(user)
    
    const post = await postModel.findOne({_id:req.params.id})
    
    // console.log(post);
    
    if(post.likes.indexOf(req.user.userid) === -1 ){
    post.likes.push(req.user.userid)
    }
    else {
        post.likes.splice(post.likes.indexOf(req.user.userid),1)
    }

    await post.save();

    // console.log(post)
    

    res.redirect('/profile')
})


app.get('/edit/:id',isLoggedIn, async (req,res)=>{

// Ki chai edit korbo : UpdateOne
// what data will come  : content 
// what work update the content field of the post Model :

   const post = await postModel.findOne({_id:req.params.id})
   

    res.render('edit',{post})
   

})

app.post('/update/:id',isLoggedIn, async (req,res)=>{

    // Ki chai edit korbo : UpdateOne
    // what data will come  : content 
    // what work update the content field of the post Model :
       
    //    console.log(req.body)
       
       const {content} = req.body
       

       const post = await postModel.findOneAndUpdate({_id:req.params.id},{content})
    
       res.redirect('/profile')
           
    
})








// Register the user : name , username , password , age , email: 
app.post('/register',async (req,res)=>{
    
    const {name,username,password,age,email} = req.body
    
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, async function(err, hash) {
            
            let user = await userModel.create({
                name,
                username,
                age,
                email,
                password:hash
            })
            
            const token = jwt.sign({email:email,userid:user._id},"secret")
            res.cookie("token",token)
            res.redirect('/')

        });
    });


})

// Login page : 
app.get('/login',(req,res)=>{
    res.render("login") 
})

// login route logic : 
app.post('/login',async(req,res)=>{
    
    //first check whether the user is present !! 
    const {email,password} = req.body
    

    let user =  await userModel.findOne({email})

    if(!user){
        res.redirect('/create')
       
    }else{

        bcrypt.compare(password, user.password, function(err, result) {
          if(result){
            const token = jwt.sign({email:email,userid:user._id},"secret")
            res.cookie("token",token)
            res.redirect('/')
          }else {
            res.render('login.ejs', { message: "Please enter valid email and password" });
          }
    })
  
  };
    
  });

//   Server is doing the work 
app.get('/logout',(req,res)=>{
    res.cookie("token","")
    res.redirect('/login')
})

// Protected route middleware : 

function isLoggedIn(req,res,next){
    
    
    if(req.cookies.token == "") return res.redirect('/login')
    else{
      
        let data = jwt.verify(req.cookies.token,"secret")
        // console.log(data)
        req.user =  data

        next();
    }

}

let responseC = 0 ;

function middleware(req,res,next){
    responseC++;
    console.log(responseC)
    next()
}




app.listen(3000,()=>{
    console.log("app is running !!")
})