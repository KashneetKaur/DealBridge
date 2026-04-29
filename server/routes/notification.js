const router = require("express").Router();
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 }).limit(50);
    const unread = await Notification.countDocuments({ user: req.user._id, read: false });
    res.json({ notifications, unread });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/read", auth, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: "Marked as read." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/read-all", auth, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.json({ message: "All marked as read." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
