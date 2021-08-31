const User = require("../models/user")
const Cart = require("../models/cart")
const Coupon = require("../models/coupon")
const Order = require("../models/order")
const Product = require("../models/product")
const uniqueid = require("uniqueid")
exports.userCart = async (req, res) => {
    // console.log("cart", req.body)
    const { cart } = req.body
    let products = []
    //find user

    const user = await User.findOne({ email: req.user.email }).exec()
    // console.log("user data ", user)



    //check if cart with loggedin in userid already exists
    let cartExistsByThisUser = await Cart.findOne({ orderBy: user._id }).exec()
    //  console.log("cart data", cartExistsByThisUser)
    if (cartExistsByThisUser) {
        cartExistsByThisUser.remove()
        console.log("removed oldcart")

    }

    for (let i = 0; i < cart.length; i++) {
        let object = {}
        object.product = cart[i]._id
        object.count = cart[i].count
        object.color = cart[i].color
        //grt price for creating total

        let productFromDB = await Product.findById(cart[i]._id).select("price").exec()
        object.price = productFromDB.price

        products.push(object)
    }
    console.log("products", products)
    let cartTotal = 0
    for (i = 0; i < products.length; i++) {
        cartTotal = cartTotal + products[i].price * products[i].count
        console.log("cart total", cartTotal)

    }
    let newCart = await new Cart({
        products,
        cartTotal,
        orderBy: user._id
    }).save()

    console.log("newcart", newCart)
    res.json({ ok: true })

}
exports.getUserCart = async (req, res) => {
    const user = await User.findOne({ email: req.user.email }).exec()
    let cart = await Cart.findOne({ orderBy: user._id }).
        populate("products.product", "_id title price totalAfterDiscount")
        .exec()
    //destructure cart
    const { products, cartTotal, totalAfterDiscount } = cart
    res.json({ products, cartTotal, totalAfterDiscount })
}
exports.emptyCart = async (req, res) => {
    let user = await User.findOne({ email: req.user.email }).exec()
    let cart = await Cart.findOneAndRemove({ orderBy: user._id }).exec();
    console.log("empty cart", cart)
    res.json(cart)
}
exports.saveAddress = async (req, res) => {
    const userAddress = await User.findOneAndUpdate({ email: req.user.email }, { address: req.body.address }).exec()
    res.json({ ok: true })
}
exports.applyCoupon = async (req, res) => {
    const { coupon } = req.body
    const validCoupon = await Coupon.findOne({ name: coupon }).exec()
    if (validCoupon === null) {
        return res.json({ err: "invalid coupon" })

    }
    const user = await User.findOne({ email: req.user.email }).exec()
    let { products, cartTotal } = await Cart.findOne({ orderBy: user._id })
        .populate("products.product", "_id title price")
        .exec()
    //total after discount
    let totalAfterDiscount = (cartTotal - (cartTotal * validCoupon.discount / 100)).toFixed(2)
    Cart.findOneAndUpdate({
        orderBy: user._id
    }, { totalAfterDiscount }, { new: true }
    ).exec()
    res.json(totalAfterDiscount)
    console.log("totalafterdiscount", totalAfterDiscount)
}

exports.createOrder = async (req, res) => {
    const { paymentIntent } = req.body.stripeResponse
    const user = await User.findOne({ email: req.user.email }).exec()
    let { products } = await Cart.findOne({ orderBy: user._id }).exec()
    let newOrder = await new Order({
        products,
        paymentIntent,
        orderBy: user._id,
    }).save()
    //decrement quantity and increment sold

    let bulkOption = products.map((item) => {
        return {
            updateOne: {
                filter: { _id: item.product._id },
                update: { $inc: { quantity: -item.count, sold: +item.count } }
            }
        }
    })
    let updated = await Product.bulkWrite(bulkOption, {})
    // console.log("q-- s++ ", updated)
    //console.log("product sold after", updated.sold)

    // console.log("New order saved", newOrder)
    res.json({ ok: true })
}
exports.createCashOrder = async (req, res) => {
    const { COD, couponApplied } = req.body
    if (!COD) return res.status(400).send("create cash on order delivery failed")
    const user = await User.findOne({ email: req.user.email }).exec()
    let userCart = await Cart.findOne({ orderBy: user._id }).exec()

    let finalAmount = 0
    if (couponApplied && userCart.totalAfterDiscount) {
        finalAmount = Math.round(userCart.totalAfterDiscount * 100)
    }
    else {
        finalAmount = Math.round(userCart.cartTotal * 100)
    }

    let i = 100;
    let newOrder = await new Order({
        products: userCart.products,
        paymentIntent: {
            id: i++,
            amount: finalAmount,
            currency: "inr",
            status: "Cash on delivery",
            created: Date.now(),
            payment_method_types: ["cash"],
        },
        orderBy: user._id,
        orderStatus: "Cash On Delivery"
    }).save()

    // console.log("Order is : ", newOrder)
    //decrement quantity and increment sold

    let bulkOption = userCart.products.map((item) => {
        return {
            updateOne: {
                filter: { _id: item.product._id },
                update: { $inc: { quantity: -item.count, sold: +item.count } }
            }
        }
    })
    let updated = await Product.bulkWrite(bulkOption, {})
    // console.log("q-- s++ ", updated)
    //   console.log("product sold after", updated.sold)

    //console.log("New order saved", newOrder)
    res.json({ ok: true })
}

exports.orders = async (req, res) => {
    console.log("userOrders........")

    let user = await User.findOne({ email: req.user.email }).exec()

    let userOrders = await Order.find({ orderBy: user._id })
        .populate("products.product")
        .exec()


    res.json(userOrders)



}


exports.addToWishlist = async (req, res) => {
    const { productId } = req.body
    let user = await User.findOneAndUpdate({ email: req.user.email }, { $addToSet: { wishlist: productId } }).exec()
    console.log("item added")

    res.json({ ok: true })
}

exports.wishlist = async (req, res) => {
    const list = await User.findOne({ email: req.user.email })
        .select("wishlist")
        .populate("wishlist")
        .exec()
    res.json(list)

}

exports.removeFromWishlist = async (req, res) => {
    const { productId } = req.params
    const user = await User.findOneAndUpdate({ email: req.user.email }, { $pull: { wishlist: productId } }).exec()

    res.json({ ok: true })
}
