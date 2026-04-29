const router = require("express").Router();
const Property = require("../models/Property");
const User = require("../models/User");
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const upload = require("../middleware/upload");

// Get all properties (with search, filter, pagination)
router.get("/", async (req, res) => {
  try {
    const {
      search, city, propertyType, listingType,
      bhk, furnishing, minPrice, maxPrice,
      minArea, maxArea, amenities,
      sort, page = 1, limit = 12,
      status = "approved"
    } = req.query;

    let query = { status };

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Filters
    if (city) query.city = new RegExp(city, "i");
    if (propertyType) query.propertyType = propertyType;
    if (listingType) query.listingType = listingType;
    if (bhk) query.bhk = parseInt(bhk);
    if (furnishing) query.furnishing = furnishing;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }

    if (minArea || maxArea) {
      query.area = {};
      if (minArea) query.area.$gte = parseInt(minArea);
      if (maxArea) query.area.$lte = parseInt(maxArea);
    }

    if (amenities) {
      const amenityList = amenities.split(",");
      query.amenities = { $all: amenityList };
    }

    // Sort
    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };
    if (sort === "popular") sortOption = { views: -1 };
    if (sort === "newest") sortOption = { createdAt: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Property.countDocuments(query);
    const properties = await Property.find(query)
      .populate("owner", "name email phone avatar role")
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      properties,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get featured properties
router.get("/featured", async (req, res) => {
  try {
    const properties = await Property.find({ isFeatured: true, status: "approved" })
      .populate("owner", "name email phone avatar role")
      .sort({ createdAt: -1 })
      .limit(8);
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get my listings
router.get("/my-listings", auth, async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id })
      .sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user favorites
router.get("/favorites", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "favorites",
      populate: { path: "owner", select: "name email phone avatar" }
    });
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single property
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate("owner", "name email phone avatar role bio city");

    if (!property) {
      return res.status(404).json({ error: "Property not found." });
    }

    // Increment view count
    property.views += 1;
    await property.save();

    res.json(property);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add property
router.post("/add", auth, roleCheck("seller", "agent", "admin"), upload.array("images", 10), async (req, res) => {
  try {
    const propertyData = { ...req.body, owner: req.user._id };

    // Handle amenities if sent as comma-separated string
    if (typeof propertyData.amenities === "string") {
      propertyData.amenities = propertyData.amenities.split(",").map(a => a.trim());
    }

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      propertyData.images = req.files.map(f => `/uploads/${f.filename}`);
    }

    // Auto-approve for admin
    if (req.user.role === "admin") {
      propertyData.status = "approved";
    }

    const property = new Property(propertyData);
    await property.save();
    await property.populate("owner", "name email phone avatar");

    res.status(201).json(property);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update property
router.put("/:id", auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ error: "Property not found." });
    }

    // Only owner or admin can update
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized." });
    }

    const updates = { ...req.body };
    if (typeof updates.amenities === "string") {
      updates.amenities = updates.amenities.split(",").map(a => a.trim());
    }

    const updated = await Property.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate("owner", "name email phone avatar");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete property
router.delete("/:id", auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ error: "Property not found." });
    }

    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized." });
    }

    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: "Property deleted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle favorite
router.post("/:id/favorite", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const propertyId = req.params.id;

    const index = user.favorites.indexOf(propertyId);
    if (index > -1) {
      user.favorites.splice(index, 1);
    } else {
      user.favorites.push(propertyId);
    }

    await user.save();
    res.json({ favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
