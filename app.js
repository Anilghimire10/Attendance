const express = require("express");
const cors = require("cors");
const path = require("path");

// Create Express app
const app = express();

// Apply middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", require("./routes"));

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    error: "Internal server error",
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Serve static files (fallback)
app.use(express.static(path.join(__dirname, "public")));

module.exports = app;
