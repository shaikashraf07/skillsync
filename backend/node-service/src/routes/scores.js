const express = require("express");
const axios = require("axios");
const prisma = require("../utils/prisma");
const { authenticate, requireRole } = require("../middleware/auth");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");

const router = express.Router();
const PYTHON_SERVICE_URL =
  process.env.PYTHON_SERVICE_URL || "http://localhost:8000";

/**
 * Local score calculation engine used when Python microservice is offline or sleeping
 */
function calculateScoreLocally(candidateSkills, postingSkills) {
  const skillLookup = {};
  candidateSkills.forEach((s) => {
    if (s.skillName) {
      skillLookup[s.skillName.toLowerCase().trim()] = s.proficiency || 1;
    }
  });

  let earned = 0;
  let maxPossible = 0;
  const breakdown = [];
  const gaps = [];

  postingSkills.forEach((ps) => {
    const psName = (ps.skillName || "").toLowerCase().trim();
    const weight = ps.weight || 1;
    maxPossible += 5 * weight;

    const candidateProf = skillLookup[psName] || 0;
    const matched = candidateProf > 0;
    const contribution = candidateProf * weight;
    earned += contribution;

    breakdown.push({
      skillName: ps.skillName,
      weight,
      candidateProficiency: candidateProf,
      contribution,
      maxContribution: 5 * weight,
      matched,
    });

    if (!matched || candidateProf < 3) {
      gaps.push({
        skillName: ps.skillName,
        currentProficiency: candidateProf,
        requiredWeight: weight,
        suggestions: [],
      });
    }
  });

  const score = maxPossible > 0 ? Math.round((earned / maxPossible) * 100 * 100) / 100 : 0;
  return { score, breakdown, gaps, projectedScore: score };
}

// ─── POST /scores/check/:postingId ───
router.post(
  "/check/:postingId",
  authenticate,
  requireRole("CANDIDATE"),
  catchAsync(async (req, res) => {
    const { postingId } = req.params;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.id },
      include: { skills: true },
    });
    if (!profile) throw new ApiError(404, "Candidate profile not found.");
    if (!profile.skills || profile.skills.length === 0)
      throw new ApiError(
        400,
        "No skills found. Please add skills to your profile first to check eligibility.",
      );

    const posting = await prisma.posting.findUnique({
      where: { id: postingId },
      include: { postingSkills: true },
    });
    if (!posting) throw new ApiError(404, "Posting not found.");
    if (!posting.postingSkills || posting.postingSkills.length === 0)
      throw new ApiError(400, "This posting has no required skills.");

    // Check cache
    const cachedScore = await prisma.matchScore.findUnique({
      where: { candidateId_postingId: { candidateId: profile.id, postingId } },
    });

    if (cachedScore && !cachedScore.isStale) {
      return res.json({
        source: "cache",
        score: cachedScore.score,
        breakdown: cachedScore.breakdown,
        gaps: cachedScore.gaps,
        calculatedAt: cachedScore.calculatedAt,
      });
    }

    let calculationResult = null;

    // 1. Try Python microservice
    try {
      const pythonResponse = await axios.post(
        `${PYTHON_SERVICE_URL}/calculate-score`,
        {
          candidateSkills: profile.skills.map((s) => ({
            skillName: s.skillName,
            proficiency: s.proficiency,
          })),
          postingSkills: posting.postingSkills.map((s) => ({
            skillName: s.skillName,
            weight: s.weight,
          })),
        },
        { timeout: 8000 },
      );

      calculationResult = pythonResponse.data;
    } catch (err) {
      console.warn(
        `[SCORING] Python service unavailable (${err.message}). Falling back to local score calculation.`,
      );
      // 2. Fallback to local calculation engine
      calculationResult = calculateScoreLocally(profile.skills, posting.postingSkills);
    }

    const { score, breakdown, gaps, projectedScore } = calculationResult;

    // Save/upsert score in PostgreSQL
    const savedScore = await prisma.matchScore.upsert({
      where: {
        candidateId_postingId: { candidateId: profile.id, postingId },
      },
      update: {
        score,
        breakdown,
        gaps,
        isStale: false,
        calculatedAt: new Date(),
      },
      create: {
        candidateId: profile.id,
        postingId,
        score,
        breakdown,
        gaps,
        isStale: false,
      },
    });

    res.json({
      source: "calculated",
      score: savedScore.score,
      breakdown,
      gaps,
      projectedScore: projectedScore || savedScore.score,
      calculatedAt: savedScore.calculatedAt,
    });
  }),
);

module.exports = router;
