const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: [true, "Session ID is required"],
      trim: true,
      unique: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    users: [
      {
        userId: {
          type: String,
          required: [true, "User ID is required"],
          trim: true,
        },
        userName: {
          type: String,
          required: [true, "User name is required"],
          trim: true,
        },
        checkIn: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

attendanceSchema.index({ "users.userId": 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
