const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  //Get token from header
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ msg: "Access denied, Not authorised" });
  }

  //Verify the token
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    req.user = decoded.user;
    next();
  } catch (error) {
    console.log(error.message);
    res.status(401).json({ msg: "Invalid token" });
  }
};
