const express = require("express");

const {
  createRecipe,
  getAllRecipes,
  getRecipeById,
  updateRecipe
} = require("../controllers/recipeController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


router.post("/", protect, createRecipe);

router.get("/", getAllRecipes);

router.get("/:id", getRecipeById);

router.put("/:id", protect, updateRecipe);


module.exports = router;