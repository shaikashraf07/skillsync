const crypto = require("crypto");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

/**
 * Generate a random 6-digit OTP string.
 */
function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Hash an OTP for safe storage.
 */
async function hashOtp(otp) {
  return bcrypt.hash(otp, 10);
}

/**
 * Compare a plain OTP against a hash.
 */
async function compareOtp(otp, hash) {
  return bcrypt.compare(otp, hash);
}

/**
 * Create a short-lived JWT proving an email has been verified.
 * Valid for 15 minutes.
 */
function signVerifiedToken(email) {
  return jwt.sign({ email, purpose: "email-verified" }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
}

/**
 * Verify a verified-email token and return the payload.
 * Throws if invalid or expired.
 */
function verifyVerifiedToken(token) {
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  if (payload.purpose !== "email-verified") {
    throw new Error("Invalid token purpose");
  }
  return payload;
}

/**
 * Send an OTP email.
 * In development mode, also logs the OTP to the console for easy testing.
 */
async function sendOtpEmail(email, otp) {
  // Always log in development so you can test without real SMTP
  if (process.env.NODE_ENV !== "production") {
    console.log(`\n╔══════════════════════════════════════╗`);
    console.log(`║  📧 OTP for ${email}`);
    console.log(`║  🔑 Code: ${otp}`);
    console.log(`╚══════════════════════════════════════╝\n`);
  }

  // If SMTP is not configured, skip sending (dev-friendly)
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log("[OTP] SMTP not configured — OTP logged to console only.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"SkillSync" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Your SkillSync Verification Code",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #faf8f5; border-radius: 12px;">
        <h2 style="color: #3a3a2e; margin-bottom: 8px;">Verify your email</h2>
        <p style="color: #6b6b5e; font-size: 14px;">Use the code below to complete your SkillSync signup. It expires in <strong>10 minutes</strong>.</p>
        <div style="background: #fff; border: 2px dashed #b8a88a; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #3a3a2e;">${otp}</span>
        </div>
        <p style="color: #999; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

module.exports = {
  generateOtp,
  hashOtp,
  compareOtp,
  signVerifiedToken,
  verifyVerifiedToken,
  sendOtpEmail,
};
