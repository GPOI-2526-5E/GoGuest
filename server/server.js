require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const photoRoutes = require('./routes/photos');

const app = express()

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))


mongoose.connect(process.env.MONGO_URI)
                .then(()=> console.log("MONGO DB connesso..."))
                .catch(err => console.log(err))

app.use("/api/auth", authRoutes)
app.use("/api/photos", photoRoutes)

app.listen(process.env.PORT, () => {
    console.log("Server avviato su porta " + process.env.PORT)
})