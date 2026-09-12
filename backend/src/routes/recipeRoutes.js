const express = require("express");

const {
  createRecipe,
  getAllRecipes,
  getRecipeById
} = require("../controllers/recipeController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


router.post("/", protect, createRecipe);

router.get("/", getAllRecipes);

router.get("/:id", getRecipeById);

module.exports = router;