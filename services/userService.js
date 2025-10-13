const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const generatePassword = require("generate-password");
const { createEmailTemplate } = require("../views/emailTemplate");
const { sendMail } = require("../utils/sendMail");

const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const register = async (userData) => {
  const { userName, email, password } = userData;

  const existingUser = await Admin.findOne({ email });
  if (existingUser) {
    throw new Error("Email already in use");
  }

  const newUser = new Admin({
    userName,
    email,
    password,
  });

  await newUser.save();
  return newUser;
};

const login = async ({ email, password, deviceToken, userAgent }) => {
  let user = await Admin.findOne({ email });
  let role = "admin";

  if (!user) {
    user = await User.findOne({ email });
    role = "user";
  }

  if (!user) throw new Error("Invalid email or password");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid email or password");

  const loginToken = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  if (deviceToken) {
    user.device.push({ token: deviceToken, userAgent });
    await user.save();
  }

  return { token: loginToken, user, role };
};

const createUserByAdmin = async (adminId, userData) => {
  const { userName, email, role, designation } = userData;

  if (!userName || !email) {
    throw new Error("userName and email are required");
  }

  const randomPassword = generatePassword.generate({
    length: 8,
    numbers: true,
    symbols: false,
    uppercase: false,
    lowercase: false,
    strict: true,
  });

  const lastUser = await User.findOne({ createdBy: adminId })
    .sort({ userId: -1 })
    .select("userId");

  const nextUserId = lastUser ? lastUser.userId + 1 : 1;

  const newUser = new User({
    userName,
    email,
    role: role || "user",
    userId: nextUserId,
    createdBy: adminId,
    password: randomPassword,
    designation,
  });

  await newUser.save();

  const emailBody = createEmailTemplate(userName, email, randomPassword);
  try {
    await sendMail({
      recipientEmail: email,
      subject: "Welcome! Your New Account Credentials",
      emailBody,
    });
  } catch (error) {
    throw new Error(`Failed to send email to ${email}: ${error.message}`);
  }

  return {
    userName: newUser.userName,
    userId: newUser.userId,
    email: newUser.email,
    designation: newUser.designation,
  };
};

// const getAttendanceByRange = async (adminId, filters) => {
//   try {
//     const { userId, startDate, endDate, sessionId } = filters;

//     let query = {};

//     if (startDate || endDate) {
//       query.date = {};
//       if (startDate) {
//         const start = new Date(startDate);
//         start.setHours(0, 0, 0, 0);
//         query.date.$gte = start;
//       }
//       if (endDate) {
//         const end = new Date(endDate);
//         end.setHours(23, 59, 59, 999);
//         query.date.$lte = end;
//       }
//     }

//     if (sessionId) {
//       query.sessionId = sessionId;
//     }

//     let attendanceRecords = await Attendance.find(query)
//       .sort({ date: -1 })
//       .lean();

//     if (userId) {
//       attendanceRecords = attendanceRecords
//         .map((record) => ({
//           ...record,
//           users: record.users.filter(
//             (user) => user.userId === userId.toString()
//           ),
//         }))
//         .filter((record) => record.users.length > 0);
//     }

//     const formattedRecords = attendanceRecords.map((record) => ({
//       sessionId: record.sessionId,
//       date: record.date,
//       totalUsers: record.users.length,
//       users: record.users.map((user) => ({
//         userId: user.userId,
//         userName: user.userName,
//         checkIn: user.checkIn,
//         checkInTime: new Date(user.checkIn).toLocaleTimeString("en-US", {
//           hour12: false,
//           hour: "2-digit",
//           minute: "2-digit",
//         }),
//         checkOut: user.checkOut,
//         checkOutTime: user.checkOut
//           ? new Date(user.checkOut).toLocaleTimeString("en-US", {
//               hour12: false,
//               hour: "2-digit",
//               minute: "2-digit",
//             })
//           : null,
//       })),
//       createdAt: record.createdAt,
//       updatedAt: record.updatedAt,
//     }));

//     const totalSessions = formattedRecords.length;
//     const totalAttendances = formattedRecords.reduce(
//       (sum, record) => sum + record.totalUsers,
//       0
//     );
//     const uniqueUsers = [
//       ...new Set(
//         formattedRecords.flatMap((record) =>
//           record.users.map((user) => user.userId)
//         )
//       ),
//     ].length;

//     return {
//       summary: {
//         totalSessions,
//         totalAttendances,
//         uniqueUsers,
//         dateRange: {
//           from: startDate || "All time",
//           to: endDate || "Present",
//         },
//       },
//       records: formattedRecords,
//     };
//   } catch (error) {
//     throw error;
//   }
// };

const getAttendanceByRange = async (adminId, filters) => {
  try {
    const { userId, startDate, endDate, sessionId } = filters;

    let query = {};

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

    if (sessionId) {
      query.sessionId = sessionId;
    }

    let attendanceRecords = await Attendance.find(query)
      .sort({ date: -1 })
      .lean();

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
        checkOut: user.checkOut,
        checkOutTime: user.checkOut
          ? new Date(user.checkOut).toLocaleTimeString("en-US", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            })
          : null,
      })),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }));

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

    const totalEmployees = await User.countDocuments({
      createdBy: adminId,
    });

    return {
      summary: {
        totalSessions,
        totalAttendances,
        uniqueUsers,
        totalEmployees,
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

const getProfile = async (userId) => {
  try {
    let user = await User.findById(userId).select("userName email userId role");
    if (user) return user.toObject();

    let admin = await Admin.findById(userId).select("userName email role");
    if (admin) return admin.toObject();

    throw new Error("User not found");
  } catch (error) {
    throw error;
  }
};

const forgotPassword = async (email) => {
  try {
    let user = await Admin.findOne({ email });
    let role = "admin";

    if (!user) {
      user = await User.findOne({ email });
      role = "user";
    }

    if (!user) {
      throw new Error(
        "If an account with that email exists, a reset code has been sent"
      );
    }

    const resetCode = generateResetCode();
    const hashedCode = await bcrypt.hash(resetCode, 10);

    user.resetPasswordCode = hashedCode;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const emailBody = createEmailTemplate(
      user.userName,
      email,
      null,
      resetCode
    );
    await sendMail({
      recipientEmail: email,
      subject: "🔒 Password Reset Code",
      emailBody,
    });

    return { message: "Password reset code sent" };
  } catch (error) {
    throw new Error(`Failed to send reset code: ${error.message}`);
  }
};

const resetPassword = async (email, code, newPassword) => {
  try {
    let user =
      (await Admin.findOne({
        email,
        resetPasswordExpires: { $gt: Date.now() },
      })) ||
      (await User.findOne({
        email,
        resetPasswordExpires: { $gt: Date.now() },
      }));

    if (!user) {
      throw new Error("Invalid or expired reset code");
    }

    const isMatch = await bcrypt.compare(code, user.resetPasswordCode);
    if (!isMatch) {
      throw new Error("Invalid reset code");
    }

    user.password = newPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: "Password reset successfully" };
  } catch (error) {
    throw new Error(`Failed to reset password: ${error.message}`);
  }
};

module.exports = {
  register,
  login,
  createUserByAdmin,
  getAttendanceByRange,
  getProfile,
  forgotPassword,
  resetPassword,
};
