const express = require("express")
const bodyParser = require("body-parser")
const authRouter = require("./routes/authRoute.js")
const productRouter = require("./routes/productRoute")
const dbConnect = require("./config/dbConnect")
const { notFound, errorHandler } = require("./middlewares/errorHandler.js")
const cookieParser = require("cookie-parser")
const morgan = require("morgan")
const dotenv = require("dotenv").config()
const PORT = process.env.PORT || 4000
const cors = require('cors');

//connecting to the database
dbConnect()

//create express app
const app = express()

// 👇️ configure CORS
app.use(cors());

app.use(morgan("dev"))

//parser requests of content-type --application/json
app.use(bodyParser.json())

//parse requests of content-type -application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

app.use(cookieParser())

//database response
// app.use("/", (req, res) => {
//     res.send("Hello from server side")
// })

//define a route
app.use("/api/user", authRouter)
app.use("/api/product", productRouter)

app.use(notFound)
app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Server is running at PORT ${PORT}`);
})