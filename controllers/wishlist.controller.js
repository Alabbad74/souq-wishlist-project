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

// STEP 3A: GET EDIT FORM - When user clicks "Edit" button
router.get('/:id/edit', isSignedIn, async (req, res) => {
  try {
    // Find the item they want to edit
    const item = await WishlistItem.findById(req.params.id)
    
    // Check if item exists
    if (!item) {
      return res.status(404).send('Wishlist item not found')
    }
    
    // Security: Make sure they own this item
    if (item.owner.toString() !== req.session.user._id.toString()) {
      return res.status(403).send('You can only edit your own wishlist items')
    }
    
      // Show the edit form with the current data
  res.render('wishlist/edit.ejs', { item })
} catch (error) {
  console.log(error)
  res.send('Something went wrong')
}
})

// STEP 3B: PUT ROUTE - When user submits the edit form
router.put('/:id', isSignedIn, async (req, res) => {
try {
  // Find the item they're trying to update
  const item = await WishlistItem.findById(req.params.id)
  
  // Check if item exists
  if (!item) {
    return res.status(404).send('Wishlist item not found')
  }
  
  // Security: Make sure they own this item
  if (item.owner.toString() !== req.session.user._id.toString()) {
    return res.status(403).send('You can only edit your own wishlist items')
  }
  
  // Update the item with new data from the form
  await WishlistItem.findByIdAndUpdate(req.params.id, req.body)
  
  // Redirect back to wishlist
  res.redirect('/wishlist')
} catch (error) {
  console.log(error)
  res.send('Something went wrong')
}
})

// STEP 4: DELETE ROUTE - When user clicks "DELETE" button
router.delete('/:id', isSignedIn, async (req, res) => {
  try {
    // Find the item they want to delete
    const item = await WishlistItem.findById(req.params.id)
    
    // Check if item exists
    if (!item) {
      return res.status(404).send('Wishlist item not found')
    }
    
    // Security: Make sure they own this item
    if (item.owner.toString() !== req.session.user._id.toString()) {
      return res.status(403).send('You can only delete your own wishlist items')
    }
    
    // Delete the item from database
    await WishlistItem.findByIdAndDelete(req.params.id)
    
    // Redirect back to wishlist
    res.redirect('/wishlist')
  } catch (error) {
    console.log(error)
    res.send('Something went wrong')
  }
})

module.exports = router