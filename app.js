if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// 
//require needed depencies
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");

//
// Require models
const User = require('./models/user');

//
// require utils & routes + other code
const ExpressError = require('./utils/ExpressError');

//const Campground = require('./models/campground');
//const Review = require('./models/review');

//
// Require ROUTES
const campgroundRoutes = require('./routes/campground');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');


/*
/* Connect to database
*/ 
mongoose.connect('mongodb://localhost:27017/yelp-camp')
.then(()=> {
    console.log("MONGO CONNECTION OPEN");
})
.catch(err => {
    console.log("OH NO MONGO ERROR!!!")
    console.log(err)
})

// setup things...
const app = express();

app.engine('ejs' , ejsMate );
app.set('view engine' , 'ejs');
app.set('views', path.join(__dirname, '/views'));
// define public folder for css + images etc.
app.use(express.static(path.join(__dirname, '/public')));

//sanitize post/get/ etc.
app.use(mongoSanitize());

// cookie expires after one week
// max age is
// hhtp only give exra layer security
const sessionConfig = {
    name: 'session',
    secret: 'thisshouldbebettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true, // need https
        expires: Date.now() + 1000 * 60 * 60 * 7,
        maxAge:  1000 * 60 * 60 * 7,
    }
}
app.use(session(sessionConfig));
app.use(flash());

/*
/* HELMET SECURITY POLICY CONFIG
*/
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/daggogqg6/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/daggogqg6/"
];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/daggogqg6/"
];
const fontSrcUrls = [ "https://res.cloudinary.com/daggogqg6/" ];
 
app.use(
    helmet({
        contentSecurityPolicy: {
            directives : {
                defaultSrc : [],
                connectSrc : [ "'self'", ...connectSrcUrls ],
                scriptSrc  : [ "'unsafe-inline'", "'self'", ...scriptSrcUrls ],
                styleSrc   : [ "'self'", "'unsafe-inline'", ...styleSrcUrls ],
                workerSrc  : [ "'self'", "blob:" ],
                objectSrc  : [],
                imgSrc     : [
                    "'self'",
                    "blob:",
                    "data:",
                    "https://res.cloudinary.com/daggogqg6/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                    "https://images.unsplash.com/"
                ],
                fontSrc    : [ "'self'", ...fontSrcUrls ],
                mediaSrc   : [ "https://res.cloudinary.com/daggogqg6/" ],
                childSrc   : [ "blob:" ]
            }
        },
        crossOriginEmbedderPolicy: false
    })
);

//set up passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// this need to parse "req.body"
app.use(express.urlencoded({extended: true}));

// needed for using "app.put"
app.use(methodOverride('_method'));


//
// middleware
// - set flash message 
// - set global variables
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
})


//
// ROUTES
//
app.use('/campgrounds' , campgroundRoutes );
app.use('/campgrounds/:id/reviews' , reviewRoutes );
app.use('/users' , userRoutes );

app.get('/', (req, res) => {
    res.render('home');
});



//
// handling errors
//
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if( !err.message) err.message = "Oh no something went wrong!";
    res.status(statusCode).render( 'error', {err} );
})


// fire up server...
app.listen(3000, () => {
    console.log("LISTENING ON PORT 3000");
}); 