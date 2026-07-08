/* routes/activity.js — activity feed of important actions per shop.
   Any router can call `log(req, type, meta)` from here to record who did
   what, when, and where (branch). Owners and managers can review the log. */
const express = require("express");
const crypto = require("crypto");
const db = require("../db");
const { protect, requireActiveSub, requireManager, branchScope } = require("../auth");

const router = express.Router();
const uid = () => crypto.randomUUID();

// Small helper the other routes call to append an entry.
// Kept intentionally tiny so it never fails a real request.
function log(req, type, meta = {}) {
  try {
    const entry = {
      id: uid(),
      shopId: req.user.shopId,
      branchId: req.user.branchId || meta.branchId || null,
      userId: req.user.userId,
      userName: req.user.name,
      role: req.user.role,
      ts: Date.now(),
      type,
      meta,
    };
    db.update((d) => {
      d.activity = d.activity || [];
      d.activity.push(entry);
      // Keep the log bounded per shop — last 5000 is more than enough.
      const mine = d.activity.filter((x) => x.shopId === req.user.shopId);
      if (mine.length > 5000) {
        const cut = mine.length - 5000;
        const toDrop = new Set(mine.slice(0, cut).map((x) => x.id));
        d.activity = d.activity.filter((x) => !toDrop.has(x.id));
      }
    });
  } catch (e) { /* activity log must never break the actual request */ }
}

router.use(protect); router.use(requireActiveSub); router.use(requireManager);

// GET /api/activity?type=&user=&days=&limit=
router.get("/", (req, res) => {
  const d = db.read();
  const scope = branchScope(req);
  const days = Math.max(1, Math.min(90, Number(req.query.days) || 7));
  const from = Date.now() - days * 86400000;
  const limit = Math.max(10, Math.min(500, Number(req.query.limit) || 200));
  const type = req.query.type;
  const userId = req.query.user;
  let rows = (d.activity || [])
    .filter((x) => x.shopId === req.user.shopId && x.ts >= from)
    .filter((x) => !scope || (x.branchId || null) === scope);
  if (type) rows = rows.filter((x) => x.type === type);
  if (userId) rows = rows.filter((x) => x.userId === userId);
  rows.sort((a, b) => b.ts - a.ts);
  res.json(rows.slice(0, limit));
});

module.exports = { router, log };
