const express = require("express")
const router = express.Router()
//import

const { userCart, getUserCart, emptyCart, saveAddress, orders, applyCoupon, createCashOrder, createOrder, addToWishlist, wishlist, removeFromWishlist } = require("../controller/user")
const { authCheck } = require("../middlewares/auth")


router.post("/user/cart", authCheck, userCart) //save cart
router.get("/user/cart", authCheck, getUserCart) //get cart
router.delete("/user/cart", authCheck, emptyCart)//empty cart
router.post("/user/address", authCheck, saveAddress)
//coupon
router.post("/user/cart/coupon", authCheck, applyCoupon)
router.post("/user/order", authCheck, createOrder)
router.get("/user/order", authCheck, orders)

//whishlist
router.post("/user/wishlist", authCheck, addToWishlist)
router.get("/user/wishlist", authCheck, wishlist)
router.put("/user/wishlist/:productId", authCheck, removeFromWishlist)

//cod
router.post("/user/cash-order", authCheck, createCashOrder)

module.exports = router