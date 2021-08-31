const express = require("express")
const router = express.Router()
//import

const { authCheck, adminCheck } = require("../middlewares/auth")
const { createOrUpdateUser } = require("../controller/auth")
const { currentUser } = require("../controller/auth")


router.post("/create-or-update-user", authCheck, createOrUpdateUser)

router.post("/currentUser", authCheck, currentUser)
router.post("/currentAdmin", authCheck, adminCheck, currentUser)

module.exports = router