const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const OrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    cart: {
      type: Object,
      required: true
    },
    full_name: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zip: {
      type: String,
      required: true
    },
    paymentId: {
      type: String,
      required: true
    },
    ship_full_name: {
      type: String
    },
    ship_address: {
      type: String
    },
    ship_city: {
      type: String
    },
    ship_state: {
      type: String
    },
    ship_zip: {
      type: String
    },
    status: {
      type: String,
      default: "Pending"
    },
    order_date: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = Order = mongoose.model("Order", OrderSchema);
