const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadsDir));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/property", require("./routes/property"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/review", require("./routes/review"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/booking", require("./routes/booking"));
app.use("/api/notification", require("./routes/notification"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Serve React frontend in production
const clientBuild = path.join(__dirname, "../client/dist");
if (fs.existsSync(clientBuild)) {
  app.use(express.static(clientBuild));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuild, "index.html"));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(process.env.PORT, () => {
      console.log(`BuildBridge server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.log("MongoDB Connection Error:", err));
