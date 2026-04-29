const router = require("express").Router();
const Review = require("../models/Review");
const auth = require("../middleware/auth");

// Add review
router.post("/", auth, async (req, res) => {
  try {
    const { property, agent, rating, comment } = req.body;

    const review = new Review({
      user: req.user._id,
      property: property || null,
      agent: agent || null,
      rating,
      comment
    });

    await review.save();
    await review.populate("user", "name avatar");

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get reviews for a property
router.get("/property/:id", async (req, res) => {
  try {
    const reviews = await Review.find({ property: req.params.id })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });

    const avg = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    res.json({ reviews, average: parseFloat(avg), total: reviews.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get reviews for an agent
router.get("/agent/:id", async (req, res) => {
  try {
    const reviews = await Review.find({ agent: req.params.id })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });

    const avg = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    res.json({ reviews, average: parseFloat(avg), total: reviews.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
