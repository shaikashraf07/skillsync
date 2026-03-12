const express = require("express");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const prisma = require("../utils/prisma");
const { signToken } = require("../utils/jwt");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const rateLimit = require("../middleware/rateLimit");
const {
  generateOtp,
  hashOtp,
  compareOtp,
  signVerifiedToken,
  verifyVerifiedToken,
  sendOtpEmail,
} = require("../utils/otp");

const router = express.Router();

// ─── Rate Limiters ───
const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many signup attempts. Please try again in 15 minutes.",
});
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: "Too many login attempts. Please try again in 15 minutes.",
});
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many OTP requests. Please try again in 15 minutes.",
});

// ─── Schemas ───
const sendOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["CANDIDATE", "RECRUITER"], {
    errorMap: () => ({
      message: "Role must be CANDIDATE or RECRUITER",
    }),
  }),
  verifiedToken: z.string().min(1, "Email verification token is required"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ─── POST /auth/send-otp ───
router.post(
  "/send-otp",
  otpLimiter,
  catchAsync(async (req, res) => {
    const { email } = sendOtpSchema.parse(req.body);

    // Check if an account already exists with this email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ApiError(409, "An account with this email already exists.");
    }

    // Delete any previous OTP records for this email (cleanup)
    await prisma.pendingOtp.deleteMany({ where: { email } });

    // Generate, hash, and store the OTP
    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.pendingOtp.create({
      data: { email, otpHash, expiresAt },
    });

    // Send OTP via email (logs to console in dev mode)
    await sendOtpEmail(email, otp);

    res.json({ message: "OTP sent to your email address." });
  }),
);

// ─── POST /auth/verify-otp ───
router.post(
  "/verify-otp",
  otpLimiter,
  catchAsync(async (req, res) => {
    const { email, otp } = verifyOtpSchema.parse(req.body);

    // Find the latest non-verified OTP for this email
    const record = await prisma.pendingOtp.findFirst({
      where: { email, verified: false },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      throw new ApiError(400, "No OTP found. Please request a new one.");
    }

    // Check expiry
    if (new Date() > record.expiresAt) {
      await prisma.pendingOtp.delete({ where: { id: record.id } });
      throw new ApiError(400, "OTP has expired. Please request a new one.");
    }

    // Compare the OTP
    const isValid = await compareOtp(otp, record.otpHash);
    if (!isValid) {
      throw new ApiError(400, "Invalid OTP. Please try again.");
    }

    // Mark as verified and clean up
    await prisma.pendingOtp.update({
      where: { id: record.id },
      data: { verified: true },
    });

    // Return a short-lived token proving the email is verified
    const verifiedToken = signVerifiedToken(email);

    res.json({
      message: "Email verified successfully.",
      verifiedToken,
    });
  }),
);

// ─── POST /auth/signup ───
router.post(
  "/signup",
  signupLimiter,
  catchAsync(async (req, res) => {
    const data = signupSchema.parse(req.body);

    // Verify the email verification token
    let verifiedPayload;
    try {
      verifiedPayload = verifyVerifiedToken(data.verifiedToken);
    } catch {
      throw new ApiError(400, "Invalid or expired email verification. Please verify your email again.");
    }

    // Ensure the token email matches the signup email
    if (verifiedPayload.email !== data.email) {
      throw new ApiError(400, "Email verification does not match the signup email.");
    }

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new ApiError(409, "An account with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { email: data.email, passwordHash, role: data.role },
      });

      if (data.role === "CANDIDATE") {
        await tx.candidateProfile.create({ data: { userId: newUser.id } });
      } else {
        await tx.recruiterProfile.create({ data: { userId: newUser.id } });
      }

      return newUser;
    });

    // Clean up all OTP records for this email
    await prisma.pendingOtp.deleteMany({ where: { email: data.email } });

    const token = signToken({ userId: user.id, role: user.role });

    res.status(201).json({
      message: "Account created successfully.",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        onboarded: false,
      },
    });
  }),
);

// ─── POST /auth/login ───
router.post(
  "/login",
  loginLimiter,
  catchAsync(async (req, res) => {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        candidateProfile: { select: { name: true, onboarded: true } },
        recruiterProfile: { select: { companyName: true, onboarded: true } },
      },
    });
    if (!user) throw new ApiError(401, "Invalid email or password.");

    const validPassword = await bcrypt.compare(
      data.password,
      user.passwordHash,
    );
    if (!validPassword) throw new ApiError(401, "Invalid email or password.");

    const token = signToken({ userId: user.id, role: user.role });

    // Resolve the display name and onboarded status from the profile
    const displayName =
      user.candidateProfile?.name || user.recruiterProfile?.companyName || null;
    const onboarded =
      user.role === "ADMIN"
        ? true
        : (user.candidateProfile?.onboarded ??
          user.recruiterProfile?.onboarded ??
          false);

    res.json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        displayName,
        onboarded,
      },
    });
  }),
);

// ─── DELETE /auth/account ───
router.delete(
  "/account",
  require("../middleware/auth").authenticate,
  catchAsync(async (req, res) => {
    const userId = req.user.id;

    // Delete user — cascading deletes handle profile, skills, applications, etc.
    await prisma.user.delete({ where: { id: userId } });

    res.json({ message: "Account deleted successfully." });
  }),
);

module.exports = router;
