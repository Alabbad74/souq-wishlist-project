require('dotenv').config({ quiet: true })
const express = require('express')
const app = express()
const router = express.Router()
const methodOverride = require('method-override')
const morgan = require('morgan')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const authController = require('./controllers/auth.controller')
const isSignedIn = require('./middleware/is-signed-in')
const passUserToView = require('./middleware/pass-user-to-view')
const wishlistController = require('./controllers/wishlist.controller')
const commentsController = require('./controllers/comments.controller')
const WishlistItem = require('./models/wishlistItem')


// DATABASE CONNECTION
mongoose.connect(process.env.MONGODB_URI)
mongoose.connection.on('connected', () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name} 🙃.`)
})

// VIEW ENGINE SETUP
app.set('view engine', 'ejs')
app.set('views', './views')

// MIDDLEWARE
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json()) // Add JSON parsing for comment API requests
app.use(methodOverride('_method'))
app.use(morgan('dev'))
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
    })
}))
app.use(passUserToView)

app.get('/', (req, res) => {
    res.render('index.ejs', { title: 'my App'})
})

// ROUTES
app.use('/auth', authController)
app.use('/wishlist', wishlistController)
app.use('/comments', commentsController)

app.get('/vip-lounge', isSignedIn, (req, res) => {
    res.send(`Welcome ✨`)
})

const port = process.env.PORT ? process.env.PORT : "3000"
app.listen(port, () => {
    console.log(`The express app is ready on port ${port}`)
})