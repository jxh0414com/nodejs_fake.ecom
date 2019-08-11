const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");
const captializeInputs = require("../public/js/capitalizeInputs");
const sendRegisterSuccess = require("../emails/register_success");

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(
  "local.register",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true
    },
    function(req, email, password, done) {
      req
        .checkBody("email", "Invalid Email")
        .notEmpty()
        .isEmail();
      req.checkBody("password", "Invalid Password").notEmpty();
      req
        .checkBody("first_name", "First name field cannot be blank")
        .notEmpty();
      req.checkBody("last_name", "Last name field cannot be blank").notEmpty();
      req.checkBody("phone", "Phone field cannot be blank").notEmpty();
      req
        .checkBody("passwordConfirm", "Password must match")
        .notEmpty()
        .equals(password);

      const errors = req.validationErrors();

      if (errors && errors.length > 0) {
        const messages = [];
        errors.forEach(function(error) {
          messages.push(error.msg);
        });
        return req.session.save(() => {
          done(null, false, req.flash("error", messages));
        });
      }

      User.findOne({ email: email }, function(err, user) {
        if (err) {
          return done(err);
        }
        if (user) {
          return done(null, false, {
            message: "This Email is not available/ has already been used"
          });
        }
        const newUser = new User();
        newUser.email = email;
        newUser.password = newUser.HashedPassword(password);
        newUser.first_name = captializeInputs(req.body.first_name);
        newUser.last_name = captializeInputs(req.body.last_name);
        newUser.phone = req.body.phone;
        newUser.save(function(err, result) {
          if (err) {
            return done(err);
          }
          sendRegisterSuccess(newUser);
          return done(null, newUser);
        });
      });
    }
  )
);

passport.use(
  "local.login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true
    },
    function(req, email, password, done) {
      req
        .checkBody("email", "Invalid Email")
        .notEmpty()
        .isEmail();
      req.checkBody("password", "Invalid Password").notEmpty();

      const errors = req.validationErrors();

      if (errors) {
        const messages = [];
        errors.forEach(function(error) {
          messages.push(error.msg);
        });
        return req.session.save(() => {
          done(null, false, req.flash("error", messages));
        });
      }

      User.findOne({ email: email }, function(err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, {
            message: "Invalid credentials"
          });
        }
        if (!user.isMatchedPassword(password)) {
          return done(null, false, {
            message: "Invalid credentials"
          });
        }
        return done(null, user);
      });
    }
  )
);
