const express = require("express");

const {
  addRecipeSteps,
  getRecipeSteps
} = require("../controllers/stepController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, addRecipeSteps);

router.get("/:recipe_id", getRecipeSteps);

module.exports = router;