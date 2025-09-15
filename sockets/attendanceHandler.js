const { sessionExists } = require("../services/sessionService");
const {
  getDailyAttendance,
  markAttendance,
} = require("../controllers/attendanceController");
const User = require("../models/User");

const handleAttendanceSockets = (io) => {
  io.on("connection", (socket) => {
    socket.on("join_attendance", async ({ sessionId }) => {
      if (!sessionId || typeof sessionId !== "string") {
        socket.emit("error", {
          message: "Invalid session ID format",
          code: "INVALID_SESSION_ID",
        });
        return;
      }

      if (!sessionExists(sessionId)) {
        socket.emit("error", {
          message: "Session not found or expired",
          code: "SESSION_NOT_FOUND",
        });
        return;
      }

      try {
        socket.join(sessionId);

        const attendance = await getDailyAttendance(sessionId);
        socket.emit("current_attendance", {
          success: true,
          data: attendance,
          count: attendance.length,
        });
      } catch (err) {
        socket.emit("error", {
          message: "Failed to join session",
          code: "JOIN_ERROR",
          details: err.message,
        });
      }
    });

    socket.on("qr_scanned", async ({ sessionId, user }) => {
      if (!sessionId || !user || !user.id) {
        socket.emit("error", {
          message: "Invalid attendance data",
          code: "INVALID_DATA",
        });
        return;
      }
      try {
        if (!sessionExists(sessionId)) {
          throw new Error("Invalid session ID");
        }

        const existingUser = await User.findOne({ userId: user.id });
        if (!existingUser) {
          socket.emit("error", {
            message: `User with ID ${user.id} not found`,
            code: "USER_NOT_FOUND",
          });
          return;
        }

        const attendance = await markAttendance(sessionId, {
          id: existingUser.userId,
          name: existingUser.userName,
        });

        io.to(sessionId).emit("mark_attendance", {
          success: true,
          user: {
            id: existingUser.userId,
            name: existingUser.userName,
          },
          checkIn: attendance.checkIn,
        });

        const updatedAttendance = await getDailyAttendance(sessionId);
        io.to(sessionId).emit("current_attendance", {
          success: true,
          data: updatedAttendance,
          count: updatedAttendance.length,
        });
      } catch (err) {
        socket.emit("error", {
          message: err.message || "Failed to save attendance",
          code: "ATTENDANCE_ERROR",
          details: err.message,
        });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`Client disconnected (${socket.id}):`, reason);
    });
  });
};

module.exports = handleAttendanceSockets;
