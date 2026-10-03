const express = require("express");
const router = express.Router();

const {
  getResumeHistory,
  deleteResumeHistory,
} = require("../controller/resumeHistory");
const { matchResume } = require("../controller/jobMatch");
const { authMidlleware } = require("../middleware/auth");

router.get(
  "/history",
 authMidlleware,
  getResumeHistory
);

router.delete(
  "/history/:id",
  authMidlleware,
  deleteResumeHistory
);

router.post("/:id/match", authMidlleware, matchResume);

module.exports = router;