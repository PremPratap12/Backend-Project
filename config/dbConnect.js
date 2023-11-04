const mongoose = require("mongoose")

const dbConnect = async () => {
    try {
        const conn = mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true });
        console.log("Database Connected Successfully");
    } catch (error) {
        console.log("Database error", error)
    }
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
    }).then(() => {
        console.log("Successfully connected to the database ");
    }).catch((err) => {
        console.log("Could not connect to the database. Exiting now...", err)
        process.exit()
    })
}

module.exports = dbConnect