const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.authMidlleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(401).json({ message: "Access token required" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Invalid or expired access token" });
  }
};



exports.refreshAccessToken = (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET;
    const decoded = jwt.verify(refreshToken, refreshSecret);
    const accessToken = jwt.sign(
      {
        userId: decoded.userId,
        name: decoded.name,
        email: decoded.email,
      },

      process.env.ACCESS_TOKEN_SECRET,

      {
        expiresIn: "15m",
      },
    );
    return res.status(200).json({ accessToken });
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

