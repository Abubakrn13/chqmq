/* middleware/rateLimit.js — tiny in-memory rate limiter, no external deps.
   
   Two limiters exported:
   - loginLimiter: aggressive, blocks credential-stuffing / brute-force.
       10 attempts per 10 minutes per IP + username combination.
   - apiLimiter: general-purpose, catches runaway scripts and DoS.
       300 requests per minute per IP, plus 60 mutations per minute per user. */
const NS = new Map();

function bucket(key, windowMs) {
  const now = Date.now();
  const b = NS.get(key);
  if (!b || now - b.start > windowMs) {
    const fresh = { start: now, count: 0 };
    NS.set(key, fresh);
    return fresh;
  }
  return b;
}

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of NS) {
    if (now - v.start > 30 * 60 * 1000) NS.delete(k);
  }
}, 5 * 60 * 1000).unref();

function ipOf(req) {
  return (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.ip || req.socket?.remoteAddress || "?";
}

function loginLimiter(req, res, next) {
  const ip = ipOf(req);
  const username = String(req.body?.phone || "").toLowerCase().slice(0, 40);
  const key = `login:${ip}:${username}`;
  const b = bucket(key, 10 * 60 * 1000);
  b.count++;
  if (b.count > 10) {
    const wait = Math.ceil((10 * 60 * 1000 - (Date.now() - b.start)) / 1000);
    return res.status(429).json({ error: `Ko'p urinish. ${wait} soniyadan keyin urinib ko'ring.` });
  }
  next();
}

function apiLimiter(req, res, next) {
  const ip = ipOf(req);
  const ipBucket = bucket(`ip:${ip}`, 60 * 1000);
  ipBucket.count++;
  if (ipBucket.count > 300) {
    return res.status(429).json({ error: "Ko'p so'rov. Bir daqiqadan keyin urinib ko'ring." });
  }
  if (req.method !== "GET" && req.user) {
    const userBucket = bucket(`user:${req.user.userId}`, 60 * 1000);
    userBucket.count++;
    if (userBucket.count > 60) {
      return res.status(429).json({ error: "Ko'p yozuv. Bir daqiqadan keyin urinib ko'ring." });
    }
  }
  next();
}

module.exports = { loginLimiter, apiLimiter, ipOf };
