// services/userService.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const User = require("../models/User");
const Attendance = require("../models/Attendance");

const register = async (userData) => {
  const { userName, email, password } = userData;

  const existingUser = await Admin.findOne({ email });
  if (existingUser) {
    throw new Error("Email already in use");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new Admin({
    userName,
    email,
    password: hashedPassword,
  });

  await newUser.save();
  return newUser;
};

const login = async ({ email, password }) => {
  const user = await Admin.findOne({ email });
  if (!user) throw new Error("Invalid email or password");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid email or password");

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return { token, user };
};

const createUserByAdmin = async (adminId, userData) => {
  const { userName, role } = userData;

  const lastUser = await User.findOne({ createdBy: adminId })
    .sort({ userId: -1 })
    .select("userId");

  const nextUserId = lastUser ? lastUser.userId + 1 : 1;

  const newUser = new User({
    userName,
    role: role || "user",
    userId: nextUserId,
    createdBy: adminId,
  });

  await newUser.save();

  return { userName: newUser.userName, userId: newUser.userId };
};

const getAttendanceByRange = async (adminId, filters) => {
  try {
    const { userId, startDate, endDate, sessionId } = filters;

    // Build query
    let query = {};

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Session filter
    if (sessionId) {
      query.sessionId = sessionId;
    }

    // Find attendance records
    let attendanceRecords = await Attendance.find(query)
      .sort({ date: -1 })
      .lean();

    // Filter by userId if provided
    if (userId) {
      attendanceRecords = attendanceRecords
        .map((record) => ({
          ...record,
          users: record.users.filter(
            (user) => user.userId === userId.toString()
          ),
        }))
        .filter((record) => record.users.length > 0);
    }

    // Format response
    const formattedRecords = attendanceRecords.map((record) => ({
      sessionId: record.sessionId,
      date: record.date,
      totalUsers: record.users.length,
      users: record.users.map((user) => ({
        userId: user.userId,
        userName: user.userName,
        checkIn: user.checkIn,
        checkInTime: new Date(user.checkIn).toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        }),
      })),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }));

    // Calculate summary statistics
    const totalSessions = formattedRecords.length;
    const totalAttendances = formattedRecords.reduce(
      (sum, record) => sum + record.totalUsers,
      0
    );
    const uniqueUsers = [
      ...new Set(
        formattedRecords.flatMap((record) =>
          record.users.map((user) => user.userId)
        )
      ),
    ].length;

    return {
      summary: {
        totalSessions,
        totalAttendances,
        uniqueUsers,
        dateRange: {
          from: startDate || "All time",
          to: endDate || "Present",
        },
      },
      records: formattedRecords,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = { register, login, createUserByAdmin, getAttendanceByRange };
