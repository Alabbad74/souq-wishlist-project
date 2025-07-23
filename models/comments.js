const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 500
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  wishlistItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WishlistItem',
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  }
}, {
  timestamps: true // This adds createdAt and updatedAt
})

// Create indexes for better performance
commentSchema.index({ wishlistItem: 1 })
commentSchema.index({ author: 1 })

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment