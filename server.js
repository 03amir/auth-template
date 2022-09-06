const express = require("express");
const app = express()

app.use(express.json())

require("dotenv").config();

const cors = require("cors");
app.use(cors())

const PORT = process.env.PORT;

const connectDb = require("./config/db");
connectDb();

const authRouter = require("./router/authRouter");
app.use(authRouter)

app.listen(PORT,()=>{
    console.log("connected to the server")
})

