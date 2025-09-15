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

module.exports = {
  getDailyAttendance,
  markAttendance,
};
