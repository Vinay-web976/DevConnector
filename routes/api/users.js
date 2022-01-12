const express = require("express");
const { check, validationResult } = require("express-validator");
const config = require("config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");
const User = require("../../models/User");
const router = express.Router();

// @route POST api/users
// @desc TO register route
// @access public

router.post(
  "/",
  [
    check("name", "Please enter a name").not().isEmpty(),
    check("email", "Please enter a valid email").isEmail(),
    check(
      "password",
      " Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }

      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
        protocol: "https",
      });
      user = new User({
        name,
        email,
        password,
        avatar,
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

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
