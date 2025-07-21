const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require('../models/user.js')

router.get('/', (req, res) => {
    res.send('does the auth route work?')
})

// SIGN UP VIEW
router.get('/sign-up', (req, res) => {
    res.render('auth/sign-up.ejs')
})

// POST A NEW USER TO THE DATABASE when the form is submitted
router.post('/sign-up', async (req, res) => {
    try {
        // get data from the form (req.body)
        console.log('Sign-up attempt with data:', req.body)
        
        // check if someone already exists
        const userInDatabase = await User.findOne({ username: req.body.username })
        if (userInDatabase) {
            return res.send('Username already taken.')
        }
        
        // check that password and confirmPassword are the same
        if (req.body.password !== req.body.confirmPassword) {
            return res.send('Password and confirm password must match.')
        }
        
        // hash the password
        const hashedPassword = bcrypt.hashSync(req.body.password, 10)
        req.body.password = hashedPassword
        
        const newUser = await User.create(req.body)
        console.log('New user created:', newUser.username)
        
        req.session.user = {
            username: newUser.username,
            _id: newUser._id,
        }
        
        req.session.save(() => {
            console.log('Session saved:', req.session.user)
            res.redirect('/')
        })
    } catch (error) {
        console.error('Sign-up error:', error)
        res.send('An error occurred during sign-up. Please try again.')
    }
})

// SIGN IN VIEW
router.get('/sign-in', (req, res) => {
    res.render('auth/sign-in.ejs')
})

// POST TO SIGN THE USER IN (CREATE SESSION)
router.post('/sign-in', async (req, res) => {
    try {
        console.log('Sign-in attempt with username:', req.body.username)
        
        // check if user already exists in database
        const userInDatabase = await User.findOne({ username: req.body.username })
        console.log('User found in database:', !!userInDatabase)
        
        // if userInDatabase is NOT NULL (that means the user does exist) then send this message
        if (!userInDatabase) {
            return res.send('Login failed. Please try again.')
        }
        
        const validPassword = bcrypt.compareSync(req.body.password, userInDatabase.password)
        console.log('Password valid:', validPassword)
        
        if(!validPassword) {
            return res.send('Login failed. Please try again.')
        }
        
        req.session.user = {
            username: userInDatabase.username,
            _id: userInDatabase._id,
        }
        
        req.session.save(() => {
            console.log('User signed in successfully:', req.session.user)
            res.redirect('/')
        })
    } catch (error) {
        console.error('Sign-in error:', error)
        res.send('An error occurred during sign-in. Please try again.')
    }
})

// SIGN OUT VIEW
router.get('/sign-out', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
})

module.exports = router