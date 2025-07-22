const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      minlength: 3
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"],
    },
    studentId: {
      type: String,
      required: false,
      trim: true,
      minlength: 3,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },
    expoPushToken: {
      type: String,
      default: null,
    },
    lastLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    credibility: {
      type: Number,
      default: 10, // Starting credibility score
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
