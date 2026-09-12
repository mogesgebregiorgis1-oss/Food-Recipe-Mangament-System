const express = require("express");

const {
  uploadRecipeImages,
  getRecipeImages,
  setFeaturedImage
} = require("../controllers/imageController");

const protect = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  upload.array("images", 10),
  uploadRecipeImages
);

router.get("/:recipe_id", getRecipeImages);

router.put(
  "/:image_id/featured",
  protect,
  setFeaturedImage
);

module.exports = router;