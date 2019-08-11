const express = require("express");
const router = express.Router();
const sendFeedback = require("../emails/feedback");

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/contact", (req, res) => {
  res.render("contact");
});

router.get("/about", (req, res) => {
  res.render("about");
});

router.get("/feedback", (req, res) => {
  const messages = req.flash("error");
  res.render("feedback", { messages: messages });
});

router.post("/feedback", (req, res) => {
  let { subject, name, email, phone, address, message } = req.body;
  if (!name || !phone || !address) {
    name = "Customer did not leave a Name";
    phone = "Customer did not leave a Phone";
    address = "Customer did not leave a Address";
  }
  if (!subject || !email || !message) {
    req.flash("error", "Invalid... Please fill in the required fields");
    req.session.save(() => {
      res.redirect("/feedback");
    });
  } else {
    sendFeedback(subject, name, email, phone, address, message);
  }
});
module.exports = router;
