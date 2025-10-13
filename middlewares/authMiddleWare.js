const jwt = require("jsonwebtoken");
const ApiResponse = require("../utils/apiResponse");

const authMiddleware =
  (roles = []) =>
  (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return ApiResponse.error(res, "Access denied, token missing", 401);
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return ApiResponse.error(res, "Invalid token format", 401);
    }

    const token = parts[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      // console.log(decoded);

      if (roles.length && !roles.includes(decoded.role)) {
        return ApiResponse.error(res, "Unauthorized, role mismatch", 403);
      }

      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return ApiResponse.error(res, "Token expired", 401);
      } else if (err.name === "JsonWebTokenError") {
        return ApiResponse.error(res, "Invalid token", 401);
      }
      return ApiResponse.error(res, "Unauthorized", 401);
    }
  };

module.exports = authMiddleware;
