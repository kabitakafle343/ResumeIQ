
const mongoose = require("mongoose");
const Pdf = require("../models/PdfSchema");
const cloudinary = require("../config/cloudinary");

exports.getResumeHistory = async (req, res) => {
  try {
    const userId = req.user.userId;

    const resumes = await Pdf.find({ user: userId })
      .sort({ createdAt: 1 })
      .select("title analysis createdAt pages");

    if (resumes.length === 0) {
      return res.status(200).json({
        totalAnalyses: 0,
        latestScore: null,
        firstScore: null,
        highestScore: null,
        averageScore: null,
        scoreImprovement: null,
        history: [],
        commonIssues: [],
      });
    }

    const scores = resumes
      .map((resume) => resume.analysis?.score)
      .filter((score) => typeof score === "number");

    const firstScore = scores[0];
    const latestScore = scores[scores.length - 1];

    const highestScore = Math.max(...scores);

    const averageScore =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;

    const scoreImprovement = latestScore - firstScore;

    // Count weaknesses
    const issueCount = {};

    resumes.forEach((resume) => {
      const weaknesses = resume.analysis?.weaknesses || [];

      weaknesses.forEach((weakness) => {
        const issue = weakness.trim().toLowerCase();

        if (!issue) return;

        issueCount[issue] = (issueCount[issue] || 0) + 1;
      });
    });

    const commonIssues = Object.entries(issueCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([issue, count]) => ({
        issue,
        count,
      }));

    const history = resumes.map((resume) => ({
      id: resume._id,
      title: resume.title,
      score: resume.analysis?.score || 0,
      date: resume.createdAt,
      strengths: resume.analysis?.strengths || [],
      weaknesses: resume.analysis?.weaknesses || [],
    }));

    res.status(200).json({
      totalAnalyses: resumes.length,

      latestScore,

      firstScore,

      highestScore,

      averageScore: Number(averageScore.toFixed(2)),

      scoreImprovement,

      commonIssues,

      history,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

exports.deleteResumeHistory = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid resume id" });
    }

    const resume = await Pdf.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    if (resume.publicId) {
      try {
        await cloudinary.uploader.destroy(resume.publicId, { resource_type: "raw" });
      } catch (error) {
        console.error("Unable to remove resume file from Cloudinary", error);
      }
    }

    return res.status(200).json({ message: "Resume deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};