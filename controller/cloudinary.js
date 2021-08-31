const cloudinary = require("cloudinary")
//config


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET

})

exports.upload = async (req, res) => {
    let result = await cloudinary.uploader.upload(req.body.img, {
        public_id: `${Date.now()}`,
        resource_type: 'auto'  //auto means jpeg,png
    })
    res.json({
        public_id: result.public_id,
        url: result.secure_url,
    })

}
exports.remove = (req, res) => {
    let img_id = req.body.public_id;
    cloudinary.uploader.destroy(img_id, (err, result) => {
        if (err) return res.json({ success: false, err })
        res.send("OK")
    })
}