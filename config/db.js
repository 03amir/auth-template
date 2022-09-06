const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

const connectDb = async () =>{
    mongoose.connect(MONGO_URI,()=>{
        console.log("connected to the database")
    })
}

module.exports = connectDb;