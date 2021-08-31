const express = require("express")
const { authCheck, adminCheck } = require("../middlewares/auth")
const router = express.Router()
const { create, list, remove } = require("../controller/coupon")
router.post("/coupon", authCheck, adminCheck, create)
router.get("/coupons", list)
router.delete("/coupon/:couponId", authCheck, adminCheck, remove)
module.exports = router;


