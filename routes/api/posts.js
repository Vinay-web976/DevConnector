const express = require("express");

const router = express.Router();

// @route GET api/posts
// @desc test
// @access public

router.get("/", (req, res) => res.send("Hi from posts route"));

module.exports = router;
