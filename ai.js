/* ============================================================
   routes/auth.js — login, profile, time-based access.
   No public registration and no subscription tiers. Shop
   accounts (logins) are created by the superadmin, and access
   is granted as a number of active days (activeUntil).
   ============================================================ */
const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const db = require("../db");
const { sign, protect } = require("../auth");

const router = express.Router();
const uid = () => crypto.randomUUID();
const DAY = 86400000;

/* Build a time-based access record. */
function buildSub({ days, status = "active" } = {}) {
  const now = Date.now();
  const n = days !== undefined && days !== null && days !== ""
    ? Math.max(0, Math.floor(Number(days) || 0))
    : 14;
  return { status, startedAt: now, activeUntil: now + n * DAY };
}

/* Shared account-creation used by the superadmin route. */
async function createShopAccount({ shopName, name, phone, password, days, status }) {
  if (!shopName || !phone || !password)
    return { code: 400, error: "Do'kon nomi, telefon va parol majburiy" };
  if (String(password).length < 4)
    return { code: 400, error: "Parol kamida 4 belgidan iborat bo'lsin" };
  const data = db.read();
  if (data.users.some((u) => u.phone === phone))
    return { code: 409, error: "Bu telefon raqami allaqachon band" };

  const shop = {
    id: uid(),
    name: shopName,
    subscription: buildSub({ days, status }),
    createdAt: Date.now(),
  };
  const hash = await bcrypt.hash(String(password), 10);
  const user = {
    id: uid(),
    shopId: shop.id,
    name: name || "Egasi",
    phone,
    passwordHash: hash,
    role: "owner",
    createdAt: Date.now(),
  };
  const branch = { id: uid(), shopId: shop.id, name: "Asosiy filial", address: "", createdAt: Date.now() };

  db.update((d) => {
    d.shops.push(shop);
    d.users.push(user);
    d.branches.push(branch);
  });
  return { shop, user: publicUser(user) };
}

/* Create the platform superadmin once (login: superadmin / admin123). */
async function seedSuperadmin() {
  const data = db.read();
  if (data.users.some((u) => u.role === "superadmin")) return;
  // Prefer an env-supplied password so ops can rotate without redeploy.
  // Falls back to the dev default only when NODE_ENV !== production.
  const envPassword = process.env.SUPERADMIN_PASSWORD;
  const password = envPassword || (process.env.NODE_ENV === "production" ? null : "admin123");
  if (!password) {
    console.error("!! SUPERADMIN_PASSWORD not set — no superadmin seeded. Set the env var and restart. !!");
    return;
  }
  const hash = await bcrypt.hash(password, 10);
  db.update((d) =>
    d.users.push({
      id: uid(),
      shopId: null,
      name: "Platforma admin",
      phone: "superadmin",
      passwordHash: hash,
      role: "superadmin",
      createdAt: Date.now(),
    })
  );
  // Only print the password when it's the dev default. In production the
  // operator already knows their env var.
  if (!envPassword) console.log("  Superadmin tayyor → login: superadmin / parol: admin123 (dev default)");
  else console.log("  Superadmin tayyor → login: superadmin (env parol)");
}

// POST /api/auth/login  { phone, password }
router.post("/login", async (req, res) => {
  const { phone, password } = req.body || {};
  const data = db.read();
  const user = data.users.find((u) => u.phone === phone);
  if (!user) return res.status(401).json({ error: "Telefon yoki parol noto'g'ri" });
  const ok = await bcrypt.compare(String(password || ""), user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Telefon yoki parol noto'g'ri" });

  const shop = data.shops.find((s) => s.id === user.shopId) || null;
  const token = sign({ userId: user.id, shopId: user.shopId, name: user.name, role: user.role, branchId: user.branchId || null });
  res.json({ token, user: publicUser(user), shop });
});

// GET /api/auth/me
router.get("/me", protect, (req, res) => {
  const data = db.read();
  const user = data.users.find((u) => u.id === req.user.userId);
  if (!user) return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
  const shop = data.shops.find((s) => s.id === user.shopId) || null;
  res.json({ user: publicUser(user), shop });
});

// PUT /api/auth/shop  { name }
router.put("/shop", protect, (req, res) => {
  if (!(req.user.role === "owner" || req.user.role === "superadmin"))
    return res.status(403).json({ error: "Faqat do'kon egasi uchun" });
  const { name, maxDiscountForCashier } = req.body || {};
  const shop = db.update((d) => {
    const s = d.shops.find((x) => x.id === req.user.shopId);
    if (!s) return null;
    if (name) s.name = String(name).trim();
    if (maxDiscountForCashier !== undefined) {
      s.maxDiscountForCashier = Math.max(0, Math.min(100, Math.floor(Number(maxDiscountForCashier) || 0)));
    }
    return s;
  });
  if (!shop) return res.status(404).json({ error: "Do'kon topilmadi" });
  res.json(shop);
});

// PUT /api/auth/shop-profile  { profile: { ownerName, staffCount, shopKind, monthlyRevenue, hasFiscal, workHours } }
// Runs only once (or when user asks to update) — panel checks profileCompletedAt to know if onboarding is needed.
router.put("/shop-profile", protect, (req, res) => {
  const p = req.body?.profile || {};
  const shop = db.update((d) => {
    const s = d.shops.find((x) => x.id === req.user.shopId);
    if (!s) return null;
    s.profile = {
      ownerName: String(p.ownerName || "").trim(),
      staffCount: Math.max(1, Math.floor(Number(p.staffCount) || 1)),
      shopKind: String(p.shopKind || "").trim(),      // "gastronom" | "kiyim" | "aptek" | ...
      monthlyRevenue: Math.max(0, Number(p.monthlyRevenue) || 0),
      hasFiscal: !!p.hasFiscal,
      workHours: String(p.workHours || "").trim(),
    };
    s.profileCompletedAt = Date.now();
    return s;
  });
  if (!shop) return res.status(404).json({ error: "Do'kon topilmadi" });
  res.json(shop);
});

function publicUser(u) {
  return { id: u.id, shopId: u.shopId, name: u.name, phone: u.phone, role: u.role, branchId: u.branchId || null };
}

module.exports = router;
module.exports.seedSuperadmin = seedSuperadmin;
module.exports.createShopAccount = createShopAccount;
module.exports.buildSub = buildSub;
