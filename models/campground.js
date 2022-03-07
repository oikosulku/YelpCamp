//const { func } = require('joi');
const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
})

// cloudinary img url
// https://res.cloudinary.com/daggogqg6/image/upload/v1646635806/YelpCamp/gtpize0b06yceatik6hf.jpg

// get thumbnail out with adding "w_200" to url
// https://res.cloudinary.com/daggogqg6/image/upload/w_200/v1646635806/YelpCamp/gtpize0b06yceatik6hf.jpg

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
})

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }   
    ]
});



CampgroundSchema.post('findOneAndDelete' , async function(doc) {
    if(doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
    console.log(doc)
})

module.exports = mongoose.model('Campground', CampgroundSchema);

