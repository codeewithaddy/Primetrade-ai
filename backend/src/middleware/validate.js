const { validationResult } = require('express-validator');
const { sendError } = require('../utils/apiResponse');

/**
 * Run validation rules and return 422 if any fail
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return sendError(res, 422, 'Validation failed', formattedErrors);
  }
  next();
};

module.exports = { validate };
