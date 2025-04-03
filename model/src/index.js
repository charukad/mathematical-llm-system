const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Import routes
const mathRoutes = require("./api/routes");

app.use(cors());
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.json({
    message: "Mathematical LLM Model API is running",
    version: "0.1.0",
  });
});

// Register API routes
app.use("/api", mathRoutes);

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
  console.log(`Model API server running on port ${PORT}`);

  // Pre-initialize the model in the background
  const modelManager = require("./llm/model_manager");
  modelManager
    .initialize()
    .then((success) => {
      if (success) {
        console.log("Model pre-initialization completed successfully");
      } else {
        console.warn("Model pre-initialization failed");
      }
    })
    .catch((err) => {
      console.error("Error during model pre-initialization:", err);
    });
});
