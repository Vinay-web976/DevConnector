const express = require("express");

const router = express.Router();

// @route GET api/profile
// @desc test
// @access public

router.get("/", (req, res) => res.send("Hi from profile route"));

module.exports = router;
