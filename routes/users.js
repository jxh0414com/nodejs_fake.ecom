const express = require("express");
const router = express.Router();
const passport = require("passport");
const unAuthenticated = require("../configs/unAuthenticated");
const isAuthenticated = require("../configs/isAuthenticated");
const isAuthorized = require("../configs/isAuthorized");
const sendResetToken = require("../emails/forgot_password");
const sendPasswordChanged = require("../emails/password_changed");
const User = require("../models/User");
const uuid = require("uuid");
const bcrypt = require("bcryptjs");
const Order = require("../models/Order");
const Cart = require("../models/Cart");

router.get("/register", unAuthenticated, (req, res) => {
  const messages = req.flash("error");
  res.render("register", { messages: messages });
});

router.post(
  "/register",
  passport.authenticate("local.register", {
    successRedirect: "/",
    failureRedirect: "/users/register",
    failureFlash: true
  })
);

router.get("/login", unAuthenticated, (req, res) => {
  const messages = req.flash("error");
  res.render("login", { messages: messages });
});

router.post(
  "/login",
  passport.authenticate("local.login", {
    successRedirect: "/products",
    failureRedirect: "/users/login",
    failureFlash: true
  })
);

router.get("/logout", isAuthenticated, (req, res) => {
  req.logout();
  res.redirect("/");
});

router.get("/forgot_password", unAuthenticated, (req, res) => {
  const messages = req.flash("error");
  res.render("forgot_password", { messages: messages });
});

router.post("/forgot_password", (req, res) => {
  const { email } = req.body;
  User.findOneAndUpdate({ email: email }, { resetToken: uuid() }, { new: true })
    .then(user => {
      sendResetToken(user);
      res.redirect("/");
    })
    .catch(err => {
      req.flash("error", "There is no user with such email");
      req.session.save(() => {
        res.redirect("/users/forgot");
      });
    });
});

router.get("/reset_password/:id", unAuthenticated, (req, res) => {
  const resetToken = req.params.id;
  User.findOne({ resetToken: resetToken })
    .then(user => {
      const messages = req.flash("error");
      res.render("reset_password", { user: user, messages: messages });
    })
    .catch(err => {
      req.flash("error", "Invalid Token.. Please try again!");
      req.session.save(() => {
        res.redirect("/users/forgot");
      });
    });
});

router.post("/reset_password/:id", (req, res) => {
  const { email, password, passwordConfirm } = req.body;
  if (!password || !passwordConfirm || password != passwordConfirm) {
    req.flash("error", "Password must match");
    req.session.save(() => {
      res.redirect(`/users/reset/${user.resetToken}`);
    });
  }
  User.findOneAndUpdate(
    { email: email },
    {
      password: bcrypt.hashSync(password, bcrypt.genSaltSync(10, null)),
      resetToken: ""
    },
    { new: true }
  )
    .then(user => {
      sendPasswordChanged(user);
      res.redirect("/users/login");
    })
    .catch(err => {
      req.flash("error", err);
      req.session.save(() => {
        res.redirect(`/users/reset/${user.resetToken}`);
      });
    });
});

router.get("/profile", isAuthenticated, (req, res) => {
  const userId = req.user._id;
  User.findOne({ _id: userId })
    .then(userExist => {
      res.render("profile", { userExist: userExist });
    })
    .catch(err => {
      req.flash("error", "Cannot find any user. Please try again");
      req.session.save(() => {
        res.redirect("/users/login");
      });
    });
});

router.get("/profile/change_password", isAuthenticated, (req, res) => {
  const userId = req.user._id;
  User.findOne({ _id: userId })
    .then(userExist => {
      const messages = req.flash("error");
      res.render("change_password", {
        userExist: userExist,
        messages: messages
      });
    })
    .catch(err => {
      req.flash("error", "Cannot find any user. Please try again");
      req.session.save(() => {
        res.redirect("/users/login");
      });
    });
});

router.post("/profile/change_password", (req, res) => {
  const { email, password, passwordConfirm } = req.body;
  if (!password || !passwordConfirm || password != passwordConfirm) {
    req.flash("error", "Invalid Password/Password must matched");
    req.session.save(() => {
      res.redirect("/users/profile/change");
    });
  } else {
    User.findOneAndUpdate(
      { email: email },
      { password: bcrypt.hashSync(password, bcrypt.genSaltSync(10, null)) },
      { new: true }
    )
      .then(user => {
        sendPasswordChanged(user);
        res.redirect("/users/profile");
      })
      .catch(err => {
        req.flash("error", err);
        req.session.save(() => {
          res.redirect("/users/profile/change");
        });
      });
  }
});

router.get("/profile/edit_profile", isAuthenticated, (req, res) => {
  const userId = req.user._id;
  User.findOne({ _id: userId })
    .then(userExist => {
      const messages = req.flash("error");
      res.render("edit_profile", { userExist: userExist, messages: messages });
    })
    .catch(err => {
      req.flash("error", "Cannot find any user. Please try again");
      req.session.save(() => {
        res.redirect("/users/login");
      });
    });
});

router.post("/profile/edit_profile", (req, res) => {
  const { first_name, last_name, email, phone } = req.body;
  if (!first_name || !last_name || !email || !phone) {
    req.flash(
      "error",
      "Please leave the fields as it is, if you do not want to change it "
    );
    req.session.save(() => {
      res.redirect("/users/profile/edit");
    });
  } else {
    User.findOne({ email: email })
      .then(user => {
        (user.first_name = first_name),
          (user.last_name = last_name),
          (user.email = email),
          (user.phone = phone);
        user.save().catch(err => {
          req.flash("error", err);
          req.session.save(() => {
            req.flash("/users/profile/edit");
          });
        });
        res.redirect("/users/profile");
      })
      .catch(err => {
        req.flash("error", err);
        req.session.save(() => {
          res.redirect("/users/profile/change");
        });
      });
  }
});

router.get("/order", isAuthenticated, (req, res) => {
  Order.find({ user: req.user }).then(orders => {
    var cart;
    orders.forEach(order => {
      cart = new Cart(order.cart);
      order.items = cart.generateArray();
    });
    res.render("orders", { orders: orders });
  });
});

router.get("/order/cancel_order/:id", isAuthenticated, (req, res) => {
  const orderId = req.params.id;
  Order.findOne({ _id: orderId })
    .then(order => {
      const messages = req.flash("error");
      res.render("cancel_order", { order: order, messages: messages });
    })
    .catch(err => {
      req.flash("error", `Cannot find order_id: ${orderId}`);
      req.session.save(() => {
        res.redirect(`/users/order/cancel_order/${orderId}`);
      });
    });
});

router.post("/order/cancel_order/:id", (req, res) => {
  const { orderId, status, reason } = req.body;
  if (!reason) {
    req.flash("error", "Please provide a reason");
    req.session.save(() => {
      res.redirect(`/users/order/cancel_order/${orderId}`);
    });
  } else {
    Order.findOneAndUpdate({ _id: orderId }, { status: status }, { new: true })
      .then(() => {
        res.redirect("/users/order");
      })
      .catch(err => {
        req.flash("error", `Cannot find orderId: ${orderId} or ${err}`);
        req.session.save(() => {
          res.redirect(`/users/order/cancel_order/${orderId}`);
        });
      });
  }
});

router.get("/admin", isAuthorized, (req, res) => {
  Order.find().then(orders => {
    var cart;
    orders.forEach(order => {
      cart = new Cart(order.cart);
      order.items = cart.generateArray();
    });
    res.render("admin", { orders: orders });
  });
});

router.get("/admin/status_change/:id", isAuthenticated, (req, res) => {
  let orderId = req.params.id;
  Order.findOne({ _id: orderId })
    .then(order => {
      const messages = req.flash("error");
      res.render("status_change", { order, messages });
    })
    .catch(err => {
      req.flash("error", `Cannot find order_id: ${orderId}`);
      req.session.save(() => {
        res.redirect(`/users/admin/status_change/${orderId}`);
      });
    });
});

router.post("/admin/status_change/:id", (req, res) => {
  let { orderId, status } = req.body;
  Order.findOneAndUpdate({ _id: orderId }, { status }, { new: true })
    .then(() => {
      res.redirect("/users/admin");
    })
    .catch(err => {
      req.flash("error", `Cannot find orderId: ${orderId} or ${err}`);
      req.session.save(() => {
        res.redirect(`/users/admin/status_change/${orderId}`);
      });
    });
});

module.exports = router;
