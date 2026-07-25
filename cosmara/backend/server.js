const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log(" MongoDB Connected");
  })
  .catch((err) => {
    console.log(" MongoDB Connection Error:", err);
  });

app.get("/", (req, res) => {
  res.send("Welcome to the COSEMARA Backend!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});