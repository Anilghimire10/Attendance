const Attendance = require("../models/Attendance");

const getDailyAttendance = async (sessionId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      sessionId,
      date: { $gte: today },
    })
      .lean()
      .exec();

    return attendance ? attendance.users : [];
  } catch (err) {
    throw err;
  }
};

const markAttendance = async (sessionId, user) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({
      sessionId,
      date: { $gte: today },
    });

    if (!attendance) {
      attendance = new Attendance({
        sessionId,
        date: today,
        users: [],
      });
    }

    const existingUser = attendance.users.find(
      (u) => u.userId === user.id.toString()
    );

    if (existingUser) {
      throw new Error("User already checked in today");
    }

    const newUserAttendance = {
      userId: user.id.toString(),
      userName: user.name,
      checkIn: new Date(),
    };

    attendance.users.push(newUserAttendance);
    await attendance.save();

    return {
      sessionId: attendance.sessionId,
      userId: newUserAttendance.userId,
      userName: newUserAttendance.userName,
      checkIn: newUserAttendance.checkIn,
      date: attendance.date,
    };
  } catch (err) {
    throw err;
  }
};

const markCheckout = async (sessionId, userId) => {
  try {
    const attendance = await Attendance.findOne({ sessionId });

    if (!attendance) {
      throw new Error("Attendance session not found");
    }

    const userIndex = attendance.users.findIndex((u) => u.userId === userId);

    if (userIndex === -1) {
      throw new Error(
        "User not found in attendance record. Please check in first."
      );
    }

    const user = attendance.users[userIndex];

    if (user.status === "checked-out") {
      throw new Error("User is already checked out");
    }

    user.checkOut = new Date();
    user.status = "checked-out";

    await attendance.save();

    return {
      userId: user.userId,
      userName: user.userName,
      checkIn: user.checkIn,
      checkOut: user.checkOut,
      status: user.status,
    };
  } catch (error) {
    throw new Error(error.message || "Failed to mark checkout");
  }
};

module.exports = {
  getDailyAttendance,
  markAttendance,
  markCheckout,
};
