const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required"
      });
    }

    const [existingUsers] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES (?, ?, ?)`,
      [name, email, hashedPassword]
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: result.insertId,
        name,
        email
      }
    });

  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  register
};