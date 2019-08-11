const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const validator = require("express-validator");
const MongoStore = require("connect-mongo")(session);

// Init App
const app = express();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true })
  .then(() => console.log("Mongo Connected!"))
  .catch(err => console.log(err));
require("./configs/passport");

// View Engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// Validator Middleware, validator only after parse
app.use(validator());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 180 * 60 * 1000 }
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Set Static Folder
app.use("/public", express.static("public"));

app.get("*", function(req, res, next) {
  res.locals.user = req.isAuthenticated() || null;
  res.locals.session = req.session;
  next();
});

app.use("/", require("./routes/basic"));
app.use("/products", require("./routes/products"));
app.use("/users", require("./routes/users"));
app.use("/carts", require("./routes/carts"));

// Setup a port/server
app.listen(process.env.PORT || 5000, () => console.log("Server started!"));
