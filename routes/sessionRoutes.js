const express = require("express");
const router = express.Router();

const sessionController = require("../controllers/sessionController");

router.get("/generate-session", sessionController.generateSession);

module.exports = router;
