// routes/userRoutes.js
const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleWare");
const router = express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post(
  "/create",
  authMiddleware("admin"),
  userController.createUserByAdmin
);

router.get(
  "/attendance",
  authMiddleware("admin"),
  userController.getAttendance
);

module.exports = router;
