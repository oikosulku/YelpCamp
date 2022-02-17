// require needed modules
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review');

const campgrounds = require('./routes/campground');
const reviews = require('./routes/reviews');



mongoose.connect('mongodb://localhost:27017/yelp-camp')
.then(()=> {
    console.log("MONGO CONNECTION OPEN");
})
.catch(err => {
    console.log("OH NO MONGO ERROR!!!")
    console.log(err)
})

// setup things...
app.engine('ejs' , ejsMate );
app.set('view engine' , 'ejs');
app.set('views', path.join(__dirname, '/views'));
// define public folder for css + images etc.
app.use(express.static(path.join(__dirname, '/public')));

// cookie expires after one week
// max age is
// hhtp only give exra layer security
const sessionConfig = {
    secret: 'thisshouldbebettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 7,
        maxAge:  1000 * 60 * 60 * 7,
    }
}
app.use(session(sessionConfig));
app.use(flash());

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
    next();
})


//
// ROUTES
//
app.use('/campgrounds' , campgrounds );
app.use('/campgrounds/:id/reviews' , reviews );


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