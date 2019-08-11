const mongoose = require("mongoose");

const ProductSchema = mongoose.Schema(
  {
    imageName: {
      type: String,
      required: true
    },
    imageURL: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: String,
      required: true
    },
    category: {
      type: Array,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = Product = mongoose.model("Product", ProductSchema);
