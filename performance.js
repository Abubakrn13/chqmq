/* ============================================================
   server.js — Chaqmoq API server.
   Mounts all API routes and serves frontend/dist in production.
   Starts the Telegram daily-report scheduler if configured.
   ============================================================ */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const authRoutes = require("./routes/auth");
const { startScheduler } = require("./integrations/telegram");
const security = require("./middleware/security");
const { loginLimiter, apiLimiter } = require("./middleware/rateLimit");

const app = express();

// Trust the first proxy so req.ip and req.secure reflect real client info
// (Railway sits in front of us and sets X-Forwarded-For / X-Forwarded-Proto).
app.set("trust proxy", 1);

// Security headers on every response.
app.use(security);

// CORS: only allow same-origin by default. If you host the frontend on a
// separate domain, set ALLOWED_ORIGINS="https://a.com,https://b.com".
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    // Same-origin requests have no Origin header — always allow.
    if (!origin) return cb(null, true);
    if (!allowedOrigins.length || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("CORS: origin not allowed"));
  },
  credentials: true,
  maxAge: 86400,
}));

// Body size cap keeps a JSON bomb from hogging memory.
app.use(express.json({ limit: "1mb" }));

// Global rate limit for every API call. Login has an extra tight limiter
// applied on the route itself.
app.use("/api", apiLimiter);
app.use("/api/auth/login", loginLimiter);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", require("./routes/products"));
app.use("/api/sales", require("./routes/sales"));
app.use("/api/customers", require("./routes/customers"));
app.use("/api/debts", require("./routes/debts"));
app.use("/api/returns", require("./routes/returns"));
app.use("/api/expenses", require("./routes/expenses"));
app.use("/api/branches", require("./routes/branches"));
app.use("/api/superadmin", require("./routes/superadmin"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/staff", require("./routes/staff"));
app.use("/api/shifts", require("./routes/shifts"));
app.use("/api/suppliers", require("./routes/suppliers"));
app.use("/api/invoices", require("./routes/invoices"));
app.use("/api/markirovka", require("./routes/markirovka"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/telegram", require("./routes/telegram"));
app.use("/api/performance", require("./routes/performance"));
app.use("/api/live", require("./routes/live"));
app.use("/api/backup", require("./routes/backup"));
app.use("/api/audit", require("./routes/audit"));
app.use("/api/transfers", require("./routes/transfers"));
app.use("/api/activity", require("./routes/activity").router);
app.use("/api/suspicious", require("./routes/suspicious"));
app.use("/api/reorder", require("./routes/reorder"));
app.use("/api/supplier-analytics", require("./routes/supplierAnalytics"));
app.use("/api/targets", require("./routes/targets"));

app.get("/api/health", (req, res) => res.json({ ok: true, service: "chaqmoq" }));

// Serve the built React app in production.
const dist = path.join(__dirname, "..", "frontend", "dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get("*", (req, res) => res.sendFile(path.join(dist, "index.html")));
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  await authRoutes.seedSuperadmin();
  startScheduler();
  console.log(`\n  Chaqmoq backend → http://localhost:${PORT}`);
  console.log(`  Health check    → http://localhost:${PORT}/api/health\n`);
});
