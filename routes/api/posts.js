const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const Profile = require("../../models/Profile");
const Post = require("../../models/Post");

// @route POST api/posts
// @desc To add new posts
// @access private

router.post(
  "/",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id);

      const newPost = new Post({
        user: req.user.id,
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
      });

      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ errors: [{ msg: "Server Error" }] });
    }
  }
);

// @route GET api/posts
// @desc To get all posts
// @access Private

router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ errors: [{ msg: "Server Error" }] });
  }
});

// @route GET api/posts/:post_id
// @desc To get post by id
// @access Private

router.get("/:post_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    if (!post) {
      return res.status(400).json({ msg: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    console.log(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "Post not found" });
    }
    res.status(500).json({ errors: [{ msg: "Server Error" }] });
  }
});

// @route DELETE api/posts/:post_id
// @desc To delete post by id
// @access Private

router.delete("/:post_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    if (!post) {
      return res.status(400).json({ msg: "Post not found" });
    }

    //Current user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorised" });
    }

    await post.remove();

    res.json({ msg: "Post is deleted" });
  } catch (err) {
    console.log(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "Post not found" });
    }
    res.status(500).json({ errors: [{ msg: "Server Error" }] });
  }
});

//Adding comment in original file to check conflicts

module.exports = router;
