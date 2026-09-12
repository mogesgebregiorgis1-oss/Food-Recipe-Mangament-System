const express = require("express");

const {
  bookmarkRecipe,
  unbookmarkRecipe,
  checkBookmarkStatus,
  getMyBookmarks
} = require("../controllers/bookmarkController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Get current user's bookmarks
router.get("/", protect, getMyBookmarks);

// Check bookmark status
router.get("/:recipe_id/status", protect, checkBookmarkStatus);

// Bookmark recipe
router.post("/:recipe_id", protect, bookmarkRecipe);

// Remove bookmark
router.delete("/:recipe_id", protect, unbookmarkRecipe);

module.exports = router;