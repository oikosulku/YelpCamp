const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');

const Campground = require('../models/campground');

router.get('/', catchAsync(async(req, res, wait) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', {campgrounds});
}))


// pls note order...
// "new" must be before ":id" - otherwise express thinks "new" is an id


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
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Succesfully make a new campground');
    res.redirect(`/campgrounds/${campground._id}`);
}))

// EDIT CAMPGROUND
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync( async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    if(!campground) {
        req.flash('error', 'Cannot find that campground!');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground});
}))

// UPDATE
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync( async(req, res) => {
// PUT need method-override
// remember -> form action="/campgrounds/<%=campground._id%>?_method=PUT" method="POST"
    const{ id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id , {...req.body.campground});
    req.flash('success', 'Succesfully updated campground!!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

// DELETE
router.delete('/:id', isLoggedIn, isAuthor, catchAsync( async( req, res) => {
// DELETYE need method-override
// remember -> form action="/campgrounds/<%=campground._id%>?_method=DELETE" method="POST"
    const{ id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground deleted!');
    res.redirect('/campgrounds');
}))

// SHOW CAMPGROUND
router.get('/:id', catchAsync( async(req, res) => {
    
    // populate gives information from users and reviews databases 
    // bss review id and author id saved to campground database

    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    console.log(campground.reviews);
    //const campground = await Campground.findById(req.params.id).populate('reviews').populate('author');
    if(!campground) {
        req.flash('error', 'Cannot find that campground!');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground});
}))

module.exports = router;