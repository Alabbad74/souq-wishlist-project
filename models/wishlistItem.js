const mongoose = require('mongoose')
const Schema = mongoose.Schema

const wishlistItemSchema = new Schema({
  title: String,
  description: String,
  price: Number,
  imageUrl: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true })

const WishlistItem = mongoose.model('WishlistItem', wishlistItemSchema)

module.exports = WishlistItem