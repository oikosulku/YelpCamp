const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');

// Image Upload (to cloudinary)
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Campground = require('../models/campground');
const campground = require('../controllers/campgrounds');

// pls note routes order...
// "/new"
// must be before EDIT /:id/edit or UPDATE/:id routes
// otherwise express thinks "new" is an id
router.route('/')
    .get(catchAsync(campground.index))  // CAMPGROUND INDEX
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync( campground.createCampground ))  // POST CAMPGROUND

// SHOW NEW CAMPGROUND FORM
router.get('/new', isLoggedIn, campground.renderNewForm );

router.route('/:id')
    .get( catchAsync(campground.showCampground)) // SHOW CAMPGROUND
    .get(isLoggedIn, isAuthor, catchAsync( campground.renderEditForm))
    .put( isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync( campground.updateCampground))
    .delete( isLoggedIn, isAuthor, catchAsync( campground.deleteCampground))


// RENDER EDIT CAMPGROUND
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync( campground.renderEditForm));


module.exports = router;