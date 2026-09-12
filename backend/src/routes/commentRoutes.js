const express = require("express");

const {
  createComment,
  getRecipeComments,
  updateComment,
  deleteComment
} = require("../controllers/commentController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/recipe/:recipe_id", getRecipeComments);

router.post("/recipe/:recipe_id", protect, createComment);

router.put("/:comment_id", protect, updateComment);

router.delete("/:comment_id", protect, deleteComment);

module.exports = router;