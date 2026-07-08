/* ============================================================
   db.js — JSON-file data store with atomic writes + safety net.
   
   Persistence strategy:
   1. Primary file: DATA_DIR/db.json (source of truth)
   2. Atomic writes: write to db.json.tmp → rename to db.json
      (rename is atomic on POSIX, so power loss can't corrupt the file)
   3. Rolling backup: DATA_DIR/db.json.backup (last known good copy)
   4. Daily snapshots: DATA_DIR/backups/db-YYYY-MM-DD.json (30 days retained)
   
   On startup: if db.json is missing or corrupt, we try to restore from
   .backup, then from the newest daily snapshot. This is what prevents
   deploys/crashes from wiping the shop.
   
   Set DATA_DIR to a persistent disk (Railway volume) so files survive
   redeploys. Falls back to ./data locally.
   ============================================================ */
const fs = require("fs");
const path = require("path");

const DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const FILE = path.join(DIR, "db.json");
const BACKUP = path.join(DIR, "db.json.backup");
const SNAPS = path.join(DIR, "backups");
const TMP = path.join(DIR, "db.json.tmp");

const COLLECTIONS = [
  "shops", "users", "products", "sales", "customers", "returns",
  "expenses", "branches", "shifts", "suppliers", "invoices",
  "chatIds", "audits", "transfers", "activity",
];

function empty() {
  return Object.fromEntries(COLLECTIONS.map((c) => [c, []]));
}

function ensureDirs() {
  if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
  if (!fs.existsSync(SNAPS)) fs.mkdirSync(SNAPS, { recursive: true });
}

// Attempt to parse a candidate file. Returns the parsed data or null.
function tryRead(fpath) {
  try {
    if (!fs.existsSync(fpath)) return null;
    const raw = fs.readFileSync(fpath, "utf8");
    if (!raw.trim()) return null;
    const data = JSON.parse(raw);
    // Sanity check: must be an object with at least "shops".
    if (!data || typeof data !== "object" || !Array.isArray(data.shops)) return null;
    return data;
  } catch (e) { return null; }
}

// On startup, pick the newest of: db.json, db.json.backup, latest daily snap.
function loadInitial() {
  ensureDirs();
  const primary = tryRead(FILE);
  if (primary) return primary;
  console.warn("[db] primary db.json missing or corrupt, trying backup…");
  const backup = tryRead(BACKUP);
  if (backup) {
    console.warn("[db] restored from db.json.backup");
    // Recover: write it as the primary so we're consistent again.
    try { fs.writeFileSync(FILE, JSON.stringify(backup, null, 2)); } catch {}
    return backup;
  }
  console.warn("[db] backup unavailable, checking daily snapshots…");
  try {
    const snaps = fs.readdirSync(SNAPS).filter((f) => f.startsWith("db-") && f.endsWith(".json")).sort().reverse();
    for (const f of snaps) {
      const d = tryRead(path.join(SNAPS, f));
      if (d) {
        console.warn(`[db] restored from snapshot ${f}`);
        try { fs.writeFileSync(FILE, JSON.stringify(d, null, 2)); } catch {}
        return d;
      }
    }
  } catch (e) { /* directory doesn't exist yet */ }
  console.warn("[db] no data found, starting fresh");
  const fresh = empty();
  try { fs.writeFileSync(FILE, JSON.stringify(fresh, null, 2)); } catch {}
  return fresh;
}

// Ensure every declared collection exists (schema migrations for new collections).
function normalize(data) {
  for (const c of COLLECTIONS) if (!Array.isArray(data[c])) data[c] = [];
  return data;
}

let cache = normalize(loadInitial());
let dirtyCount = 0;

// Atomic write: write to .tmp then rename. If crash mid-write, db.json stays intact.
function writeAtomic(fpath, data) {
  fs.writeFileSync(TMP, JSON.stringify(data, null, 2));
  fs.renameSync(TMP, fpath);
}

function persist() {
  try {
    ensureDirs();
    writeAtomic(FILE, cache);
    dirtyCount++;
    // Every 20 writes, refresh the rolling backup so we always have a
    // recent "known good" copy separate from the live file.
    if (dirtyCount % 20 === 0) {
      try { fs.copyFileSync(FILE, BACKUP); } catch {}
    }
  } catch (e) {
    console.error("[db] write failed:", e.message);
  }
}

// Daily snapshot: run at boot + every 24h. Keeps last 30 days.
function snapshot() {
  try {
    ensureDirs();
    const stamp = new Date().toISOString().slice(0, 10);
    const out = path.join(SNAPS, `db-${stamp}.json`);
    writeAtomic(out, cache);
    // Also refresh the rolling backup — this is always a good moment.
    try { fs.copyFileSync(FILE, BACKUP); } catch {}
    // Retain last 30 days.
    const files = fs.readdirSync(SNAPS)
      .filter((f) => f.startsWith("db-") && f.endsWith(".json"))
      .sort();
    while (files.length > 30) {
      const rm = files.shift();
      try { fs.unlinkSync(path.join(SNAPS, rm)); } catch {}
    }
    console.log(`[db] snapshot saved: db-${stamp}.json`);
  } catch (e) {
    console.error("[db] snapshot failed:", e.message);
  }
}

// Startup: take an immediate snapshot (so today's data is captured), then
// every 24h thereafter. Both timers are unref'd so tests / scripts can exit
// even while the server is idle.
setTimeout(snapshot, 5000).unref();
setInterval(snapshot, 24 * 60 * 60 * 1000).unref();

// Also flush the rolling backup periodically even if writes are sparse.
setInterval(() => {
  try {
    if (fs.existsSync(FILE)) fs.copyFileSync(FILE, BACKUP);
  } catch {}
}, 10 * 60 * 1000).unref(); // every 10 minutes

module.exports = {
  read: () => cache,
  // Callback style: update((db) => { ... }); receives a live reference and
  // returns whatever the caller wants back. Persisted synchronously so
  // route handlers can safely respond right after.
  update: (fn) => {
    const ret = fn(cache);
    persist();
    return ret;
  },
  // Force a snapshot (used by the /api/backup endpoint if you want on-demand).
  snapshot,
  // For debugging in tests.
  _file: FILE,
  _backup: BACKUP,
  _snapshotsDir: SNAPS,
};
