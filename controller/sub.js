const Sub = require("../models/sub")
const Product = require("../models/product")
const slugify = require("slugify")

exports.create = async (req, res) => {
    try {
        const { name, parent } = req.body
        res.json(await new Sub({ name, parent, slug: slugify(name) }).save())
    }
    catch (err) {
        //  console.log(err)
        res.status(404).send("create sub failed")
    }

}
exports.list = async (req, res) => {
    res.json(await Sub.find({}).sort({ createdAt: -1 }).exec())
    //displaying from latest created to old

}
exports.read = async (req, res) => {
    let sub = await Sub.findOne({ slug: req.params.slug }).exec()
    let products = await Product.find({ subs: sub })
        .populate("category")
        .exec()
    res.json({ sub, products })
}
exports.update = async (req, res) => {
    const { name, parent } = req.body
    try {
        let updated = await Sub.findOneAndUpdate(
            { slug: req.params.slug },
            { name, parent, slug: slugify(name) },
            { new: true })

        res.json(updated)
    }
    catch (err) {
        //  console.log(err)
        res.status(400).send("sub updation failed")
    }
}
exports.remove = async (req, res) => {
    try {
        let deleted = await Sub.findOneAndDelete({ slug: req.params.slug })
        res.json(deleted)
    }
    catch (err) {
        res.status(400).send("sub delte failed")
    }

}

