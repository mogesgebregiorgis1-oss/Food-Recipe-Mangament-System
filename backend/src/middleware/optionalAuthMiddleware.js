const jwt = require("jsonwebtoken");

const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // No token → continue as a public user
    if (!authHeader) {
      return next();
    }

    const parts = authHeader.split(" ");

    // Token was provided but format is wrong
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format"
      });
    }

    const token = parts[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Store logged-in user information
    req.user = decoded;

    next();

  } catch (error) {
    console.error(
      "Optional authentication error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

module.exports = optionalAuth;