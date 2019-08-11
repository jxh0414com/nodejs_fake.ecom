// Access Control
module.exports = function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("error", "Please login before moving forward");
    res.redirect("/users/login");
  }
};
