const roles = require("../config/role");

const authorize = (minRoleLevel) => {
  return (req, res, next) => {
    const userRoleLevel = roles[req.user.access_level];

    if (userRoleLevel < minRoleLevel) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};

module.exports = authorize;