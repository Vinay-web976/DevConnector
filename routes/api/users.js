const express = require("express");

const router = express.Router();

// @route GET api/users
// @desc test
// @access public

router.get("/", (req, res) => res.send("Hi from user route"));

module.exports = router;
