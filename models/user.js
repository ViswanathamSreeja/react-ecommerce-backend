const mongoose = require("mongoose")
const { ObjectId } = mongoose.Schema

const userSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        required: true,
        index: true
    },
    cart: {
        type: Array,
        default: []
    },
    role: {
        type: String,
        default: "subscriber"
    },
    address: String,
    wishlist: [{ type: ObjectId, ref: "Product" }]
}, { timestamps: true })

module.exports = mongoose.model("User", userSchema)