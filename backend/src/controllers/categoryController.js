const pool = require("../config/db");

const getAllCategories = async (req, res) => {
  try {
    const [categories] = await pool.query(`
      SELECT
        id,
        name,
        description,
        image,
        created_at
      FROM categories
      ORDER BY name ASC
    `);

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });

  } catch (error) {
    console.error("Get categories error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  getAllCategories
};