const pool = require("../config/db");

const rateRecipe = async (req, res) => {
  try {
    const { recipe_id } = req.params;
    const { rating } = req.body;

    if (
      rating === undefined ||
      rating === null ||
      !Number.isInteger(Number(rating)) ||
      Number(rating) < 1 ||
      Number(rating) > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5"
      });
    }

    const ratingValue = Number(rating);

    const [recipes] = await pool.query(
      `SELECT id
       FROM recipes
       WHERE id = ?`,
      [recipe_id]
    );

    if (recipes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found"
      });
    }

    const [existingRatings] = await pool.query(
      `SELECT id
       FROM ratings
       WHERE user_id = ? AND recipe_id = ?`,
      [req.user.id, recipe_id]
    );

    if (existingRatings.length > 0) {
      await pool.query(
        `UPDATE ratings
         SET rating = ?
         WHERE user_id = ? AND recipe_id = ?`,
        [
          ratingValue,
          req.user.id,
          recipe_id
        ]
      );

      return res.status(200).json({
        success: true,
        message: "Rating updated successfully",
        data: {
          rating: ratingValue
        }
      });
    }

    
    const [result] = await pool.query(
      `INSERT INTO ratings
       (user_id, recipe_id, rating)
       VALUES (?, ?, ?)`,
      [
        req.user.id,
        recipe_id,
        ratingValue
      ]
    );

    res.status(201).json({
      success: true,
      message: "Recipe rated successfully",
      data: {
        id: result.insertId,
        user_id: req.user.id,
        recipe_id: Number(recipe_id),
        rating: ratingValue
      }
    });

  } catch (error) {
    console.error("Rate recipe error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const getRecipeRating = async (req, res) => {
  try {
    const { recipe_id } = req.params;

    const [result] = await pool.query(
      `SELECT
          COUNT(*) AS rating_count,
          COALESCE(AVG(rating), 0) AS average_rating
       FROM ratings
       WHERE recipe_id = ?`,
      [recipe_id]
    );

    res.status(200).json({
      success: true,
      data: {
        recipe_id: Number(recipe_id),
        rating_count: Number(result[0].rating_count),
        average_rating: Number(
          Number(result[0].average_rating).toFixed(2)
        )
      }
    });

  } catch (error) {
    console.error("Get recipe rating error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const getMyRating = async (req, res) => {
  try {
    const { recipe_id } = req.params;

    const [ratings] = await pool.query(
      `SELECT rating
       FROM ratings
       WHERE user_id = ? AND recipe_id = ?`,
      [
        req.user.id,
        recipe_id
      ]
    );

    res.status(200).json({
      success: true,
      data: {
        rated: ratings.length > 0,
        rating: ratings.length > 0
          ? ratings[0].rating
          : null
      }
    });

  } catch (error) {
    console.error("Get my rating error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const deleteRating = async (req, res) => {
  try {
    const { recipe_id } = req.params;

    const [result] = await pool.query(
      `DELETE FROM ratings
       WHERE user_id = ? AND recipe_id = ?`,
      [
        req.user.id,
        recipe_id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Rating not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Rating removed successfully"
    });

  } catch (error) {
    console.error("Delete rating error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


module.exports = {
  rateRecipe,
  getRecipeRating,
  getMyRating,
  deleteRating
};