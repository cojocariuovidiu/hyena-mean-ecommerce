// install express & dependancies
var ejs             = require('ejs'),
    faker           = require('faker'),
    express         = require('express'),
    passport        = require('passport'),
    mongoose        = require('mongoose'),
    seedDB          = require('./seed.js'),
    bodyParser      = require('body-parser'),
    User            = require('./models/user'),
    LocalStrategy   = require('passport-local'),
    Product         = require('./models/product'),
    methodOverride  = require ('method-override'),
    setUserGroup    = require('./setUserGroup.js');


mongoose.connect(process.env.DATABASEURL);


//////////////////////////////////////////////////////////////////
////////////Initialize express
//////////////////////////////////////////////////////////////
var app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.bodyParser());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(methodOverride('_method'));

// uncomment this to clean and seed the database with products
//seedDB();

// uncomment this to set a users userGroup 
//setUserGroup('desired users id string', 'desired userGroup string');

//////////////////////////////////////////////////////////////////
////////////Passport configuration
//////////////////////////////////////////////////////////////

app.use(require('express-session')({
    secret: process.env.OURSECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});



//////////////////////////////////////////////////////////////////
////////////Auth routes
//////////////////////////////////////////////////////////////

// show register form --- handled by angular
// app.get('/register', function(req, res){
//   res.render('register'); 
// });

// registration logic
app.post('/register', function(req, res){
    var newUser = new User({username: req.body.username, userInfo: { deleteme : 'placeholder value' }});
    User.register(newUser, req.body.password, function(err, user){
        if (err){
            console.log(err);
            res.redirect('/#/register-taken');
        } else {
        passport.authenticate('local')(req, res, function(){
            res.redirect('/');
            console.log('register success');
        });
        }
    });

})


// show login form --- handled by angular 
// app.get('/login', function(req,res){
//     res.render('login');
// });


// login logic
app.post('/login', passport.authenticate('local',
    {
        successRedirect: '/',
        failureRedirect: '/#/login'
    }), function(req, res){
    
})

// logout route
app.get('/logout', function(req, res) {
   console.log('user logging out: username: ' + req.user.username + ' id: ' + req.user._id);
   req.logout();
   res.redirect('/');
});


// Auth logic 
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        var fillerObj = {
            errorMessage : 'You\'re not logged in friend.',
            notAuth : true
        };
    res.send(fillerObj);
    }

}

function isAdmin(req, res, next){
        User.findById(req.user._id, function(err, user) {
        if (err){
            console.log('profile info route error : ' + err);
        }else {
            if (user.userGroup === 'admin'){
                return next();
            } else {
                res.send ('not an admin');
            }
        }

    }); 
    
}

//////////////////////////////////////////////////////////////////
////////////Profile routes
//////////////////////////////////////////////////////////////
//user profile get route
app.get('/profile',isLoggedIn, function(req, res){
   console.log(req.user);
   console.log('you hit profile');
    
    User.findById(req.user._id, function(err, user) {
        if (err){
            console.log('profile info route error : ' + err);
        }else {
            res.send(user.userInfo); 
        }

    });   

});

// user profile update route 
app.put('/profile',isLoggedIn, function(req, res){

    //-------------------------------------- MONGOOSE UPDATE USER
    //Update data of currently logged in user
    User.findByIdAndUpdate(req.user._id, {
        // SET UP userInfo OBJECT BASED ON REQUEST DATA
        $set: {
            userInfo : {
                fname: req.body.fname,
                lname: req.body.lname,
                address: req.body.address,
                country: req.body.country,
                city: req.body.city,
                postal : req.body.postalinput
            }
        }},
        // TELL MONGOOSE TO SHOW NEW DOCUMENT WHEN FINISHED
        {new : true },
        // CALLBACK 
        function(err, updatedUser) {
        if (err){
            console.log('profile info route error : ' + err);
        }else {
            console.log(req.body)
            console.log('profile updated to ' + updatedUser); 
            res.redirect('/#/profile');
        }

    }); 
    //------------------------------------------- END MONGOOSE UPDATE USER

});

// DESTROY USER ACCOUNT ROUTE
app.delete('/profile', isLoggedIn, function(req, res){
    User.findByIdAndRemove(req.user._id, function(err){
       if(err){
            res.send(err);
       } else {
           res.send('sucessfully deleted profile');
       }
    });
});
//////////////////////////////////////////////////////////////////
////////////Other routes
//////////////////////////////////////////////////////////////

//  '/' => render index view
app.get('/', function(req, res){
   res.sendfile('./public/app/index.htm'); // load the single view file (angular will handle the page changes on the front-end)
});

// debug user
app.get('/user', function(req, res){
   if (!req.user){
   res.send();
   } else {
   res.send(req.user.username);  
   }
   
});

// retrieve all products
app.get('/products', function(req, res) {
    Product.find({}, function(err, products) {
        if (err){
            console.log('products route error : ' + err);
        }else {
            res.send(products); 
        }

    });
});

// alternative product details route -- handled by angular using /products
// app.get('/details/:id', function(req, res) {
//     console.log(req.params.id);
//     Product.findById(req.params.id, function(err, theProduct) {
//         if (err){
//             console.log('product route error : ' + err);
//         }else {
//             console.log(theProduct + ' product');
//             res.send(theProduct); 
//         }

//     });
// });

// AUTH TESTING
// app.get('/secret',isLoggedIn, function(req, res){
//     // use this route to debug auth 
//   console.log('you hit secret');
//   res.send('secret data');
// });

// app.get('/admintest', isLoggedIn, isAdmin, function(req, res){
//     res.send('account passed admin auth test');
// });


// Catch all
app.get('*', function(req, res){
   res.send('The path doesn\'t exist');
});



//////////////////////////////////////////////////////////////////
//////////// Tell Express to listen for requests (start server)
//////////////////////////////////////////////////////////////

app.listen(process.env.PORT, process.env.IP, function(){
    console.log('server has started');
}); 