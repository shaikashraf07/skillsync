const express = require("express");
const prisma = require("../utils/prisma");
const { authenticate, requireRole } = require("../middleware/auth");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");

const router = express.Router();
const SCORE_THRESHOLD = 80;

// ─── POST /applications/:postingId ───
router.post(
  "/:postingId",
  authenticate,
  requireRole("CANDIDATE"),
  catchAsync(async (req, res) => {
    const { postingId } = req.params;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!profile) throw new ApiError(404, "Candidate profile not found.");

    const posting = await prisma.posting.findUnique({
      where: { id: postingId },
    });
    if (!posting) throw new ApiError(404, "Posting not found.");
    if (new Date() > posting.deadline)
      throw new ApiError(400, "Application deadline has passed.");

    const existingApp = await prisma.application.findUnique({
      where: { candidateId_postingId: { candidateId: profile.id, postingId } },
    });
    if (existingApp && !existingApp.withdrawn)
      throw new ApiError(409, "You have already applied.");

    const matchScore = await prisma.matchScore.findUnique({
      where: { candidateId_postingId: { candidateId: profile.id, postingId } },
    });
    if (!matchScore)
      throw new ApiError(
        400,
        "Check your score first via POST /scores/check/:postingId",
      );
    if (matchScore.score < SCORE_THRESHOLD) {
      throw new ApiError(
        403,
        `Score ${matchScore.score}% is below the ${SCORE_THRESHOLD}% threshold.`,
      );
    }

    let application;
    if (existingApp && existingApp.withdrawn) {
      application = await prisma.application.update({
        where: { id: existingApp.id },
        data: { withdrawn: false, appliedAt: new Date() },
      });
    } else {
      application = await prisma.application.create({
        data: { candidateId: profile.id, postingId },
      });
    }

    res.status(201).json({
      message: "Application submitted.",
      application,
      matchScore: matchScore.score,
    });
  }),
);

// ─── DELETE /applications/:postingId ───
router.delete(
  "/:postingId",
  authenticate,
  requireRole("CANDIDATE"),
  catchAsync(async (req, res) => {
    const { postingId } = req.params;

    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!profile) throw new ApiError(404, "Candidate profile not found.");

    const application = await prisma.application.findUnique({
      where: { candidateId_postingId: { candidateId: profile.id, postingId } },
    });
    if (!application || application.withdrawn)
      throw new ApiError(404, "No active application found.");

    const posting = await prisma.posting.findUnique({
      where: { id: postingId },
    });
    if (new Date() > posting.deadline)
      throw new ApiError(400, "Cannot withdraw after deadline.");

    await prisma.application.update({
      where: { id: application.id },
      data: { withdrawn: true },
    });
    res.json({ message: "Application withdrawn." });
  }),
);

// ─── GET /applications/mine ───
router.get(
  "/mine",
  authenticate,
  requireRole("CANDIDATE"),
  catchAsync(async (req, res) => {
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!profile) throw new ApiError(404, "Candidate profile not found.");

    const applications = await prisma.application.findMany({
      where: { candidateId: profile.id, withdrawn: false },
      include: {
        posting: {
          include: {
            postingSkills: true,
            recruiter: { select: { companyName: true } },
          },
        },
      },
      orderBy: { appliedAt: "desc" },
    });

    const postingIds = applications.map((a) => a.postingId);
    const scores = await prisma.matchScore.findMany({
      where: { candidateId: profile.id, postingId: { in: postingIds } },
    });
    const scoreMap = {};
    scores.forEach((s) => {
      scoreMap[s.postingId] = s.score;
    });

    const result = applications.map((app) => ({
      ...app,
      matchScore: scoreMap[app.postingId] || null,
    }));
    res.json({ applications: result, total: result.length });
  }),
);

// ─── GET /applications/posting/:postingId (for recruiters) ───
router.get(
  "/posting/:postingId",
  authenticate,
  requireRole("RECRUITER"),
  catchAsync(async (req, res) => {
    const { postingId } = req.params;

    // Verify the posting belongs to this recruiter
    const posting = await prisma.posting.findUnique({
      where: { id: postingId },
      include: { recruiter: true },
    });
    if (!posting) throw new ApiError(404, "Posting not found.");

    const recruiterProfile = await prisma.recruiterProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!recruiterProfile || posting.recruiterId !== recruiterProfile.id) {
      throw new ApiError(
        403,
        "You can only view applications for your own postings.",
      );
    }

    const applications = await prisma.application.findMany({
      where: { postingId, withdrawn: false },
      include: {
        candidate: {
          select: { id: true, name: true, user: { select: { email: true } } },
        },
      },
      orderBy: { appliedAt: "desc" },
    });

    // Get match scores for these candidates
    const candidateIds = applications.map((a) => a.candidateId);
    const scores = await prisma.matchScore.findMany({
      where: { candidateId: { in: candidateIds }, postingId },
    });
    const scoreMap = {};
    scores.forEach((s) => {
      scoreMap[s.candidateId] = s.score;
    });

    const result = applications.map((app) => ({
      candidateId: app.candidate.id,
      candidateName:
        app.candidate.name || app.candidate.user?.email || "Unknown",
      score: scoreMap[app.candidateId] || 0,
      appliedAt: app.appliedAt,
    }));

    res.json({ applications: result, total: result.length });
  }),
);

module.exports = router;
