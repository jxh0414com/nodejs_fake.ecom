// Access Control

module.exports = function unAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/");
  }
};
