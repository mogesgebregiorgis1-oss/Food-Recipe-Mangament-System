const pool = require("../config/db");

const createRecipe = async (req, res) => {
  try {
    const {
      title,
      description,
      preparation_time,
      category_id
    } = req.body;

    if (
      !title ||
      !description ||
      !preparation_time ||
      !category_id
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, preparation time, and category are required"
      });
    }

   
    const [categories] = await pool.query(
      "SELECT id FROM categories WHERE id = ?",
      [category_id]
    );

    if (categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Category not found"
      });
    }

    
    const [result] = await pool.query(
      `INSERT INTO recipes
       (user_id, category_id, title, description, preparation_time)
       VALUES (?, ?, ?, ?, ?)`,
      [
        req.user.id,
        category_id,
        title,
        description,
        preparation_time
      ]
    );

    res.status(201).json({
      success: true,
      message: "Recipe created successfully",
      data: {
        id: result.insertId,
        user_id: req.user.id,
        category_id,
        title,
        description,
        preparation_time
      }
    });

  } catch (error) {
    console.error("Create recipe error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  createRecipe
};