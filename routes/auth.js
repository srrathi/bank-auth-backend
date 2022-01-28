const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user.model");

// REGISTER USER
router.post("/register", async (req, res) => {
  if (
    req.body.email === "" ||
    req.body.password === "" ||
    req.body.userId === "" ||
    req.body.name === ""
  ) {
    return res.status(400).json("Mandatory fields are empty.");
  }
  try {
    // HASHING PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // SAVING USER TO DATABASE
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      userId: req.body.userId,
      contact: req.body.contact,
    });

    // DUPLICATE USER ERROR HANDLING
    if (!user) {
      return res
        .status(400)
        .json("User already exists with same Email or User Id.");
    }

    delete user._doc["password"];
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json(error);
  }
});

// LOGIN USER
router.post("/login", async (req, res) => {
  // VALID DATA CHECK
  if (req.body.password === "" || req.body.userId === "") {
    return res.status(400).json("Mandatory fields are empty.");
  }
  try {
    const user = await User.findOne({
      userId: req.body.userId,
    });

    if (!user) return res.status(400).json("User Not found");

    // CHECKING PASSWORD
    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (isPasswordValid) {

      // SENDING SIGNED JWT TOKEN
      const token = jwt.sign(
        {
          email: user.email,
          name: user.name,
          userId: user.userId,
          contact: user.contact,
          _id: user._id,
        },
        process.env.JWT_SECRET
      );

      const userData = { ...user._doc };
      delete userData["password"];
      return res.status(200).json({ user: userData, token });
    } else {
      return res.status(400).json("Inavlid Credentials");
    }
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
