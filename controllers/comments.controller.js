const express = require('express')
const router = express.Router()
const isSignedIn = require('../middleware/is-signed-in')
const Comment = require('../models/comments')
const WishlistItem = require('../models/wishlistItem')

// GET ALL COMMENTS FOR A SPECIFIC WISHLIST ITEM
router.get('/wishlist/:wishlistItemId', async (req, res) => {
  try {
    const comments = await Comment.find({ wishlistItem: req.params.wishlistItemId })
      .populate('author', 'username')
      .sort({ createdAt: -1 })
    
    res.json(comments)
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to fetch comments' })
  }
})

// POST - CREATE A NEW COMMENT
router.post('/wishlist/:wishlistItemId', isSignedIn, async (req, res) => {
  try {
    console.log(' Creating comment for wishlist:', req.params.wishlistItemId)
    console.log(' User session:', req.session.user ? req.session.user.username : 'No user')
    console.log(' Request body:', req.body)
    
    // Check if the wishlist item exists
    const wishlistItem = await WishlistItem.findById(req.params.wishlistItemId)
    if (!wishlistItem) {
      console.log(' Wishlist item not found')
      return res.status(404).json({ error: 'Wishlist item not found' })
    }

    console.log('✅ Wishlist item found:', wishlistItem.title)

    // Validate comment content
    if (!req.body.content || req.body.content.trim().length === 0) {
      console.log('❌ Empty comment content')
      if (req.accepts('json')) {
        return res.status(400).json({ error: 'Comment content is required' })
      } else {
        return res.redirect(`/wishlist/${req.params.wishlistItemId}?error=empty_comment`)
      }
    }

    if (req.body.content.length > 500) {
      console.log('❌ Comment too long')
      if (req.accepts('json')) {
        return res.status(400).json({ error: 'Comment too long (max 500 characters)' })
      } else {
        return res.redirect(`/wishlist/${req.params.wishlistItemId}?error=comment_too_long`)
      }
    }

    // Create the comment
    const comment = await Comment.create({
      content: req.body.content.trim(),
      rating: req.body.rating || null,
      author: req.session.user._id,
      wishlistItem: req.params.wishlistItemId
    })

    console.log('✅ Comment created:', comment._id)

    // Populate author info for response
    await comment.populate('author', 'username')

    console.log('✅ Comment populated, sending response')

    // If this is an AJAX request, return JSON
    if (req.headers['content-type']?.includes('application/json') || req.accepts('json')) {
      res.json(comment)
    } else {
      // If it's a form submission, redirect back to the item page
      res.redirect(`/wishlist/${req.params.wishlistItemId}`)
    }
  } catch (error) {
    console.log('❌ Error creating comment:', error)
    if (req.accepts('json')) {
      res.status(500).json({ error: 'Failed to create comment' })
    } else {
      res.redirect(`/wishlist/${req.params.wishlistItemId}?error=comment_failed`)
    }
  }
})

// PUT - UPDATE A COMMENT (only by author)
router.put('/:commentId', isSignedIn, async (req, res) => {
  try {
    // Validate comment content
    if (!req.body.content || req.body.content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' })
    }

    if (req.body.content.length > 500) {
      return res.status(400).json({ error: 'Comment too long (max 500 characters)' })
    }

    const comment = await Comment.findById(req.params.commentId)
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' })
    }

    // Check if user owns this comment
    if (comment.author.toString() !== req.session.user._id.toString()) {
      return res.status(403).json({ error: 'You can only edit your own comments' })
    }

    // Update the comment
    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      {
        content: req.body.content.trim(),
        rating: req.body.rating || comment.rating
      },
      { new: true }
    ).populate('author', 'username')

    res.json(updatedComment)
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to update comment' })
  }
})

// DELETE - REMOVE A COMMENT (only by author)
router.delete('/:commentId', isSignedIn, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId)
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' })
    }

    // Check if user owns this comment
    if (comment.author.toString() !== req.session.user._id.toString()) {
      return res.status(403).json({ error: 'You can only delete your own comments' })
    }

    await Comment.findByIdAndDelete(req.params.commentId)
    res.json({ message: 'Comment deleted successfully' })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to delete comment' })
  }
})

module.exports = router