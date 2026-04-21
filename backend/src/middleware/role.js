const { sendError } = require('../utils/apiResponse');

/**
 * Role-based access control middleware factory
 * @param  {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required.');
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Role '${req.user.role}' is not authorized to access this resource.`
      );
    }

    next();
  };
};

/**
 * Check resource ownership - user can only access their own resources unless admin
 */
const ownerOrAdmin = (resourceUserField = 'createdBy') => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required.');
    }

    if (req.user.role === 'admin') return next();

    // Will be validated in controller after fetching resource
    req.checkOwnership = true;
    req.ownerField = resourceUserField;
    next();
  };
};

module.exports = { authorize, ownerOrAdmin };
