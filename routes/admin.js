const express = require("express")
const router = express.Router()
//import
const { auth } = require("../firebase")
const { orders, orderStatus } = require("../controller/admin")
const { authCheck, adminCheck } = require("../middlewares/auth")


router.get("/admin/orders", authCheck, adminCheck, orders)
router.put("/admin/order-status", authCheck, adminCheck, orderStatus)

module.exports = router