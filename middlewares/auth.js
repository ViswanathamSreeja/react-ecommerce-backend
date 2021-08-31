const admin = require("../firebase")
const User = require("../models/user")
//middleware func
exports.authCheck = async (req, res, next) => {
    // console.log(req.headers) //token
    try {
        const firebaseUser = await admin.auth().verifyIdToken(req.headers.authtoken)
        console.log("firebase user in authcheck", firebaseUser)
        //making firebase available to controller
        req.user = firebaseUser
        next()

    }
    catch (err) {
        res.status(401).json({
            err: "Invalid or expired token"
        })
        console.log(err)
    }

}
exports.adminCheck = async (req, res, next) => {
    const { email } = req.user
    const adminUser = await User.findOne({ email }).exec()
    if (adminUser.role !== "admin") {
        console.log("errrr")
        res.status(403).json({
            err: "admin resource: access denied"
        })
    } else {
        next()
    }
}