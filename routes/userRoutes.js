// routes/userRoutes.js
const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleWare");
const validateRequest = require("../middlewares/validateRequest");
const {
  registerSchema,
  loginSchema,
  createUserSchema,
} = require("../validations/userValidation");
const router = express.Router();

router.post(
  "/register",
  validateRequest(registerSchema),
  userController.register
);
router.post("/login", validateRequest(loginSchema), userController.login);

router.post(
  "/create",
  authMiddleware("admin"),
  validateRequest(createUserSchema),
  userController.createUserByAdmin
);
router.get(
  "/attendance",
  authMiddleware("admin"),
  userController.getAttendance
);

module.exports = router;
