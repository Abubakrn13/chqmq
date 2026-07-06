/* routes/live.js — Server-Sent Events stream + recent-events snapshot.
   Managers/owners subscribe; cashiers do not (privacy). */
const express = require("express");
const jwt = require("jsonwebtoken");
const { protect, requireActiveSub, requireManager, SECRET } = require("../auth");
const { subscribe, history } = require("../live");
const router = express.Router();

// POST /api/live/ticket — issue a short-lived, single-purpose token the
// EventSource can pass in ?t=. The main auth token stays out of URLs
// (which end up in browser history, referrer, proxy logs).
router.post("/ticket", protect, requireActiveSub, requireManager, (req, res) => {
  const ticket = jwt.sign(
    { userId: req.user.userId, shopId: req.user.shopId, role: req.user.role, purpose: "live" },
    SECRET,
    { expiresIn: "5m" }
  );
  res.json({ ticket });
});

// GET /api/live/stream — SSE. Requires a ticket (not a full session token).
router.get("/stream", (req, res) => {
  const token = req.query.t;
  if (!token) return res.status(401).end();
  try {
    const user = jwt.verify(token, SECRET);
    // Only accept tickets minted for this purpose. This means even if a
    // full session token somehow leaks into a URL, it can't be used to
    // open a stream — the purpose claim won't match.
    if (user.purpose !== "live") return res.status(401).end();
    if (!["owner", "manager"].includes(user.role)) return res.status(403).end();
    res.set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    });
    res.write(":ok\n\n");
    subscribe(user.shopId, res);
    const t = setInterval(() => { try { res.write(":ping\n\n"); } catch (e) { clearInterval(t); } }, 25000);
    req.on("close", () => clearInterval(t));
  } catch (e) {
    return res.status(401).end();
  }
});

// GET /api/live/recent — snapshot for the dashboard on first load.
router.get("/recent", protect, requireActiveSub, requireManager, (req, res) => {
  res.json(history(req.user.shopId).slice(-30).reverse());
});

module.exports = router;
