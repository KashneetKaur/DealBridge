const router = require("express").Router();
const Booking = require("../models/Booking");
const auth = require("../middleware/auth");

router.post("/", auth, async (req, res) => {
  try {
    const { property, owner, date, time, notes } = req.body;
    const booking = new Booking({
      user: req.user._id, property, owner, date, time, notes: notes || ""
    });
    await booking.save();
    await booking.populate("property", "title images price city");
    await booking.populate("user", "name email phone");
    await booking.populate("owner", "name email phone");
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({
      $or: [{ user: req.user._id }, { owner: req.user._id }]
    })
      .populate("property", "title images price city")
      .populate("user", "name email phone avatar")
      .populate("owner", "name email phone avatar")
      .sort({ date: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found." });
    booking.status = req.body.status;
    await booking.save();
    await booking.populate("property", "title images price city");
    await booking.populate("user", "name email phone avatar");
    await booking.populate("owner", "name email phone avatar");
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
