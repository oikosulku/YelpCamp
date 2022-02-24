const express = require('express');
const router = express.Router();
const {campgroundSchema} = require('../schemas.js');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const {isLoggedIn} = require('../middleware');

router.get('/', catchAsync(async(req, res, wait) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', {campgrounds});
}))


// pls note order...
// "new" must be before ":id" - otherwise express thinks "new" is an id

// Campground form validation...
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

//
// SHOW NEW CAMPGROUND FORM
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
})

//
// MAKE A NEW CAMPGROUND POST ACTION
router.post('/', isLoggedIn, validateCampground,catchAsync( async(req, res) => {
    //if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400 );
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Succesfully make a new campground');
    res.redirect(`/campgrounds/${campground._id}`);
}))

// EDIT CAMPGROUND
router.get('/:id/edit', catchAsync( async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    if(!campground) {
        req.flash('error', 'Cannot find that campground!');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground});
}))

// need method-override
// remember -> form action="/campgrounds/<%=campground._id%>?_method=PUT" method="POST"
router.put('/:id', validateCampground, catchAsync( async(req, res) => {
    const{ id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id , {...req.body.campground});
    req.flash('success', 'Succesfully updated campground!!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

// DELETE

// need method-override
// remember -> form action="/campgrounds/<%=campground._id%>?_method=DELETE" method="POST"
router.delete('/:id', catchAsync( async( req, res) => {
    const{ id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground deleted!');
    res.redirect('/campgrounds');
}))

// SHOW CAMPGROUND
router.get('/:id', catchAsync( async(req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if(!campground) {
        req.flash('error', 'Cannot find that campground!');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground});
}))

module.exports = router;