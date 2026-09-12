const pool = require("../config/db");

const likeRecipe = async (req, res) => {
  try {
    const { recipe_id } = req.params;

    const [recipes] = await pool.query(
      "SELECT id FROM recipes WHERE id = ?",
      [recipe_id]
    );

    if (recipes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found"
      });
    }

    const [existingLikes] = await pool.query(
      `SELECT id
       FROM likes
       WHERE user_id = ? AND recipe_id = ?`,
      [req.user.id, recipe_id]
    );

    if (existingLikes.length > 0) {
      return res.status(409).json({
        success: false,
        message: "You already liked this recipe"
      });
    }

    const [result] = await pool.query(
      `INSERT INTO likes
       (user_id, recipe_id)
       VALUES (?, ?)`,
      [req.user.id, recipe_id]
    );

    res.status(201).json({
      success: true,
      message: "Recipe liked successfully",
      data: {
        id: result.insertId,
        user_id: req.user.id,
        recipe_id: Number(recipe_id)
      }
    });

  } catch (error) {
    console.error("Like recipe error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const unlikeRecipe = async (req, res) => {
  try {
    const { recipe_id } = req.params;

    const [result] = await pool.query(
      `DELETE FROM likes
       WHERE user_id = ? AND recipe_id = ?`,
      [req.user.id, recipe_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Like not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Recipe unliked successfully"
    });

  } catch (error) {
    console.error("Unlike recipe error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const getRecipeLikes = async (req, res) => {
  try {
    const { recipe_id } = req.params;

    const [result] = await pool.query(
      `SELECT COUNT(*) AS like_count
       FROM likes
       WHERE recipe_id = ?`,
      [recipe_id]
    );

    res.status(200).json({
      success: true,
      data: {
        recipe_id: Number(recipe_id),
        like_count: result[0].like_count
      }
    });

  } catch (error) {
    console.error("Get recipe likes error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const checkUserLike = async (req, res) => {
  try {
    const { recipe_id } = req.params;

    const [likes] = await pool.query(
      `SELECT id
       FROM likes
       WHERE user_id = ? AND recipe_id = ?`,
      [req.user.id, recipe_id]
    );

    res.status(200).json({
      success: true,
      data: {
        liked: likes.length > 0
      }
    });

  } catch (error) {
    console.error("Check user like error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


module.exports = {
  likeRecipe,
  unlikeRecipe,
  getRecipeLikes,
  checkUserLike
};