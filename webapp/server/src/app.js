const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

// Import routes
const mathRoutes = require("./routes/mathRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Health check route
app.get("/", (req, res) => {
  res.json({
    message: "Mathematical LLM Webapp API is running",
    version: "0.1.0",
  });
});

// Register routes
app.use("/api/math", mathRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Webapp server running on port ${PORT}`);
});

module.exports = app;
