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
const getAllRecipes = async (req, res) => {
  try {
    const {
      search,
      category_id,
      max_time,
      ingredient
    } = req.query;

    let sql = `
      SELECT DISTINCT
        r.id,
        r.title,
        r.description,
        r.preparation_time,
        r.created_at,
        r.updated_at,

        u.id AS creator_id,
        u.name AS creator_name,

        c.id AS category_id,
        c.name AS category_name

      FROM recipes r

      INNER JOIN users u
        ON r.user_id = u.id

      INNER JOIN categories c
        ON r.category_id = c.id
    `;

    const conditions = [];
    const values = [];

    // Search by recipe title
    if (search) {
      conditions.push(`r.title LIKE ?`);
      values.push(`%${search}%`);
    }

    // Filter by category
    if (category_id) {
      conditions.push(`r.category_id = ?`);
      values.push(category_id);
    }

    // Filter by maximum preparation time
    if (max_time) {
      conditions.push(`r.preparation_time <= ?`);
      values.push(max_time);
    }

    // Filter by ingredient
    if (ingredient) {
      sql += `
        INNER JOIN ingredients i
          ON r.id = i.recipe_id
      `;

      conditions.push(`i.name LIKE ?`);
      values.push(`%${ingredient}%`);
    }

    // Add WHERE if there are conditions
    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(" AND ");
    }

    // Latest recipes first
    sql += ` ORDER BY r.created_at DESC`;

    const [recipes] = await pool.query(sql, values);

    res.status(200).json({
      success: true,
      count: recipes.length,
      data: recipes
    });

  } catch (error) {
    console.error("Get all recipes error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;

    const [recipes] = await pool.query(
      `
      SELECT
        r.id,
        r.title,
        r.description,
        r.preparation_time,
        r.created_at,
        r.updated_at,

        u.id AS creator_id,
        u.name AS creator_name,
        u.profile_image AS creator_image,

        c.id AS category_id,
        c.name AS category_name,
        c.description AS category_description

      FROM recipes r

      INNER JOIN users u
        ON r.user_id = u.id

      INNER JOIN categories c
        ON r.category_id = c.id

      WHERE r.id = ?
      `,
      [id]
    );

    if (recipes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found"
      });
    }

    res.status(200).json({
      success: true,
      data: recipes[0]
    });

  } catch (error) {
    console.error("Get recipe by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;

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

    const [recipes] = await pool.query(
      `SELECT id
       FROM recipes
       WHERE id = ? AND user_id = ?`,
      [id, req.user.id]
    );

    if (recipes.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Recipe not found or you are not allowed to update it"
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

    await pool.query(
      `UPDATE recipes
       SET title = ?,
           description = ?,
           preparation_time = ?,
           category_id = ?
       WHERE id = ? AND user_id = ?`,
      [
        title,
        description,
        preparation_time,
        category_id,
        id,
        req.user.id
      ]
    );

    res.status(200).json({
      success: true,
      message: "Recipe updated successfully"
    });

  } catch (error) {
    console.error("Update recipe error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    const [recipes] = await pool.query(
      `SELECT id
       FROM recipes
       WHERE id = ? AND user_id = ?`,
      [id, req.user.id]
    );

    if (recipes.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Recipe not found or you are not allowed to delete it"
      });
    }

    await pool.query(
      `DELETE FROM recipes
       WHERE id = ? AND user_id = ?`,
      [id, req.user.id]
    );

    res.status(200).json({
      success: true,
      message: "Recipe deleted successfully"
    });

  } catch (error) {
    console.error("Delete recipe error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  createRecipe,
  getAllRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe
};