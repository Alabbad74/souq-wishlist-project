const express = require('express')
const router = express.Router()
const isSignedIn = require('../middleware/is-signed-in')
const WishlistItem = require('../models/wishlistItem')

// INDEX - Show user's own wishlist items
router.get('/', isSignedIn, async (req, res) => {
  try {
    const wishlistItems = await WishlistItem.find({ owner: req.session.user._id }).sort({ createdAt: -1 })
    res.render('wishlist/index.ejs', { wishlistItems })
  } catch (error) {
    console.log(error)
    res.send('Something went wrong')
  }
})

// BROWSE - Show all public wishlist items
router.get('/browse', async (req, res) => {
  try {
    const allWishlistItems = await WishlistItem.find({})
      .populate('owner', 'username')
      .sort({ createdAt: -1 })
    res.render('wishlist/browse.ejs', { wishlistItems: allWishlistItems })
  } catch (error) {
    console.log(error)
    res.send('Something went wrong')
  }
})

// NEW WISHLIST ITEM FORM
router.get('/new', isSignedIn, (req, res) => {
  res.render('wishlist/new.ejs')
})

// POST FORM DATA TO DATABASE
router.post('/', isSignedIn, async (req, res) => {
  try {
    req.body.owner = req.session.user._id
    await WishlistItem.create(req.body)
    res.redirect('/wishlist')
  } catch (error) {
    console.log(error)
    res.send('Something went wrong')
  }
})

module.exports = router