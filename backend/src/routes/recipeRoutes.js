const express = require("express");

const {
  createRecipe
} = require("../controllers/recipeController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


router.post("/", protect, createRecipe);

module.exports = router;