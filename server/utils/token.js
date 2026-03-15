const jwt = require("jsonwebtoken");

exports.generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      access_level: user.access_level
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d"
    }
  );
};