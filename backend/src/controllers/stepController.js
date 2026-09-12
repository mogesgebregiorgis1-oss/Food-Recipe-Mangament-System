const pool = require("../config/db");

const addRecipeSteps = async (req, res) => {
  try {
    const { recipe_id, steps } = req.body;

    // 1. Validate request
    if (!recipe_id || !Array.isArray(steps)) {
      return res.status(400).json({
        success: false,
        message: "Recipe ID and steps array are required"
      });
    }

    if (steps.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one preparation step is required"
      });
    }

    // 2. Check recipe ownership
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

    // 3. Validate every step
    for (const step of steps) {
      if (!step.instruction) {
        return res.status(400).json({
          success: false,
          message: "Every step must have an instruction"
        });
      }
    }

    // 4. Insert steps
    const insertedSteps = [];

    for (let i = 0; i < steps.length; i++) {
      const stepNumber = i + 1;

      const [result] = await pool.query(
        `INSERT INTO recipe_steps
         (recipe_id, step_number, instruction)
         VALUES (?, ?, ?)`,
        [
          recipe_id,
          stepNumber,
          steps[i].instruction
        ]
      );

      insertedSteps.push({
        id: result.insertId,
        recipe_id,
        step_number: stepNumber,
        instruction: steps[i].instruction
      });
    }

    // 5. Response
    res.status(201).json({
      success: true,
      message: "Recipe steps added successfully",
      data: insertedSteps
    });

  } catch (error) {
    console.error("Add recipe steps error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const getRecipeSteps = async (req, res) => {
  try {
    const { recipe_id } = req.params;

    const [steps] = await pool.query(
      `SELECT
        id,
        recipe_id,
        step_number,
        instruction,
        created_at
       FROM recipe_steps
       WHERE recipe_id = ?
       ORDER BY step_number ASC`,
      [recipe_id]
    );

    res.status(200).json({
      success: true,
      count: steps.length,
      data: steps
    });

  } catch (error) {
    console.error("Get recipe steps error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


module.exports = {
  addRecipeSteps,
  getRecipeSteps
};