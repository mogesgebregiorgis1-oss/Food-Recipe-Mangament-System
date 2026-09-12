const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const path = require("path");


const authRoutes = require("./routes/authRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const imageRoutes = require("./routes/imageRoutes");
const ingredientRoutes = require("./routes/ingredientRoutes");
const stepRoutes = require("./routes/stepRoutes");
const likeRoutes = require("./routes/likeRoutes");
const app = express();

app.use(cors());
app.use(express.json());

app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);

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


app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/recipe-images", imageRoutes);
app.use("/api/ingredients", ingredientRoutes);
app.use("/api/recipe-steps", stepRoutes);
app.use("/api/likes", likeRoutes);

module.exports = app;