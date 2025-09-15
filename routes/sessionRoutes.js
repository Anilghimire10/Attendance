const express = require("express");
const router = express.Router();

const sessionController = require("../controllers/sessionController");

router.get("/generate-session", sessionController.generateSession);
router.get("/health", sessionController.healthCheck);

module.exports = router;
