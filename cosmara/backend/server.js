const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));
app.use("/api/auth", authRoutes);
console.log("Auth routes Loaded");

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
  res.send("Welcome to the COSMARA Backend!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
