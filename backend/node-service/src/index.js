const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const rateLimit = require("./middleware/rateLimit");

dotenv.config();

const app = express();

// Trust proxy for Render/reverse proxy environments
app.set("trust proxy", 1);

// ─── Security Middleware ───
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Always allow mobile apps (no origin header), localhost, capacitor, and Vercel domains
      if (
        !origin ||
        origin.includes("localhost") ||
        origin.includes("capacitor") ||
        origin.includes("vercel.app") ||
        (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL)
      ) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));

// ─── Health Check (before rate limiting) ───
const healthHandler = (req, res) => {
  res.json({
    status: "ok",
    service: "skillsync-node",
    timestamp: new Date().toISOString(),
  });
};
app.get("/health", healthHandler);
app.head("/health", healthHandler);

// ─── Global Rate Limiter ───
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(globalLimiter);

// ─── Route Imports ───
const authRoutes = require("./routes/auth");
const candidateRoutes = require("./routes/candidates");
const recruiterRoutes = require("./routes/recruiters");
const postingRoutes = require("./routes/postings");
const scoreRoutes = require("./routes/scores");
const applicationRoutes = require("./routes/applications");
const rankingRoutes = require("./routes/rankings");
const notificationRoutes = require("./routes/notifications");
const recommendationRoutes = require("./routes/recommendations");
const adminRoutes = require("./routes/admin");

// ─── Route Registration ───
app.use("/auth", authRoutes);
app.use("/candidates/recommendations", recommendationRoutes);
app.use("/candidates", candidateRoutes);
app.use("/recruiters", recruiterRoutes);
app.use("/postings", postingRoutes);
app.use("/scores", scoreRoutes);
app.use("/applications", applicationRoutes);
app.use("/rankings", rankingRoutes);
app.use("/notifications", notificationRoutes);
app.use("/admin", adminRoutes);

// ─── 404 Handler ───
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ─── Global Error Handler ───
app.use((err, req, res, next) => {
  if (err.name === "ZodError") {
    const issues = err.issues || err.errors || [];
    return res.status(400).json({
      error: "Validation failed",
      details: issues.map((e) => ({
        field: (e.path || []).join("."),
        message: e.message,
      })),
    });
  }

  // Prisma: unique constraint violation
  if (err.code === "P2002") {
    return res.status(409).json({
      error: "A record with this data already exists.",
      field: err.meta?.target,
    });
  }
  // Prisma: record not found
  if (err.code === "P2025") {
    return res.status(404).json({ error: "Record not found." });
  }
  // Prisma: database connection / initialization errors
  if (
    err.name === "PrismaClientInitializationError" ||
    err.name === "PrismaClientRustPanicError" ||
    err.name === "PrismaClientUnknownRequestError" ||
    err.code === "P1001" || // Can't reach DB server
    err.code === "P1008" || // DB operation timed out
    err.code === "P1017"    // Server has closed the connection
  ) {
    console.error(
      `[DB] ${new Date().toISOString()} - Database connection error on ${req.method} ${req.path}:`,
      err.message,
    );
    return res.status(503).json({
      error: "Database is connecting. Please wait a few seconds and try again.",
    });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res
      .status(400)
      .json({ error: "File too large. Maximum size is 5MB." });
  }

  console.error(
    `[ERROR] ${new Date().toISOString()} - ${req.method} ${req.path}:`,
    err.message || err,
  );
  if (err.stack) console.error(err.stack);

  const statusCode = err.statusCode || (err.status ? err.status : 500);
  const clientMessage = err.isOperational
    ? err.message
    : (statusCode < 500 ? err.message : "Internal server error. Please try again.");

  res.status(statusCode).json({
    error: clientMessage,
  });
});

// ─── Start Server ───
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[NODE] SkillSync API running on port ${PORT}`);
  console.log(`[NODE] Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `[NODE] Python service: ${process.env.PYTHON_SERVICE_URL || "http://localhost:8000"}`,
  );
});

module.exports = app;
