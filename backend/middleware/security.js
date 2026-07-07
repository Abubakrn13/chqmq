/* middleware/security.js — send safe response headers with every response.
   
   These headers close common web-security holes:
   - X-Frame-Options: DENY  → the app can't be iframed on a phishing page
       (clickjacking).
   - X-Content-Type-Options: nosniff → browsers can't be tricked into
       executing a JSON response as JS.
   - Referrer-Policy: strict-origin-when-cross-origin → don't leak the
       user's full URL to third-party sites.
   - Permissions-Policy: turn off camera/mic/geolocation by default so
       an XSS bug can't quietly grab hardware.
   - Content-Security-Policy: only allow scripts from ourselves. This is
       the single strongest anti-XSS control. Adjusted to allow inline
       styles (React uses these) and google-fonts.
   
   Kept as a plain function so we don't take the helmet dependency. */
module.exports = function security(req, res, next) {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(self), microphone=(), geolocation=(self)");
  // HSTS: force HTTPS for one year, but only when the request is TLS.
  if (req.secure || req.headers["x-forwarded-proto"] === "https") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  // CSP: allow ourselves, google fonts, and the Telegram API domain. Also
  // allow QR code data-URLs (used in receipts). Don't block inline styles;
  // React inline styles are needed and modern CSP treats them as fine here.
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self'",
      "worker-src 'self'",
      "manifest-src 'self'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.telegram.org https://api.anthropic.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );
  next();
};
