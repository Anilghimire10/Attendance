const { sessionExists } = require("../services/sessionService");
const {
  getDailyAttendance,
  markAttendance,
  markCheckout,
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

    socket.on("qr_scanned", async ({ sessionId, user, action = "checkin" }) => {
      if (!sessionId || !user || !user.userId) {
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

        const existingUser = await User.findOne({ userId: user.userId });
        if (!existingUser) {
          socket.emit("error", {
            message: `User with ID ${user.userId} not found`,
            code: "USER_NOT_FOUND",
          });
          return;
        }

        let result;
        let eventType;

        if (action === "checkout") {
          result = await markCheckout(sessionId, existingUser.userId);
          eventType = "mark_checkout";

          io.to(sessionId).emit(eventType, {
            success: true,
            user: {
              id: existingUser.userId,
              name: existingUser.userName,
            },
            checkOut: result.checkOut,
            status: result.status,
          });
        } else {
          result = await markAttendance(sessionId, {
            id: existingUser.userId,
            name: existingUser.userName,
          });
          eventType = "mark_attendance";

          io.to(sessionId).emit(eventType, {
            success: true,
            user: {
              id: existingUser.userId,
              name: existingUser.userName,
            },
            checkIn: result.checkIn,
            status: result.status,
          });
        }

        const updatedAttendance = await getDailyAttendance(sessionId);

        io.to(sessionId).emit("current_attendance", {
          success: true,
          data: updatedAttendance,
          count: updatedAttendance.length,
        });
      } catch (err) {
        socket.emit("error", {
          message: err.message || "Failed to process attendance",
          code: "ATTENDANCE_ERROR",
          details: err.message,
        });
      }
    });

    socket.on("checkout_request", async ({ sessionId, userId }) => {
      if (!sessionId || !userId) {
        socket.emit("error", {
          message: "Invalid checkout data",
          code: "INVALID_DATA",
        });
        return;
      }

      try {
        if (!sessionExists(sessionId)) {
          throw new Error("Invalid session ID");
        }

        const existingUser = await User.findOne({ userId: userId });
        if (!existingUser) {
          socket.emit("error", {
            message: `User with ID ${userId} not found`,
            code: "USER_NOT_FOUND",
          });
          return;
        }

        const result = await markCheckout(sessionId, userId);

        io.to(sessionId).emit("mark_checkout", {
          success: true,
          user: {
            id: existingUser.userId,
            name: existingUser.userName,
          },
          checkOut: result.checkOut,
          status: result.status,
        });

        const updatedAttendance = await getDailyAttendance(sessionId);

        io.to(sessionId).emit("current_attendance", {
          success: true,
          data: updatedAttendance,
          count: updatedAttendance.length,
        });
      } catch (err) {
        socket.emit("error", {
          message: err.message || "Failed to checkout",
          code: "CHECKOUT_ERROR",
          details: err.message,
        });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(` Client disconnected (${socket.id}):`, {
        reason,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on("error", (error) => {
      console.error(` Socket error for client ${socket.id}:`, error);
    });
  });
};

module.exports = handleAttendanceSockets;
