const pool = require("../config/db");

const addIngredients = async (req, res) => {
  try {
    const { recipe_id, ingredients } = req.body;

    if (!recipe_id || !Array.isArray(ingredients)) {
      return res.status(400).json({
        success: false,
        message: "Recipe ID and ingredients array are required"
      });
    }

    if (ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one ingredient is required"
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

    for (const ingredient of ingredients) {
      if (!ingredient.name) {
        return res.status(400).json({
          success: false,
          message: "Every ingredient must have a name"
        });
      }
    }

    const insertedIngredients = [];

    for (const ingredient of ingredients) {
      const [result] = await pool.query(
        `INSERT INTO ingredients
         (recipe_id, name, quantity, unit)
         VALUES (?, ?, ?, ?)`,
        [
          recipe_id,
          ingredient.name,
          ingredient.quantity || null,
          ingredient.unit || null
        ]
      );

      insertedIngredients.push({
        id: result.insertId,
        recipe_id,
        name: ingredient.name,
        quantity: ingredient.quantity || null,
        unit: ingredient.unit || null
      });
    }


    res.status(201).json({
      success: true,
      message: "Ingredients added successfully",
      data: insertedIngredients
    });

  } catch (error) {
    console.error("Add ingredients error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const getRecipeIngredients = async (req, res) => {
  try {
    const { recipe_id } = req.params;

    const [ingredients] = await pool.query(
      `SELECT
        id,
        recipe_id,
        name,
        quantity,
        unit,
        created_at
       FROM ingredients
       WHERE recipe_id = ?
       ORDER BY id ASC`,
      [recipe_id]
    );

    res.status(200).json({
      success: true,
      count: ingredients.length,
      data: ingredients
    });

  } catch (error) {
    console.error("Get ingredients error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


module.exports = {
  addIngredients,
  getRecipeIngredients
};