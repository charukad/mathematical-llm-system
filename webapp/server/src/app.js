const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5012;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Mathematical LLM Webapp API is running" });
});

app.listen(PORT, () => {
  console.log(`Webapp server running on port ${PORT}`);
});
