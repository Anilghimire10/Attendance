const ApiResponse = require("../utils/apiResponse");

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const details = error.details.map((err) => err.message);
      return ApiResponse.error(res, details.join(""), 400);
    }
    next();
  };
};

module.exports = validateRequest;
