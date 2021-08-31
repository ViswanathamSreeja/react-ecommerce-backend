const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const morgan = require('morgan')
require('dotenv').config()
//import routes
//const authRoutes = require("./routes/auth")
//autoloading
const fs = require('fs')
//app
const app = express()
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})
    .then(() => console.log("DB connected"))
    .catch(err => console.log("connection failed", err))
//middleware
app.use(morgan("dev"))
app.use(express.json({ limit: '50mb' }))
app.use(cors())
//routes middleware
//app.use("/api", authRoutes)
fs.readdirSync("./routes").map((r) => app.use("/api", require("./routes/" + r)))

const port = process.env.PORT || 8000
app.listen(port, () => console.log("server is running on port ", port))