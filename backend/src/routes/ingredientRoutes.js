const express = require("express");

const {
  addIngredients,
  getRecipeIngredients
} = require("../controllers/ingredientController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, addIngredients);

router.get("/:recipe_id", getRecipeIngredients);

module.exports = router;