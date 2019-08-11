const express = require("express");
const router = express.Router();

const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const isAuthenticated = require("../configs/isAuthenticated");

router.get("/add-to-cart/:id", (req, res) => {
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart : {});

  Product.findById(productId)
    .then(product => {
      cart.add(product, product.id);
      req.session.cart = cart;
      console.log(req.session.cart);
      res.redirect("/products");
    })
    .catch(err => {
      console.log(err);
      res.redirect("/");
    });
});

router.get("/increase/:id", (req, res) => {
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.increaseByOne(productId);
  req.session.cart = cart;
  res.redirect("/carts/shopping-cart");
});

router.get("/reduce/:id", (req, res) => {
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect("/carts/shopping-cart");
});

router.get("/remove/:id", (req, res) => {
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect("/carts/shopping-cart");
});

router.get("/shopping-cart", (req, res) => {
  if (!req.session.cart) {
    return res.render("carts", { products: null });
  }
  let cart = new Cart(req.session.cart);
  res.render("carts", {
    products: cart.generateArray(),
    totalPrice: cart.totalPrice
  });
});

router.get("/checkout", isAuthenticated, (req, res) => {
  if (!req.session.cart) {
    return res.redirect("/carts/shopping-cart");
  }
  let cart = new Cart(req.session.cart);
  const messages = req.flash("error");
  res.render("checkout", { totalPrice: cart.totalPrice, messages: messages });
});

router.post("/checkout", isAuthenticated, (req, res) => {
  if (!req.session.cart) {
    return res.redirect("/carts/shopping-cart");
  }
  let cart = new Cart(req.session.cart);

  const {
    full_name,
    email,
    address,
    city,
    state,
    zip,
    shipping_address
  } = req.body;
  let ship_full_name = "";
  let ship_address = "";
  let ship_city = "";
  let ship_state = "";
  let ship_zip = "";
  if (shipping_address != "same_address") {
    ship_full_name = req.body.ship_full_name;
    ship_address = req.body.ship_address;
    ship_city = req.body.ship_city;
    ship_state = req.body.ship_state;
    ship_zip = req.body.ship_zip;
    if (
      !ship_full_name ||
      !ship_address ||
      !ship_city ||
      !ship_state ||
      !ship_zip
    ) {
      req.flash(
        "error",
        "Please fill in the shipping address if its different!"
      );
      req.session.save(() => {
        res.redirect("/carts/checkout");
      });
    }
  } else if (!full_name || !email || !address || !city || !state || !zip) {
    req.flash("error", "Please fill in all the fields to purchase!");
    req.session.save(() => {
      res.redirect("/carts/checkout");
    });
  } else {
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

    stripe.charges.create(
      {
        amount: cart.totalPrice * 100,
        currency: "usd",
        source: req.body.stripeToken, // obtained with Stripe.js
        description: "Test Charge for GL_S&M"
      },
      function(err, charge) {
        // asynchronously called
        if (err) {
          req.flash("error", err.message);
          req.session.save(() => {
            res.redirect("/carts/checkout");
          });
        }

        const order = new Order({
          user: req.user,
          cart: cart,
          full_name: full_name,
          email: email,
          address: address,
          city: city,
          state: state,
          zip: zip,
          paymentId: charge.id,
          ship_full_name: ship_full_name,
          ship_address: ship_address,
          ship_city: ship_city,
          ship_state: ship_state,
          ship_zip: ship_zip
        });
        order
          .save()
          .then(() => {
            req.session.cart = null;
            res.redirect("/");
          })
          .catch(err => {
            req.flash("error", err);
            req.session.save(() => {
              res.redirect("/carts/checkout");
            });
          });
      }
    );
  }
});

module.exports = router;
