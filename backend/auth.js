/* ============================================================
   auth.js — JWT helpers + middleware.
   protect()          : any logged-in user (scoped by shopId)
   requireSuper()     : platform superadmin only
   requireActiveSub() : owner's shop must have an active subscription
   ============================================================ */
const jwt = require("jsonwebtoken");
const db = require("./db");

const SECRET = process.env.JWT_SECRET || "chaqmoq-dev-secret-change-me";
if (SECRET === "chaqmoq-dev-secret-change-me" && process.env.NODE_ENV === "production") {
  console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  console.error("!! CRITICAL: JWT_SECRET is not set. Tokens can be forged. !!");
  console.error("!! Set JWT_SECRET env var to a long random string ASAP.   !!");
  console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
}

function sign(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}

function protect(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Avtorizatsiya talab qilinadi" });
  try {
    req.user = jwt.verify(token, SECRET); // { userId, shopId, name, role }
    next();
  } catch (e) {
    return res.status(401).json({ error: "Sessiya muddati tugagan, qayta kiring" });
  }
}

function requireSuper(req, res, next) {
  protect(req, res, () => {
    if (req.user.role !== "superadmin")
      return res.status(403).json({ error: "Faqat superadmin uchun" });
    next();
  });
}

// Only owner / manager can modify shop-wide settings. Cashier is read/sell only.
function requireManager(req, res, next) {
  if (req.user && (req.user.role === "owner" || req.user.role === "manager" || req.user.role === "superadmin"))
    return next();
  return res.status(403).json({ error: "Faqat egasi yoki menejer uchun" });
}

// Owner-only actions: managing staff logins, subscription lifecycle,
// deleting the shop, changing sensitive shop settings. Managers cannot
// perform these, even if the UI happens to route them there.
function requireOwner(req, res, next) {
  if (req.user && (req.user.role === "owner" || req.user.role === "superadmin"))
    return next();
  return res.status(403).json({ error: "Faqat do'kon egasi uchun" });
}

/* Determine the branch scope for the request.
   - owner / manager without a branch: null → they can view all branches.
     If they pass ?branchId=..., the routes filter to that branch.
   - cashier / anyone with token.branchId: locked to their own branch.
   Returns the branchId string to filter by, or null for "all". */
function branchScope(req) {
  // Locked user (has explicit branchId in token) can only see their branch.
  if (req.user && req.user.branchId) return req.user.branchId;
  // Otherwise honor an optional ?branchId= filter for owners/managers.
  const q = req.query && req.query.branchId;
  if (q && typeof q === "string" && q.length > 0) return q;
  return null;
}

/* Is a shop's access currently active (time-based, no plan tiers)? */
function subActive(sub) {
  return !!(sub && sub.status === "active" && sub.activeUntil && Date.now() <= sub.activeUntil);
}

/* Gate business routes: the shop must have an active subscription.
   Runs AFTER protect (needs req.user). Superadmin is exempt. */
function requireActiveSub(req, res, next) {
  if (req.user && req.user.role === "superadmin") return next();
  const data = db.read();
  const shop = data.shops.find((s) => s.id === req.user.shopId);
  if (!shop || !subActive(shop.subscription)) {
    return res.status(402).json({
      error: "Obuna faol emas — do'kon vaqtincha to'xtatilgan. Faollashtirish uchun bog'laning.",
      code: "SUBSCRIPTION_INACTIVE",
    });
  }
  next();
}

module.exports = { sign, protect, requireSuper, requireManager, requireOwner, requireActiveSub, subActive, branchScope, SECRET };
