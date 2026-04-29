const router = require("express").Router();
const User = require("../models/User");
const Property = require("../models/Property");
const Lead = require("../models/Lead");
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

// Admin middleware
const adminAuth = [auth, roleCheck("admin")];

// Dashboard stats
router.get("/stats", adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProperties = await Property.countDocuments();
    const pendingProperties = await Property.countDocuments({ status: "pending" });
    const approvedProperties = await Property.countDocuments({ status: "approved" });
    const totalLeads = await Lead.countDocuments();

    // User breakdown by role
    const buyers = await User.countDocuments({ role: "buyer" });
    const sellers = await User.countDocuments({ role: "seller" });
    const agents = await User.countDocuments({ role: "agent" });

    // Recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email role createdAt");

    // Recent properties
    const recentProperties = await Property.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("owner", "name email")
      .select("title price city status createdAt");

    res.json({
      totalUsers,
      totalProperties,
      pendingProperties,
      approvedProperties,
      totalLeads,
      userBreakdown: { buyers, sellers, agents },
      recentUsers,
      recentProperties
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users
router.get("/users", adminAuth, async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    let query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { email: new RegExp(search, "i") }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user
router.put("/users/:id", adminAuth, async (req, res) => {
  try {
    const { role, verified } = req.body;
    const updates = {};
    if (role) updates.role = role;
    if (verified !== undefined) updates.verified = verified;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return res.status(404).json({ error: "User not found." });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user
router.delete("/users/:id", adminAuth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all properties (admin view - all statuses)
router.get("/properties", adminAuth, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    let query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { city: new RegExp(search, "i") }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Property.countDocuments(query);
    const properties = await Property.find(query)
      .populate("owner", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ properties, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve property
router.put("/properties/:id/approve", adminAuth, async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { status: "approved", isVerified: true },
      { new: true }
    ).populate("owner", "name email");

    if (!property) return res.status(404).json({ error: "Property not found." });
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject property
router.put("/properties/:id/reject", adminAuth, async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    ).populate("owner", "name email");

    if (!property) return res.status(404).json({ error: "Property not found." });
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle featured
router.put("/properties/:id/feature", adminAuth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: "Property not found." });

    property.isFeatured = !property.isFeatured;
    await property.save();

    res.json(property);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
