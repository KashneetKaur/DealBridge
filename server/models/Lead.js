const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: {
    type: String,
    enum: ["new", "contacted", "interested", "converted", "lost"],
    default: "new"
  },
  source: {
    type: String,
    enum: ["contact_form", "chat", "call_request", "visit"],
    default: "contact_form"
  },
  message: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Lead", leadSchema);
