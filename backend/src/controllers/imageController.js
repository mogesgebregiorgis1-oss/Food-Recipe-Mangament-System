const pool = require("../config/db");

const uploadRecipeImages = async (req, res) => {
  try {
    const { recipe_id } = req.body;

    if (!recipe_id) {
      return res.status(400).json({
        success: false,
        message: "Recipe ID is required"
      });
    }

    const [recipes] = await pool.query(
      `SELECT id
       FROM recipes
       WHERE id = ? AND user_id = ?`,
      [recipe_id, req.user.id]
    );

    if (recipes.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Recipe not found or you are not allowed to modify it"
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one image"
      });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      const imageUrl = `/uploads/${file.filename}`;

      const [result] = await pool.query(
        `INSERT INTO recipe_images
         (recipe_id, image_url, is_featured)
         VALUES (?, ?, ?)`,
        [recipe_id, imageUrl, false]
      );

      uploadedImages.push({
        id: result.insertId,
        recipe_id,
        image_url: imageUrl,
        is_featured: false
      });
    }

    res.status(201).json({
      success: true,
      message: "Recipe images uploaded successfully",
      data: uploadedImages
    });

  } catch (error) {
    console.error("Upload recipe images error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const getRecipeImages = async (req, res) => {
  try {
    const { recipe_id } = req.params;

    const [images] = await pool.query(
      `SELECT
        id,
        recipe_id,
        image_url,
        is_featured,
        created_at
       FROM recipe_images
       WHERE recipe_id = ?
       ORDER BY is_featured DESC, created_at ASC`,
      [recipe_id]
    );

    res.status(200).json({
      success: true,
      count: images.length,
      data: images
    });

  } catch (error) {
    console.error("Get recipe images error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
const setFeaturedImage = async (req, res) => {
  try {
    const { image_id } = req.params;

    // 1. Find the image and its recipe
    const [images] = await pool.query(
      `SELECT
        ri.id,
        ri.recipe_id
       FROM recipe_images ri
       INNER JOIN recipes r
         ON ri.recipe_id = r.id
       WHERE ri.id = ?
         AND r.user_id = ?`,
      [image_id, req.user.id]
    );

    if (images.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Image not found or you are not allowed to modify it"
      });
    }

    const recipeId = images[0].recipe_id;

    // 2. Remove featured status from all images
    await pool.query(
      `UPDATE recipe_images
       SET is_featured = FALSE
       WHERE recipe_id = ?`,
      [recipeId]
    );

    // 3. Make the selected image featured
    await pool.query(
      `UPDATE recipe_images
       SET is_featured = TRUE
       WHERE id = ?`,
      [image_id]
    );

    res.status(200).json({
      success: true,
      message: "Featured image updated successfully"
    });

  } catch (error) {
    console.error("Set featured image error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  uploadRecipeImages,
  getRecipeImages,
  setFeaturedImage
};