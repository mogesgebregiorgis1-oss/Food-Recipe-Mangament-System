const express = require("express");

const {
  createRecipe,
  getAllRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  getRecipeDetails
} = require("../controllers/recipeController");

const protect = require("../middleware/authMiddleware");
const optionalAuth = require("../middleware/optionalAuthMiddleware");

const router = express.Router();


router.post("/", protect, createRecipe);

router.get("/", getAllRecipes);

router.get(
  "/:id/details",
  optionalAuth,
  getRecipeDetails
);

router.get("/:id", getRecipeById);

router.put("/:id", protect, updateRecipe);

router.delete("/:id", protect, deleteRecipe);

module.exports = router;