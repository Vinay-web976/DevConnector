const express = require("express");
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");
const config = require("config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const router = express.Router();

// @route GET api/auth
// @desc to get user details
// @access public

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ msg: "Error while getting userdata" });
  }
});

// @route POST api/auth
// @desc to get jwt after login
// @access public

router.post(
  "/",
  [
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err)
            return res
              .status(400)
              .json({ errors: [{ msg: "error while creating jwt" }] });
          res.json({ token });
        }
      );
    } catch (err) {
      console.log(err);
      res.status(500).json({ errors: [{ msg: "Server Error" }] });
    }
  }
);

module.exports = router;
