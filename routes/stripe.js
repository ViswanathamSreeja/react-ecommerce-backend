const express = require("express")
const router = express.Router()
//import
const { createPaymentIntent } = require("../controller/stripe")
const { authCheck, adminCheck } = require("../middlewares/auth")

router.post("/create-payment-intent", authCheck, createPaymentIntent)

module.exports = router