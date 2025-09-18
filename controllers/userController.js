const userService = require("../services/userService");
const ApiResponse = require("../utils/apiResponse");

const register = async (req, res) => {
  try {
    const user = await userService.register(req.body);
    return ApiResponse.success(res, "User registered successfully", user, 201);
  } catch (error) {
    return ApiResponse.error(res, `Failed to register: ${error.message}`, 400);
  }
};

const login = async (req, res) => {
  try {
    const userAgent = req.headers["user-agent"] || "Unknown";
    const deviceToken = req.body.deviceToken;
    const { token, user, role } = await userService.login({
      ...req.body,
      deviceToken,
      userAgent,
    });
    return ApiResponse.success(
      res,
      "Login successful",
      { token, user, role },
      200
    );
  } catch (error) {
    return ApiResponse.error(res, `Login failed: ${error.message}`, 400);
  }
};

const createUserByAdmin = async (req, res) => {
  try {
    const adminId = req.user.id;
    const userData = req.body;

    const user = await userService.createUserByAdmin(adminId, userData);

    return ApiResponse.success(res, "User created successfully", user, 201);
  } catch (error) {
    return ApiResponse.error(
      res,
      `Failed to create user: ${error.message}`,
      500
    );
  }
};

const getAttendance = async (req, res) => {
  try {
    const adminId = req.user.id;
    const filters = {
      userId: req.query.userId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      sessionId: req.query.sessionId,
    };

    const attendanceData = await userService.getAttendanceByRange(
      adminId,
      filters
    );

    return ApiResponse.success(
      res,
      "Attendance retrieved successfully",
      attendanceData,
      200
    );
  } catch (error) {
    return ApiResponse.error(
      res,
      `Failed to retrieve attendance: ${error.message}`,
      500
    );
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;

    // Check if userId exists
    if (!userId) {
      return ApiResponse.error(res, "User ID not found", 401);
    }

    const user = await userService.getProfile(userId);
    return ApiResponse.success(res, "User Fetched Successfully", user, 200);
  } catch (error) {
    return ApiResponse.error(
      res,
      `Failed to get the user profile: ${error.message}`,
      500
    );
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return ApiResponse.error(res, "Email is required", 400);
    }

    await userService.forgotPassword(email);
    return ApiResponse.success(
      res,
      "If an account with that email exists, a password reset link has been sent",
      null,
      200
    );
  } catch (error) {
    return ApiResponse.error(res, error.message, 400);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!code || !newPassword) {
      return ApiResponse.error(res, "Token and new password are required", 400);
    }

    if (newPassword.length < 6) {
      return ApiResponse.error(
        res,
        "Password must be at least 6 characters long",
        400
      );
    }

    await userService.resetPassword(email, code, newPassword);
    return ApiResponse.success(res, "Password reset successfully", null, 200);
  } catch (error) {
    return ApiResponse.error(res, error.message, 400);
  }
};
module.exports = {
  register,
  login,
  createUserByAdmin,
  getAttendance,
  getProfile,
  forgotPassword,
  resetPassword,
};
