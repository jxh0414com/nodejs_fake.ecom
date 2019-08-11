// Access Control
module.exports = function isAuthorized(req, res, next) {
  if (req.isAuthenticated() && req.user._id == process.env.ADMIN) {
    return next();
  } else {
    req.logout();
    req.flash(
      "error",
      "You're forced to logout. You are not authorized to that route. Don't even try again"
    );
    res.redirect("/users/login");
  }
};
