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
      ingredient,
      page = 1,
      limit = 10,
      sort = "newest"
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (
      !Number.isInteger(pageNumber) ||
      pageNumber < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Page must be a positive integer"
      });
    }

    if (
      !Number.isInteger(limitNumber) ||
      limitNumber < 1 ||
      limitNumber > 50
    ) {
      return res.status(400).json({
        success: false,
        message: "Limit must be between 1 and 50"
      });
    }

    const offset = (pageNumber - 1) * limitNumber;

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

    if (search) {
      conditions.push(`r.title LIKE ?`);
      values.push(`%${search}%`);
    }

    if (category_id) {
      conditions.push(`r.category_id = ?`);
      values.push(category_id);
    }

    if (max_time) {
      conditions.push(`r.preparation_time <= ?`);
      values.push(max_time);
    }

    if (ingredient) {
      sql += `
        INNER JOIN ingredients i
          ON r.id = i.recipe_id
      `;

      conditions.push(`i.name LIKE ?`);
      values.push(`%${ingredient}%`);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(" AND ");
    }

    switch (sort) {
      case "oldest":
        sql += ` ORDER BY r.created_at ASC`;
        break;

      case "time_asc":
        sql += ` ORDER BY r.preparation_time ASC`;
        break;

      case "time_desc":
        sql += ` ORDER BY r.preparation_time DESC`;
        break;

      case "newest":
      default:
        sql += ` ORDER BY r.created_at DESC`;
        break;
    }

    sql += ` LIMIT ? OFFSET ?`;

    values.push(limitNumber, offset);

    const [recipes] = await pool.query(
      sql,
      values
    );

    let countSql = `
      SELECT COUNT(DISTINCT r.id) AS total
      FROM recipes r

      INNER JOIN users u
        ON r.user_id = u.id

      INNER JOIN categories c
        ON r.category_id = c.id
    `;

    const countConditions = [];
    const countValues = [];

    if (search) {
      countConditions.push(`r.title LIKE ?`);
      countValues.push(`%${search}%`);
    }

    if (category_id) {
      countConditions.push(`r.category_id = ?`);
      countValues.push(category_id);
    }

    if (max_time) {
      countConditions.push(`r.preparation_time <= ?`);
      countValues.push(max_time);
    }

    if (ingredient) {
      countSql += `
        INNER JOIN ingredients i
          ON r.id = i.recipe_id
      `;

      countConditions.push(`i.name LIKE ?`);
      countValues.push(`%${ingredient}%`);
    }

    if (countConditions.length > 0) {
      countSql += ` WHERE ` + countConditions.join(" AND ");
    }

    const [countResult] = await pool.query(
      countSql,
      countValues
    );

    const totalRecipes = Number(
      countResult[0].total
    );

    const totalPages = Math.ceil(
      totalRecipes / limitNumber
    );

    res.status(200).json({
      success: true,

      pagination: {
        current_page: pageNumber,
        per_page: limitNumber,
        total_items: totalRecipes,
        total_pages: totalPages,
        has_next_page: pageNumber < totalPages,
        has_previous_page: pageNumber > 1
      },

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