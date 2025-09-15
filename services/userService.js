// services/userService.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const generatePassword = require("generate-password");
const { createEmailTemplate } = require("../views/emailTemplate");
const { sendMail } = require("../utils/sendMail");

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

// const login = async ({ email, password, deviceToken, deviceName }, req) => {
//   let user = await Admin.findOne({ email });
//   let role = "admin";

//   if (!user) {
//     user = await User.findOne({ email });
//     role = "user";
//   }

//   if (!user) throw new Error("Invalid email or password");

//   const isMatch = await bcrypt.compare(password, user.password);
//   if (!isMatch) throw new Error("Invalid email or password");

//   // Get IP address from request
//   const ipAddress =
//     req.headers["x-forwarded-for"] || req.connection.remoteAddress;

//   if (!user.firstLoginDevice || !user.firstLoginDevice.deviceToken) {
//     user.firstLoginDevice = {
//       deviceToken,
//       ipAddress,
//       deviceName,
//       loginTime: new Date(),
//     };
//     await user.save();
//   }

//   const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, {
//     expiresIn: "1d",
//   });

//   return { token, user, role };
// };

// services/userService.js
// services/userService.js
const login = async ({ email, password }) => {
  let user = await Admin.findOne({ email });
  let role = "admin";

  if (!user) {
    user = await User.findOne({ email });
    role = "user";
  }

  if (!user) throw new Error("Invalid email or password");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid email or password");

  const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  return { token, user, role };
};

const createUserByAdmin = async (adminId, userData) => {
  const { userName, email, role } = userData;

  if (!userName || !email) {
    throw new Error("userName and email are required");
  }

  // Generate a random password
  const randomPassword = generatePassword.generate({
    length: 8,
    numbers: true,
    symbols: false,
    uppercase: false,
    lowercase: false,
    strict: true,
  });
  const hashedPassword = await bcrypt.hash(randomPassword, 10);

  // Get the next userId
  const lastUser = await User.findOne({ createdBy: adminId })
    .sort({ userId: -1 })
    .select("userId");
  const nextUserId = lastUser ? lastUser.userId + 1 : 1;

  // Create new user
  const newUser = new User({
    userName,
    email,
    role: role || "user",
    userId: nextUserId,
    createdBy: adminId,
    password: hashedPassword,
  });

  await newUser.save();

  // Send email with credentials
  const emailBody = createEmailTemplate(userName, email, randomPassword);
  try {
    await sendMail({
      recipientEmail: email,
      subject: "Your New Account Credentials",
      emailBody,
    });
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error.message);
  }

  return {
    userName: newUser.userName,
    userId: newUser.userId,
    email: newUser.email,
  };
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

module.exports = {
  register,
  login,
  createUserByAdmin,
  getAttendanceByRange,
};
