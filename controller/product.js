const Product = require("../models/product")
const slugify = require('slugify')
const User = require("../models/user")
const product = require("../models/product")

exports.create = async (req, res) => {
    try {
        console.log(req.body)
        req.body.slug = slugify(req.body.title)
        const newProduct = await new Product(req.body).save()
        res.json(newProduct)
    }
    catch (err) {
        console.log(err)
        res.status(400).json({
            err: err.message,
        })

    }

}
exports.listall = async (req, res) => {
    let products = await Product.find({})
        .limit(parseInt(req.params.count))
        .populate("category")
        .populate("subs")
        .sort([["createdAt", "desc"]])
        .exec()
    console.log("type =", typeof products)

    res.json(products)

}
exports.remove = async (req, res) => {
    try {
        let deleted = await Product.findOneAndRemove({
            slug: req.params.slug,
        }).exec()
        res.json(deleted)

    }
    catch (err) {
        console.log(err.message)
        res.send("failed to del product", err.message)

    }

}
exports.read = async (req, res) => {
    try {
        let product = await Product.findOne({ slug: req.params.slug })
            .populate("category")
            .populate("subs")
            .exec()
        res.json(product)

    }
    catch (err) {
        res.send(err.message)

    }
}

exports.update = async (req, res) => {
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title)
        }
        const updated = await Product.findOneAndUpdate({ slug: req.params.slug },
            req.body,
            { new: true })
            .exec();
        res.json(updated)

    }
    catch (err) {
        console.log("product update err", err)
        //  return res.send("Product update failed")
        res.status(400).json({
            err: err.message,
        })

    }
}
/* exports.list = async (req, res) => {
    try {
        //createdAt/updatedat,asec/desc,3
        const { sort, order, limit } = req.body
        const products = await Product.find({})
            .populate("category")
            .populate("subs")
            .sort([[sort, order]])
            .limit(limit)
            .exec()
        return res.json(products)
    }
    catch (err) {
        console.log(err)
    }
} */
exports.list = async (req, res) => {
    try {
        //createdAt/updatedat,asec/desc,3
        const { sort, order, page } = req.body
        let currentPage = page || 1
        let perPage = 3
        const products = await Product.find({})
            .skip((currentPage - 1) * perPage)
            .populate("category")
            .populate("subs")
            .sort([[sort, order]])
            .limit(perPage)
            .exec()
        return res.json(products)
    }
    catch (err) {
        // console.log(err)
    }
}
exports.totalproducts = async (req, res) => {
    try {
        let count = await Product.find({})
            .estimatedDocumentCount()
            .exec()
        res.json(count)
    }
    catch (err) {
        // console.log(err)
    }
}

exports.productRating = async (req, res) => {
    //finding the product using productid from url
    let product = await Product.findById(req.params.productId).exec()
    let user = await User.findOne({ email: req.user.email }).exec()
    const { star } = req.body
    //who is updating
    //if currently logged in user already added rating
    let existingRatingObject = product.ratings.find(ele => ele.postedBy + "" === user._id + "")
    //if current user has not rated yet
    if (existingRatingObject === undefined) {
        let ratingAdded = await Product.findByIdAndUpdate(
            product._id,
            {
                $push: {
                    ratings: { star, postedBy: user._id }
                }
            }
            , { new: true }
        ).exec()
        res.json(ratingAdded)
        console.log(res.json)
    }
    //if user already rated update
    else {
        const ratingUpdated = await Product.updateOne(
            { ratings: { $elemMatch: existingRatingObject } },
            { $set: { "ratings.$.star": star } }, { new: true }
        ).exec()
        res.json(ratingUpdated)
        //   console.log(res.json)
    }
}
//related products
exports.listRelated = async (req, res) => {
    let product = await Product.findById(req.params.productId).exec()

    //  let product = await Product.findById({ req.params.productId }).exec()
    //getting related products excluding the same product with same category
    let related = await Product.find({
        _id: { $ne: product._id },
        category: product.category
    })
        .limit(3)
        .populate('category')
        .populate('subs')
        .populate('postedBy')
        .exec()
    res.json(related)
}
const handleQuery = async (req, res, query) => {
    const products = await Product.find({ $text: { $search: query } })
        .populate("category", "_id name")
        .populate("subs", "_id name")
        .exec()
    res.json(products)
}
const handlePrice = async (req, res, price) => {
    try {
        const products = await Product.find({
            price: {
                $gte: price[0],
                $lte: price[1]
            }
        })
            .populate("category", "_id name")
            .populate("subs", "_id name")
            .exec()
        res.json(products)
    }
    catch (err) {
        //  console.log(err)
    }
}
const handleCategory = async (req, res, category) => {
    try {
        const products = await Product.find({
            category
        }).populate("category", "_id name")
            .populate("subs", "_id name")
            .exec()
        res.json(products)
    }
    catch (err) {
        //  console.log(err)
    }
}
const handleStars = async (req, res, stars) => {
    //project aggregaation
    Product.aggregate([
        {
            $project: {
                document: "$$ROOT",
                floorAverage: {
                    $floor: { $avg: "$ratings.star" },
                },
            },
        }, {
            $match: { floorAverage: stars }
        }
    ])
        .limit(12)
        .exec((err, aggregates) => {
            if (err) console.log("aggregate error", err)
            product.find({ _id: aggregates })
                .populate("category", "id_name")
                .populate("subs", "id_name")
                .exec((err, products) => {
                    if (err) console.log("products aggregate error", err)
                    res.json(products)
                })
        })
}
const handleSub = async (req, res, sub) => {
    const products = await Product.find({ subs: sub })
        .populate("category", "_id name")
        .populate("subs", "_id name")
        .exec()
    res.json(products)
}

const handleShipping = async (req, res, shipping) => {
    try {
        const products = await Product.find({
            shipping
        }).populate("category", "_id name")
            .populate("subs", "_id name")
            .exec()
        res.json(products)
    }
    catch (err) {
        //   console.log(err)
    }
}

const handleBrand = async (req, res, brand) => {
    try {
        const products = await Product.find({
            brand
        }).populate("category", "_id name")
            .populate("subs", "_id name")
            .exec()
        res.json(products)
    }
    catch (err) {
        //  console.log(err)
    }
}

const handleColor = async (req, res, color) => {
    try {
        const products = await Product.find({
            color
        }).populate("category", "_id name")
            .populate("subs", "_id name")
            .exec()
        res.json(products)
    }
    catch (err) {
        console.log(err)
    }
}


exports.searchFilters = async (req, res) => {
    const { query, price, category, stars, sub, shipping, color, brand } = req.body
    if (query) {
        console.log("query", query)
        await handleQuery(req, res, query)
    }
    //price 
    if (price !== undefined) {
        console.log("price", price)
        await handlePrice(req, res, price)
    }
    if (category) {
        await handleCategory(req, res, category)
    }
    if (stars) {
        await handleStars(req, res, stars)
    }
    if (sub) {
        await handleSub(req, res, sub)
    }
    if (shipping) {
        await handleShipping(req, res, shipping)
    }
    if (color) {
        await handleColor(req, res, color)
    }
    if (brand) {
        await handleBrand(req, res, brand)
    }
}