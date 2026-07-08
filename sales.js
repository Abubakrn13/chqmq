/* routes/suspicious.js — flags sales that deserve a second look.
   The signals are heuristic, not accusations — but they surface patterns
   that owners often want to review (large discounts, returns bunched
   around one cashier, unusually large receipts, off-hours sales).
   Only managers/owners can see this. */
const express = require("express");
const db = require("../db");
const { protect, requireActiveSub, requireOwner, branchScope } = require("../auth");

const router = express.Router();
router.use(protect); router.use(requireActiveSub); router.use(requireOwner);

function median(nums) {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// GET /api/suspicious?days=30
router.get("/", (req, res) => {
  const days = Math.max(1, Math.min(90, Number(req.query.days) || 30));
  const from = Date.now() - days * 86400000;
  const scope = branchScope(req);
  const d = db.read();
  const sales = d.sales
    .filter((s) => s.shopId === req.user.shopId && s.ts >= from)
    .filter((s) => !scope || (s.branchId || null) === scope);
  const returns = d.returns
    .filter((r) => r.shopId === req.user.shopId && r.ts >= from)
    .filter((r) => !scope || (r.branchId || null) === scope);

  // Baselines: what's "normal" for this shop
  const totals = sales.map((s) => s.total).filter((x) => x > 0);
  const medTotal = median(totals);
  const bigThresh = Math.max(medTotal * 5, 200000); // 5× typical or 200k

  const flags = [];
  for (const s of sales) {
    // (a) Discount > 25% → suspicious
    if (s.discountPercent >= 25) {
      flags.push({
        saleId: s.id, ts: s.ts, userId: s.userId, userName: s.userName, branchId: s.branchId,
        total: s.total, discount: s.discount,
        severity: s.discountPercent >= 50 ? "high" : "med",
        reason: `Katta chegirma: ${s.discountPercent}% (${s.discount ? s.discount.toLocaleString() : 0} so'm)`,
        tag: "discount",
      });
    }
    // (b) Off-hours sale (before 7am or after 11pm) — the shop's closed
    const hour = new Date(s.ts).getHours();
    if (hour < 7 || hour >= 23) {
      flags.push({
        saleId: s.id, ts: s.ts, userId: s.userId, userName: s.userName, branchId: s.branchId,
        total: s.total,
        severity: "med",
        reason: `Kutilmagan vaqt: ${String(hour).padStart(2, "0")}:${String(new Date(s.ts).getMinutes()).padStart(2, "0")}`,
        tag: "hours",
      });
    }
    // (c) Unusually big receipt → 5× typical
    if (s.total > bigThresh && medTotal > 0) {
      flags.push({
        saleId: s.id, ts: s.ts, userId: s.userId, userName: s.userName, branchId: s.branchId,
        total: s.total,
        severity: "med",
        reason: `Juda katta chek: ${s.total.toLocaleString()} so'm (odatdagi × ${Math.round(s.total / medTotal)})`,
        tag: "large",
      });
    }
  }

  // (d) Cashier-return concentration: does one user account for >50% of returns?
  if (returns.length >= 3) {
    const byUser = {};
    for (const r of returns) {
      byUser[r.userId || "?"] = (byUser[r.userId || "?"] || 0) + 1;
    }
    const top = Object.entries(byUser).sort((a, b) => b[1] - a[1])[0];
    if (top && top[1] / returns.length > 0.5) {
      const u = d.users.find((x) => x.id === top[0]);
      flags.push({
        userId: top[0], userName: u?.name || "?",
        severity: "high",
        reason: `${u?.name || "Xodim"} — jami qaytarishlarning ${Math.round(top[1] / returns.length * 100)}% i (${top[1]} tadan ${returns.length})`,
        tag: "returns",
      });
    }
  }

  flags.sort((a, b) => (b.ts || 0) - (a.ts || 0));

  res.json({
    days,
    baseline: { medianReceipt: medTotal, largeThreshold: bigThresh },
    counts: {
      total: flags.length,
      high: flags.filter((f) => f.severity === "high").length,
      med: flags.filter((f) => f.severity === "med").length,
    },
    flags: flags.slice(0, 100),
  });
});

module.exports = router;
