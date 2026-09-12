const express = require("express");

const {
  createRecipe,
  getAllRecipes
} = require("../controllers/recipeController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


router.post("/", protect, createRecipe);

router.get("/", getAllRecipes);


module.exports = router;