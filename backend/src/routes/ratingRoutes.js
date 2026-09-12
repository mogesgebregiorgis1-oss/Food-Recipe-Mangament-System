const express = require("express");

const {
  rateRecipe,
  getRecipeRating,
  getMyRating,
  deleteRating
} = require("../controllers/ratingController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:recipe_id", getRecipeRating);

router.get("/:recipe_id/my-rating", protect, getMyRating);

router.post("/:recipe_id", protect, rateRecipe);

router.delete("/:recipe_id", protect, deleteRating);

module.exports = router;