const router = require("express").Router();
const Chat = require("../models/Chat");
const auth = require("../middleware/auth");

// Start or get existing conversation
router.post("/start", auth, async (req, res) => {
  try {
    const { recipientId, propertyId } = req.body;

    // Check if conversation already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, recipientId] },
      property: propertyId || null
    }).populate("participants", "name avatar role")
      .populate("property", "title images price");

    if (chat) {
      return res.json(chat);
    }

    // Create new conversation
    chat = new Chat({
      participants: [req.user._id, recipientId],
      property: propertyId || null,
      messages: []
    });

    await chat.save();
    await chat.populate("participants", "name avatar role");
    if (propertyId) await chat.populate("property", "title images price");

    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's conversations
router.get("/", auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id
    })
      .populate("participants", "name avatar role")
      .populate("property", "title images price")
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get messages in a conversation
router.get("/:id", auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate("participants", "name avatar role")
      .populate("property", "title images price")
      .populate("messages.sender", "name avatar");

    if (!chat) {
      return res.status(404).json({ error: "Conversation not found." });
    }

    // Check if user is a participant
    const isParticipant = chat.participants.some(
      p => p._id.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ error: "Not authorized." });
    }

    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send message
router.post("/:id/message", auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ error: "Conversation not found." });
    }

    const message = {
      sender: req.user._id,
      text: req.body.text
    };

    chat.messages.push(message);
    chat.lastMessage = req.body.text;
    await chat.save();

    // Get the populated message
    await chat.populate("messages.sender", "name avatar");
    const newMessage = chat.messages[chat.messages.length - 1];

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
