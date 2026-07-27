const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// ─── Core Middleware ───
app.use(
  cors({
    origin: (origin, callback) => {
      // Always allow mobile apps (no origin header), localhost, capacitor, and Vercel domains
      if (
        !origin ||
        origin.includes("localhost") ||
        origin.includes("capacitor") ||
        origin.includes("vercel.app") ||
        origin === process.env.FRONTEND_URL
      ) {
        return callback(null, true);
      }
      callback(null, true); // Permissive CORS for API connectivity
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));

// ─── Health Check ───
const healthHandler = (req, res) => {
  res.json({
    status: "ok",
    service: "skillsync-node",
    timestamp: new Date().toISOString(),
  });
};
app.get("/health", healthHandler);
app.head("/health", healthHandler);

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
  // Prisma: database connection / initialization errors (e.g. Render cold start)
  if (
    err.name === "PrismaClientInitializationError" ||
    err.name === "PrismaClientRustPanicError" ||
    err.code === "P1001" || // Can't reach DB server
    err.code === "P1008" || // DB operation timed out
    err.code === "P1017"    // Server has closed the connection
  ) {
    console.error(
      `[DB] ${new Date().toISOString()} - Database connection error on ${req.method} ${req.path}:`,
      err.message,
    );
    return res.status(503).json({
      error: "Service temporarily unavailable. Please try again in a moment.",
    });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res
      .status(400)
      .json({ error: "File too large. Maximum size is 5MB." });
  }

  console.error(
    `[ERROR] ${new Date().toISOString()} - ${req.method} ${req.path}:`,
    err.message,
  );
  if (process.env.NODE_ENV === "development") console.error(err.stack);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error:
      statusCode >= 500 && process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
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
