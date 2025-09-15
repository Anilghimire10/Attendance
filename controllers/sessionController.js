const { createSession } = require("../services/sessionService");

const generateSession = async (req, res) => {
  try {
    const sessionId = `session-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 8)}`;

    const session = createSession(sessionId);

    res.json({
      success: true,
      sessionId,
      expiresAt: session.expiresAt.toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to create session",
      details: err.message,
    });
  }
};

const healthCheck = (req, res) => {
  const mongoose = require("mongoose");
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    dbStatus:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
};

module.exports = {
  generateSession,
  healthCheck,
};
