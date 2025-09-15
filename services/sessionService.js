const activeSessions = new Map();

setInterval(() => {
  const now = new Date();
  for (const [sessionId, session] of activeSessions.entries()) {
    if (session.expiresAt < now) {
      activeSessions.delete(sessionId);
    }
  }
}, 3600000);

const createSession = (sessionId) => {
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);

  activeSessions.set(sessionId, {
    createdAt: new Date(),
    expiresAt,
  });

  return { sessionId, expiresAt };
};

const getSession = (sessionId) => {
  return activeSessions.get(sessionId);
};

const sessionExists = (sessionId) => {
  return activeSessions.has(sessionId);
};

module.exports = {
  createSession,
  getSession,
  sessionExists,
};
