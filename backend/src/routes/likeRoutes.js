const express = require("express");

const {
  likeRecipe,
  unlikeRecipe,
  getRecipeLikes,
  checkUserLike
} = require("../controllers/likeController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/:recipe_id", protect, likeRecipe);

router.delete("/:recipe_id", protect, unlikeRecipe);

router.get("/:recipe_id", getRecipeLikes);

router.get("/:recipe_id/status", protect, checkUserLike);

module.exports = router;