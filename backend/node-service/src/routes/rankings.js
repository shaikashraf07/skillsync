const express = require("express");
const prisma = require("../utils/prisma");
const { authenticate } = require("../middleware/auth");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");

const router = express.Router();

// ─── GET /rankings/:postingId ───
router.get(
  "/:postingId",
  authenticate,
  catchAsync(async (req, res) => {
    const { postingId } = req.params;

    const posting = await prisma.posting.findUnique({
      where: { id: postingId },
      select: { id: true, title: true },
    });
    if (!posting) throw new ApiError(404, "Posting not found.");

    const rankings = await prisma.matchScore.findMany({
      where: { postingId, isStale: false },
      orderBy: { score: "desc" },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            location: true,
            skills: { select: { skillName: true, proficiency: true } },
          },
        },
      },
    });

    const candidateIds = rankings.map((r) => r.candidateId);
    const applications = await prisma.application.findMany({
      where: { postingId, candidateId: { in: candidateIds } },
    });
    const appMap = {};
    applications.forEach((a) => {
      appMap[a.candidateId] = { applied: !a.withdrawn, withdrawn: a.withdrawn };
    });

    const result = rankings.map((r, index) => ({
      rank: index + 1,
      candidateId: r.candidateId,
      candidateName: r.candidate.name || "Unnamed",
      location: r.candidate.location,
      score: r.score,
      applicationStatus: appMap[r.candidateId] || {
        applied: false,
        withdrawn: false,
      },
      calculatedAt: r.calculatedAt,
    }));

    res.json({
      postingId: posting.id,
      postingTitle: posting.title,
      totalCandidates: result.length,
      rankings: result,
    });
  }),
);

module.exports = router;
