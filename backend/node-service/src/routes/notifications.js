const express = require("express");
const { z } = require("zod");
const prisma = require("../utils/prisma");
const { authenticate, requireRole } = require("../middleware/auth");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");

const router = express.Router();

const notifySchema = z.object({
  message: z.string().min(1, "Message is required").max(500),
});

// ─── POST /notifications/notify/:candidateId/:postingId ───
router.post(
  "/notify/:candidateId/:postingId",
  authenticate,
  requireRole("RECRUITER"),
  catchAsync(async (req, res) => {
    const { candidateId, postingId } = req.params;
    const data = notifySchema.parse(req.body);

    const recruiterProfile = await prisma.recruiterProfile.findUnique({
      where: { userId: req.user.id },
    });
    const posting = await prisma.posting.findUnique({
      where: { id: postingId },
    });
    if (!posting) throw new ApiError(404, "Posting not found.");
    if (posting.recruiterId !== recruiterProfile.id)
      throw new ApiError(403, "You can only notify for your own postings.");

    const candidate = await prisma.candidateProfile.findUnique({
      where: { id: candidateId },
    });
    if (!candidate) throw new ApiError(404, "Candidate not found.");

    // Check if an INVITE notification already exists for this candidate + posting
    const existing = await prisma.notification.findFirst({
      where: { userId: candidate.userId, postingId, type: "INVITE" },
    });
    if (existing)
      throw new ApiError(
        409,
        "An invitation has already been sent to this candidate for this posting.",
      );

    const notification = await prisma.notification.create({
      data: {
        userId: candidate.userId,
        postingId,
        message: data.message,
        type: "INVITE",
        actionTaken: "NONE",
      },
    });

    res.status(201).json({ message: "Notification sent.", notification });
  }),
);

// ─── GET /notifications/mine ───
router.get(
  "/mine",
  authenticate,
  catchAsync(async (req, res) => {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: { posting: { select: { id: true, title: true, type: true } } },
    });

    const unreadCount = notifications.filter((n) => !n.read).length;
    res.json({ unreadCount, total: notifications.length, notifications });
  }),
);

// ─── PUT /notifications/:id/read ───
router.put(
  "/:id/read",
  authenticate,
  catchAsync(async (req, res) => {
    const notification = await prisma.notification.findUnique({
      where: { id: req.params.id },
    });
    if (!notification) throw new ApiError(404, "Notification not found.");
    if (notification.userId !== req.user.id)
      throw new ApiError(
        403,
        "You can only mark your own notifications as read.",
      );

    await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    res.json({ message: "Notification marked as read." });
  }),
);

// ─── PUT /notifications/:id/accept ───
router.put(
  "/:id/accept",
  authenticate,
  requireRole("CANDIDATE"),
  catchAsync(async (req, res) => {
    const notification = await prisma.notification.findUnique({
      where: { id: req.params.id },
      include: { posting: true },
    });
    if (!notification) throw new ApiError(404, "Notification not found.");
    if (notification.userId !== req.user.id)
      throw new ApiError(403, "Not your notification.");
    if (notification.type !== "INVITE")
      throw new ApiError(400, "This notification is not an invitation.");
    if (notification.actionTaken !== "NONE")
      throw new ApiError(
        400,
        `You have already ${notification.actionTaken.toLowerCase()} this invitation.`,
      );

    // Get candidate profile
    const candidate = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!candidate) throw new ApiError(404, "Candidate profile not found.");

    // Create application (if not already applied)
    const existingApp = await prisma.application.findUnique({
      where: {
        candidateId_postingId: {
          candidateId: candidate.id,
          postingId: notification.postingId,
        },
      },
    });

    await prisma.$transaction(async (tx) => {
      // Create application if not exists
      if (!existingApp) {
        await tx.application.create({
          data: {
            candidateId: candidate.id,
            postingId: notification.postingId,
          },
        });
      } else if (existingApp.withdrawn) {
        // Re-apply if previously withdrawn
        await tx.application.update({
          where: { id: existingApp.id },
          data: { withdrawn: false },
        });
      }

      // Mark notification
      await tx.notification.update({
        where: { id: req.params.id },
        data: { actionTaken: "ACCEPTED", read: true },
      });
    });

    res.json({
      message: "Invitation accepted! You are now applied to this posting.",
    });
  }),
);

// ─── PUT /notifications/:id/reject ───
router.put(
  "/:id/reject",
  authenticate,
  requireRole("CANDIDATE"),
  catchAsync(async (req, res) => {
    const notification = await prisma.notification.findUnique({
      where: { id: req.params.id },
    });
    if (!notification) throw new ApiError(404, "Notification not found.");
    if (notification.userId !== req.user.id)
      throw new ApiError(403, "Not your notification.");
    if (notification.type !== "INVITE")
      throw new ApiError(400, "This notification is not an invitation.");
    if (notification.actionTaken !== "NONE")
      throw new ApiError(
        400,
        `You have already ${notification.actionTaken.toLowerCase()} this invitation.`,
      );

    await prisma.notification.update({
      where: { id: req.params.id },
      data: { actionTaken: "REJECTED", read: true },
    });

    res.json({ message: "Invitation declined." });
  }),
);

module.exports = router;
