
const User = require("../models/user")
const Cart = require("../models/cart")
const Coupon = require("../models/coupon")
const Product = require("../models/product")
const stripe = require("stripe")(process.env.STRIPE_SECRET)


exports.createPaymentIntent = async (req, res) => {
    //apply coupon 
    const { couponApplied } = req.body
    //calclulate price
    //find user
    const user = await User.findOne({ email: req.user.email }).exec()
    //get user cart total
    const { cartTotal, totalAfterDiscount } = await Cart.findOne({ orderBy: user._id }).exec()
    console.log("cart total", cartTotal)
    let finalAmount = 0
    if (couponApplied && totalAfterDiscount) {
        finalAmount = Math.round(totalAfterDiscount * 100)
    }
    else {
        finalAmount = Math.round(cartTotal * 100)
    }
    //create payment intent with order amount currency
    const paymentIntent = await stripe.paymentIntents.create({
        amount: finalAmount,
        currency: "inr",
        description: "u purchased an item",

    })
    res.send({
        clientSecret: paymentIntent.client_secret,
        cartTotal,
        totalAfterDiscount,
        payable: finalAmount

    })
}