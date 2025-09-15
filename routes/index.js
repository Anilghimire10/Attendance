const express = require("express");
const router = express.Router();

const userRoutes = require("../routes/userRoutes");
const sessionRoutes = require("../routes/sessionRoutes");

router.use("/user", userRoutes);
router.use("/session", sessionRoutes);

module.exports = router;
