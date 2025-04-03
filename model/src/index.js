echo 'const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Mathematical LLM Model API is running" });
});

app.post("/api/solve", (req, res) => {
  // This will be implemented later
  res.json({ 
    message: "Problem received, solver not yet implemented",
    problem: req.body.problem
  });
});

app.listen(PORT, () => {
  console.log(`Model API server running on port ${PORT}`);
});' > src/index.js