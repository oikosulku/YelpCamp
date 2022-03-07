const Campground = require('../models/campground');
const { cloudinary } = require("../cloudinary");

module.exports.index = async(req, res, wait) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', {campgrounds});
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async(req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    // takes files request array - turns it into objects and saves objects to campground object
    // req.files need MULTER
    campground.images = req.files.map(f =>({ url: f.path, filename: f.filename}));
    await campground.save();
    console.log(campground);
    req.flash('success', 'Succesfully make a new campground');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async(req, res) => {
    // populate gives information from users and reviews databases 
    // bss review id and author id saved to campground database
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');

    if(!campground) {
        req.flash('error', 'Cannot find that campground!');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground});
}

module.exports.renderEditForm = async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    if(!campground) {
        req.flash('error', 'Cannot find that campground!');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground});
}

module.exports.updateCampground = async(req, res) => {
// PUT need method-override
// remember -> form action="/campgrounds/<%=campground._id%>?_method=PUT" method="POST"
    const{ id } = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id , {...req.body.campground});
    const imgs = req.files.map(f =>({ url: f.path, filename: f.filename}));
    campground.images.push(...imgs);
    await campground.save();

    if( req.body.deleteImages ) {
        // delete from Cloudinary
        for( let filename of req.body.deleteImages) {
           await cloudinary.uploader.destroy(filename);
        }
        // delete from MONGODB
        // pulls out images where filename is in deleteImages array
        await campground.updateOne({ $pull: { images: { filename: {$in: req.body.deleteImages } } } } );
        console.log(campground);
       
    }

    req.flash('success', 'Succesfully updated campground!!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async( req, res) => {
// DELETYE need method-override
// remember -> form action="/campgrounds/<%=campground._id%>?_method=DELETE" method="POST"
    const{ id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground deleted!');
    res.redirect('/campgrounds');
}