const pool = require("../config/db");

// Bookmark a recipe
const bookmarkRecipe = async (req, res) => {
  try {
    const { recipe_id } = req.params;

    // Check if recipe exists
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

    // Check if already bookmarked
    const [existingBookmarks] = await pool.query(
      `SELECT id
       FROM bookmarks
       WHERE user_id = ? AND recipe_id = ?`,
      [req.user.id, recipe_id]
    );

    if (existingBookmarks.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Recipe already bookmarked"
      });
    }

    // Create bookmark
    const [result] = await pool.query(
      `INSERT INTO bookmarks
       (user_id, recipe_id)
       VALUES (?, ?)`,
      [req.user.id, recipe_id]
    );

    res.status(201).json({
      success: true,
      message: "Recipe bookmarked successfully",
      data: {
        id: result.insertId,
        user_id: req.user.id,
        recipe_id: Number(recipe_id)
      }
    });

  } catch (error) {
    console.error("Bookmark recipe error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// Remove bookmark
const unbookmarkRecipe = async (req, res) => {
  try {
    const { recipe_id } = req.params;

    const [result] = await pool.query(
      `DELETE FROM bookmarks
       WHERE user_id = ? AND recipe_id = ?`,
      [req.user.id, recipe_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Bookmark not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Recipe removed from bookmarks"
    });

  } catch (error) {
    console.error("Unbookmark recipe error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// Check whether current user bookmarked a recipe
const checkBookmarkStatus = async (req, res) => {
  try {
    const { recipe_id } = req.params;

    const [bookmarks] = await pool.query(
      `SELECT id
       FROM bookmarks
       WHERE user_id = ? AND recipe_id = ?`,
      [req.user.id, recipe_id]
    );

    res.status(200).json({
      success: true,
      data: {
        bookmarked: bookmarks.length > 0
      }
    });

  } catch (error) {
    console.error("Check bookmark status error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// Get all bookmarks belonging to current user
const getMyBookmarks = async (req, res) => {
  try {
    const [bookmarks] = await pool.query(
      `SELECT
          b.id AS bookmark_id,
          b.created_at AS bookmarked_at,

          r.id AS recipe_id,
          r.title,
          r.description,
          r.preparation_time,

          c.id AS category_id,
          c.name AS category_name,

          u.id AS creator_id,
          u.name AS creator_name

       FROM bookmarks b

       INNER JOIN recipes r
         ON b.recipe_id = r.id

       INNER JOIN categories c
         ON r.category_id = c.id

       INNER JOIN users u
         ON r.user_id = u.id

       WHERE b.user_id = ?

       ORDER BY b.created_at DESC`,
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      count: bookmarks.length,
      data: bookmarks
    });

  } catch (error) {
    console.error("Get my bookmarks error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


module.exports = {
  bookmarkRecipe,
  unbookmarkRecipe,
  checkBookmarkStatus,
  getMyBookmarks
};