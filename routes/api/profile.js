const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const config = require("config");
const { check, validationResult } = require("express-validator");
const normalizeurl = require("normalize-url");
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const Profile = require("../../models/Profile");

const router = express.Router();

// @route GET api/profile/me
// @desc To get the profile for logged in user
// @access private

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );

    if (!profile) {
      return res.status(401).json({ msg: "There is no profile for this user" });
    }

    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// @route POST api/profile
// @desc To create or update profile of a user
// @access private

router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills are required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // destructure the request
    const {
      website,
      skills,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
      // spread the rest of the fields we don't need to check
      ...rest
    } = req.body;

    // build a profile
    const profileFields = {
      user: req.user.id,
      website:
        website && website !== ""
          ? normalizeurl(website, { forceHttps: true })
          : "",
      skills: Array.isArray(skills)
        ? skills
        : skills.split(",").map((skill) => " " + skill.trim()),
      ...rest,
    };

    // Build socialFields object
    const socialFields = { youtube, twitter, instagram, linkedin, facebook };

    // normalize social fields to ensure valid url
    for (const [key, value] of Object.entries(socialFields)) {
      if (value && value.length > 0)
        socialFields[key] = normalizeurl(value, { forceHttps: true });
    }

    profileFields.social = socialFields;

    //To update or save profile details
    try {
      let profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      return res.json(profile);
    } catch (error) {
      console.error(error.message);
      return res.status(500).send("Server Error");
    }
  }
);

// @route GET api/profile
// @desc To get all the profiles
// @access public

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);

    if (!profiles) {
      return res.status(400).json({ msg: "There are no profiles" });
    }

    res.json(profiles);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// @route GET api/profile/user/:userid
// @desc To get profile using userid
// @access public

router.get("/user/:userid", async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userid }).populate(
      "user",
      ["name", "avatar"]
    );

    if (!profile) {
      return res.status(400).json({ msg: "Profile not found" });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "Profile not found" });
    }
    res.status(500).send("Server error");
  }
});

// @route DELETE api/profile
// @desc To delete profile, user and posts
// @access private

router.delete("/", auth, async (req, res) => {
  try {
    //Remove Profile
    await Profile.findOneAndRemove({ user: req.user.id });

    //Remove User
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// @route PUT api/profile/experience
// @desc To add experience
// @access private

router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //Clone request
    const newExp = { ...req.body };

    try {
      //To find profile and update
      const profile = await Profile.findOne({ user: req.user.id });
      profile?.experience.unshift(newExp);
      await profile.save();

      //Returning updated profile
      res.json(profile);
    } catch (error) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

// @route DELETE api/profile/experience/:expid
// @desc To delete an experience from a profile
// @access private

router.delete("/experience/:expid", auth, async (req, res) => {
  try {
    //To get the profile
    const profile = await Profile.findOne({ user: req.user.id });

    // TO get index of the experience
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.expid);

    //Removing from array
    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// @route PUT api/profile/education
// @desc To add education
// @access private

router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is required").not().isEmpty(),
      check("degree", "Degree is required").not().isEmpty(),
      check("fieldofstudy", "Field of study is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //Clone request
    const newEdu = { ...req.body };

    try {
      //To find profile and update
      const profile = await Profile.findOne({ user: req.user.id });
      profile?.education.unshift(newEdu);
      await profile.save();

      //Returning updated profile
      res.json(profile);
    } catch (error) {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
);

// @route DELETE api/profile/education/:expid
// @desc To delete an education from a profile
// @access private

router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    //To get the profile
    const profile = await Profile.findOne({ user: req.user.id });

    // TO get index of the education
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);

    //Removing from array
    profile.education.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// @route    GET api/profile/github/:username
// @desc     Get user repos from Github
// @access   Public
router.get("/github/:username", async (req, res) => {
  try {
    const uri = encodeURI(
      `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
    );
    const headers = {
      "user-agent": "node.js",
      Authorization: `token ${config.get("githubToken")}`,
    };

    const gitHubResponse = await axios.get(uri, { headers });
    return res.json(gitHubResponse.data);
  } catch (err) {
    console.error(err.message);
    return res.status(404).json({ msg: "No Github profile found" });
  }
});
module.exports = router;
