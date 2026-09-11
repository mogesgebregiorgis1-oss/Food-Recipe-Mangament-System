require("dotenv").config();

const app = require("./src/app");
const pool = require("./src/config/db");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const connection = await pool.getConnection();

    console.log("MySQL database connected successfully.");

    connection.release();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:");
    console.error(error.message);

    process.exit(1);
  }
}

startServer();