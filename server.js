var express=require('express');
var router=express();
var http=require('http').Server(router);
var io = require('socket.io')(http);
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var register = require('./models/register');
var login = require('./models/login');
var online = require('./models/online');var path = require('path');
var bodyParser = require('body-parser');
//var url  = require('url');
router.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
router.use(bodyParser.json())

 // render engine
router.set('views', path.join(__dirname, 'views'));
router.set('view engine', 'ejs');

http.listen(3000,function(){
    console.log("Node Server is setup and it is listening on 3000");    
});

// db connection


mongoose.connect('mongodb://localhost/mongodbchatapp')
    .then(() => console.log('connected to mongodb\n'))
    .catch((err) => console.log("err"+err) );


    /* session for client */
    var session = require('client-sessions');
    
    router.use(session({
        cookieName: 'session',
        secret: 'eg[isfd-8yF9-7w2315df{}+Ijsli;;to8',
        duration: 30 * 60 * 1000,
        activeDuration: 5 * 60 * 1000,
        httpOnly: true,
        secure: true,
        ephemeral: true
    }));

    router.all('/user/*', function(req, res, next) {

        if (req.session && req.session.user) {
            return next();
        } else 
        {
            return  res.render('login'); 
        }
    
    });
    
   
router.get('/user/home',function(req,res){
    register.findOne({"name":req.session.user.name},function(err,user){    
     if (!user) {
         // if the user isn't found in the DB, reset the session info and
         // redirect the user to the login page
         req.session.reset();
         return  res.render('login');

     } else {
         console.log("user authentication successful");
         // expose the user to the template
         req.user = user;
         // delete the password from the session
         req.session.user = user; //refresh the session value
         res.locals.user = user;
         // render the approve page
         return res.render('chat');
     }
 });

});



//end session

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('login');
  });

  /* registration */


router.get('/registration',function(req,res){
    res.render('registration');
  });

router.post('/register',function(req,res){ 
  
    var user={
        "name":req.body.name,       
        "password":req.body.password,
        "email":req.body.email,
    };
    console.log(user);    
      register.findOne({"name":req.body.name},function(err,doc){
        if(err){
            res.json(err); 
        }
        if(doc == null){
             register.create(user,function(err,doc){
                if(err) res.json(err);
                else{
                    res.render('login');
                }
            });
        }
        else
        {
            res.json({message:"user Exist"});
        }
    });    
});

var handle=null;
 // login api
router.post('/login',function(req,res){
  console.log(req.body.name);    
  handle=req.body.name;
      register.findOne({"name":req.body.name, "password":req.body.password},function(err,doc){
      if(err){
          res.send(err); 
      }
      if(doc==null){
          res.send("User has not registered");
      }
      else
      {   
        register.update({"status":"online"},function(err,doc){
            if(err) res.json(err);
            else{
                console.log("updated successfully")
               
            }
        });
        console.log("register success");
        req.session.user = doc;             
        return  res.redirect('/user/home')  
         
      }
      
});
});


/* session */
session = require("express-session")({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true
  }),
  sharedsession = require("express-socket.io-session");

  // Attach session
router.use(session);
 
// Share session with io sockets
 
io.use(sharedsession(session));
/* Socket io connection */










var private=null;
var users={};
var keys={};
var people={};

io.on( 'connection', function( socket ) {
  console.log( 'New user connected' );
  console.log("Connection :User is connected  "+handle);
  console.log("Socket ID  : " +socket.id);
  
  

  people[handle] =  socket.id;
  if(handle===null){

  }
  else{
  io.to(socket.id).emit('handle', handle);

  socket.on( 'disconnect', function() {
    console.log( 'User disconnected' );
    });

    socket.on("clientMsg", function (data) {
        //send the data to the current client requested/sent.
       console.log("friend is ----->"+data.friend);
        io.to(people[data.friend]).emit('serverMsg', data);
        io.to(socket.id).emit('serverMsg', data);
        //send the data to all the clients who are accessing the same site(localhost)
        //socket.broadcast.emit("serverMsg", data);         
        //socket.emit()
    });

        register.find({},function(err,doc){      // send all users to client side 
            if(err) throw err;
            var allusers=[];
            if(doc==null)
            {

            }
            else
            {     
            for(var i in doc){
                if(doc[i].name!=handle){               
                    console.log("the users are"+doc[i].name+"\t\t"+doc[i].email);
                    allusers.push(doc[i].name);
                }					
            }       
            io.to(socket.id).emit('friend_list', allusers);
          }
         

        });

        socket.on("login", function(userdata) {
            console.log("--> login"+userdata);
            socket.handshake.session.userdata = userdata;
            socket.handshake.session.save();
        });
        socket.on("logout", function(userdata) {
            if (socket.handshake.session.userdata) {
                delete socket.handshake.session.userdata;
                socket.handshake.session.save();
            }
        });
    }
    socket.on('disconnect',function(data)
   {
    register.update({"status":"offline"},function(err,doc){
        if(err) res.json(err);
        else{
            console.log("updated successfully")
           
        }
    });
});

    });   // socket end

   

module.exports = router;
