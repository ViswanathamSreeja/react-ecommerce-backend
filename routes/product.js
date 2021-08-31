const express = require("express")
const { authCheck, adminCheck } = require("../middlewares/auth")
const router = express.Router()
const { create, listall, remove, read, update, list, totalproducts, productRating, searchFilters, listRelated } = require("../controller/product")
router.post("/product", authCheck, adminCheck, create)
router.get("/products/total", totalproducts)
router.get("/products/:count", listall)
router.delete("/product/:slug", authCheck, adminCheck, remove)
router.get("/product/:slug", read)
router.put("/product/:slug", authCheck, adminCheck, update)
router.post("/products", list)
//rating accessible only to logged in user
router.put("/product/star/:productId", authCheck, productRating)
//related products
router.get("/product/related/:productId", listRelated)
//search with post it is easy to send additional parameters
router.post("/search/filters", searchFilters)
module.exports = router;


