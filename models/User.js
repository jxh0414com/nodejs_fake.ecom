const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true
    },
    last_name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    resetToken: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

UserSchema.methods.HashedPassword = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10, null));
};

UserSchema.methods.isMatchedPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = User = mongoose.model("User", UserSchema);
