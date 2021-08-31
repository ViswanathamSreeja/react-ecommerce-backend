
const User = require("../models/user")
exports.createOrUpdateUser = async (req, res) => {
    const { name, email, picture } = req.user //destructure data from firebase
    const user = await User.findOneAndUpdate({ email },
        {
            name: email.split('@')[0],
            email
        },
        { new: true })
    if (user) {
        //   console.log("User Updated", user)
        res.json(user)
    }
    else {
        console.log("User Created ", user)
        const newUser = await new User({
            email,
            name: email.split('@')[0],
            picture
        }).save()
        res.json(newUser)
    }

}
exports.currentUser = async (req, res) => {
    User.findOne({ email: req.user.email }).exec((err, user) => {
        if (err) throw new Error(err)
        //otherwise
        res.json(user)

    })
}