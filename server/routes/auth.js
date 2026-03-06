// auth.js
const express = require('express')
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const router = express.Router()

// Registrazione
router.post('/register', async(req, res) => {
    try{
        const { username, email, password } = req.body
        const hashedPassword = await bcrypt.hash(password, 12)

        const user = new User(
            {
                username, 
                email,
                password: hashedPassword
            }
        )
        await user.save()
        res.status(201).json({ message: "Utente creato" })
    }
    catch(err){
        res.status(500).json({ message: err.message })
    }
})
// Login
router.post('/login', async(req, res) => {
    bcrypt.hash('asd', 12).then(console.log)

    try{
        const {email, password} = req.body
        // Log email e psw in caso di problemi 
        const user = await User.findOne({ email })
        // Verifica esistenza email
        if (!user) 
            return res.status(400).json({ message: 'Utente non trovato'})
        // Comparazione della password inviata con quella dell'utente
        const validate = await bcrypt.compare(password, user.password)

        if(!validate)
            return res.status(400).json({ message: 'Password errata'})
        // Genero JWT con _id utente Payload 
        const token = jwt.sign(
            { userId: user._id }, process.env.JWT_SECRET ,
            { expiresIn: "1d" }
        )
        // Restituisco token al client
        res.json({ token })
    }
    catch(err)
    {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router