const mongoose = require("mongoose");

const User = 
  mongoose.Schema({
    email: {
      type: String,
      required: true,
      unique: true,
      // match: [/.+@.+\..+/, "Please enter a valid email address"],
      minlength: 5,
      maxlength: 255,
    },
    password: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 255,
      // match: [/.+@.+\..+/, "Please enter a valid password"],
    },
    // confirmPassword: {
    //   type: String,
    //   required: true,
    //   minlength: 3,
    //   maxlength: 255,
    //   // match: [/.+@.+\..+/, "Please enter a valid password"],
    // },
    created_on: { type: Date, default: Date.now },
  })

module.exports = mongoose.model('User',User);