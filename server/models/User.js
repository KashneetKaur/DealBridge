const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    default: ""
  },
  role: {
    type: String,
    enum: ["buyer", "seller", "agent", "admin"],
    default: "buyer"
  },
  avatar: {
    type: String,
    default: ""
  },
  bio: {
    type: String,
    default: ""
  },
  city: {
    type: String,
    default: ""
  },
  verified: {
    type: Boolean,
    default: false
  },
  subscription: {
    type: String,
    enum: ["free", "basic", "premium"],
    default: "free"
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property"
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model("User", userSchema);
