const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const capitalizeInputs = require("../public/js/capitalizeInputs");

const upload = require("../configs/fileUpload");

router.get("/", (req, res) => {
  Product.find()
    .then(products => {
      res.render("products", {
        products: products
      });
    })
    .catch(err => console.log(err));
});

router.get("/create", (req, res) => {
  const messages = req.flash("error");
  res.render("add_product", { messages: messages });
});

router.post("/create", upload.single("image"), (req, res) => {
  let { name, description, price, category } = req.body;
  name = capitalizeInputs(name);
  let imageName = "";
  let imageURL = "";
  if (req.file != null) {
    imageName = req.file.key;
    imageURL = req.file.location;
  } else {
    req.flash("error", "No File Selected");
    req.session.save(() => {
      res.redirect("/products/create");
    });
  }
  if (!name || !description || !price || !category) {
    req.flash("error", "Missing some required fields");
    req.session.save(() => {
      res.redirect("/products/create");
    });
  }

  const product = new Product({
    imageName,
    imageURL,
    name,
    description,
    price,
    category
  });
  product
    .save()
    .then(() => {
      res.redirect("/products");
    })
    .catch(err => console.log(err));
});

router.get("/:id", (req, res) => {
  const productId = req.params.id;
  Product.findById(productId)
    .then(product => {
      console.log(product);
      res.render("single_product", {
        product: product
      });
    })
    .catch(err => console.log(err));
});

module.exports = router;
