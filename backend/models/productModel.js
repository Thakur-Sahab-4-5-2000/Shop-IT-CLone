const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter product name"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please enter product description"],
    min: [10, "Description must be at least 10 characters"],
    max: [100, "Description must be less than 100 characters"],
  },

  price: {
    type: Number,
    required: [true, "Please enter product price"],
    min: [1, "Price must be at least 1"],
    max: [5000000, "Price must be less than 5000000"],
  },
  images: {
    url: {
      type: String,
      required: [true, "Please enter product image url"],
    },
    public_id: {
      type: String,
      required: [true, "Please enter product image public id"],
    },
  },
  category: {
    type: String,
    required: [true, "Please enter product category"],
  },
  stock: {
    type: Number,
    required: [true, "Please enter product stock"],
    default: 0,
    max: [100, "Stock must be less than 100"],
  },

  numOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: { type: Number, required: true },
      comment: { type: String, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  ratings: {
    type: Number,
    default: 0,
    min: [0, "Rating must be at least 0"],
    max: [5, "Rating must be less than 5"],
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", productSchema);
