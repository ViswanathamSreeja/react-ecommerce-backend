const mongoose = require("mongoose")

const { ObjectId } = mongoose.Schema

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32,
        text: true
    },
    slug: {
        type: String,
        unique: true,
        lowerCase: true,
        index: true
    },
    description: {
        type: String,
        required: true,
        maxlength: 2000,
        text: true
    },
    price: {
        type: Number,
        required: true,
        trim: true,
        maxlength: 32
    },
    category: {
        type: ObjectId,
        ref: "Category"
    },

    subs: [{
        type: ObjectId,
        ref: "Sub"
    }
    ],
    quantity: {
        type: Number,

    },
    sold: {
        type: Number,
        default: true
    },
    images: {
        type: Array
    },
    shipping: {
        type: String,
        enum: ["Yes", "No"]
    },
    color: {
        type: String,
        enum: ["Red", "Brown", "Black", "White", "Green", "Yellow", "Orange"]
    },
    /*  size: {
         type: String,
         enum: ["XS", "S", "M", "L", "XL", "XXL"]
     }, */
    brand: {
        type: String,
        enum: ["Apple", "Samsung", "Microsoft", "Lenovo", "Asus"]
    },
    ratings: [{
        star: Number,
        postedBy: {
            type: ObjectId,
            ref: "User",

        }
    }]

},
    {
        timestamps: true
    })
module.exports = mongoose.model("Product", productSchema)