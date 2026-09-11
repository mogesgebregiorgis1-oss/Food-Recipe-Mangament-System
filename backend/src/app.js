const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Food Recipes API is running"
  });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS result");

    res.json({
      success: true,
      message: "Database is working",
      data: rows
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Database test failed"
    });
  }
});

// Authentication routes
app.use("/api/auth", authRoutes);

module.exports = app;