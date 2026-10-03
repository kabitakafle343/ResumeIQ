const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const app = express();
const User = require("../models/User");
exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.trim() });
    if (!user) {
      return res.status(404).json({ message: "user does not exists" });
    }

    const iscompare = await bcrypt.compare(password, user.password);
    if (!iscompare) {
      return res.status(401).json({ message: "password does not match" });
    }
    const tokenPayload = {
      userId: user._id,
      name: user.name,
      email: user.email,
    };
    const accessToken = jwt.sign(tokenPayload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET;
    const refreshToken = jwt.sign(tokenPayload, refreshSecret, {
      expiresIn: "7d",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res
      .status(200)
      .json({ message: "user login successfully", token: accessToken, user });
  } catch (error) {
    console.error("Login failed:", error);
    return res.status(500).json({ message: "Unable to log in due to a server error" });
  }
};

exports.userLogout = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
  return res.status(200).json({ message: "user logout successfully" });
};

exports.userSignUp = async (req, res) => {
  try {
    const { email, name, password } = req.body;
    const isUser = await User.findOne({ email });
    if (isUser) {
      return res.status(409).json({ message: "User already exist" });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, name, password: hashPassword });
    return res
      .status(201)
      .json({ message: "user signup successfully", newUser });
  } catch (error) {
    console.log(error);
  }
};
