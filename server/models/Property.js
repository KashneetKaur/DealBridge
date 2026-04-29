const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  propertyType: {
    type: String,
    enum: ["flat", "house", "plot", "villa", "penthouse", "commercial"],
    required: true
  },
  listingType: {
    type: String,
    enum: ["sale", "rent"],
    required: true
  },
  bhk: {
    type: Number,
    default: 0
  },
  area: {
    type: Number,
    required: true
  },
  areaUnit: {
    type: String,
    enum: ["sqft", "sqm", "sqyd"],
    default: "sqft"
  },
  furnishing: {
    type: String,
    enum: ["furnished", "semi-furnished", "unfurnished"],
    default: "unfurnished"
  },
  amenities: [{
    type: String
  }],
  // Location
  city: {
    type: String,
    required: true
  },
  locality: {
    type: String,
    default: ""
  },
  address: {
    type: String,
    default: ""
  },
  pincode: {
    type: String,
    default: ""
  },
  latitude: {
    type: Number,
    default: 0
  },
  longitude: {
    type: Number,
    default: 0
  },
  // Media
  images: [{
    type: String
  }],
  video: {
    type: String,
    default: ""
  },
  // Owner reference
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // Status & flags
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "sold", "rented"],
    default: "pending"
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // Metrics
  views: {
    type: Number,
    default: 0
  },
  // Floor details
  floor: {
    type: Number,
    default: 0
  },
  totalFloors: {
    type: Number,
    default: 0
  },
  // Age
  ageOfProperty: {
    type: String,
    default: "new"
  },
  // Availability
  availableFrom: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
propertySchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

// Text index for search
propertySchema.index({ title: "text", description: "text", city: "text", locality: "text" });

module.exports = mongoose.model("Property", propertySchema);
