const express = require("express");

const {
  createRecipe,
  getAllRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe
} = require("../controllers/recipeController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


router.post("/", protect, createRecipe);

router.get("/", getAllRecipes);

router.get("/:id", getRecipeById);

router.put("/:id", protect, updateRecipe);

router.delete("/:id", protect, deleteRecipe);

module.exports = router;