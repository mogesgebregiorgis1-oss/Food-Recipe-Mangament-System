const pool = require("../config/db");

const createComment = async (req, res) => {
  try {
    const { recipe_id } = req.params;
    const { comment } = req.body;

    if (!comment || comment.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Comment is required"
      });
    }

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

    const [result] = await pool.query(
      `INSERT INTO comments
       (user_id, recipe_id, comment)
       VALUES (?, ?, ?)`,
      [
        req.user.id,
        recipe_id,
        comment.trim()
      ]
    );

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: {
        id: result.insertId,
        user_id: req.user.id,
        recipe_id: Number(recipe_id),
        comment: comment.trim()
      }
    });

  } catch (error) {
    console.error("Create comment error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const getRecipeComments = async (req, res) => {
  try {
    const { recipe_id } = req.params;

    const [comments] = await pool.query(
      `SELECT
          c.id,
          c.comment,
          c.created_at,
          c.updated_at,

          u.id AS user_id,
          u.name AS user_name,
          u.profile_image

       FROM comments c

       INNER JOIN users u
         ON c.user_id = u.id

       WHERE c.recipe_id = ?

       ORDER BY c.created_at DESC`,
      [recipe_id]
    );

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });

  } catch (error) {
    console.error("Get recipe comments error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const updateComment = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const { comment } = req.body;

    if (!comment || comment.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Comment is required"
      });
    }

    const [comments] = await pool.query(
      `SELECT id
       FROM comments
       WHERE id = ? AND user_id = ?`,
      [
        comment_id,
        req.user.id
      ]
    );

    if (comments.length === 0) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own comment"
      });
    }

    await pool.query(
      `UPDATE comments
       SET comment = ?
       WHERE id = ? AND user_id = ?`,
      [
        comment.trim(),
        comment_id,
        req.user.id
      ]
    );

    res.status(200).json({
      success: true,
      message: "Comment updated successfully"
    });

  } catch (error) {
    console.error("Update comment error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const deleteComment = async (req, res) => {
  try {
    const { comment_id } = req.params;

    const [result] = await pool.query(
      `DELETE FROM comments
       WHERE id = ? AND user_id = ?`,
      [
        comment_id,
        req.user.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own comment"
      });
    }

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully"
    });

  } catch (error) {
    console.error("Delete comment error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


module.exports = {
  createComment,
  getRecipeComments,
  updateComment,
  deleteComment
};