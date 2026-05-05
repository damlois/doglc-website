/**
 * Vercel serverless: booking form → email via SMTP (nodemailer).
 *
 * Vercel → Project → Settings → Environment Variables:
 *
 *   SMTP_HOST        e.g. smtp.sendgrid.net, smtp.gmail.com, mail.yourhost.com
 *   SMTP_PORT        optional, default 587 (use 465 for implicit SSL)
 *   SMTP_USER        SMTP username (omit only if your relay allows unauthenticated)
 *   SMTP_PASS        SMTP password or app-specific password
 *   SMTP_SECURE      optional; "true" forces TLS on connect (typical for port 465)
 *
 *   MAIL_FROM        sender shown to inbox, e.g. "DOGLC Website <noreply@yourdomain.com>"
 *                     (must be allowed by your SMTP provider)
 *   MAIL_TO          optional; where booking emails are delivered (default: info@damilolaolaniyi.com)
 */

const nodemailer = require("nodemailer");

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: "Method not allowed" }));
  }

  const body = await readJsonBody(req);
  if (!body || typeof body !== "object") {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: "Invalid request body" }));
  }

  const hp = body.website ?? body["bot-field"];
  if (typeof hp === "string" && hp.trim() !== "") {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: "Invalid request" }));
  }

  const host = String(process.env.SMTP_HOST || "").trim();
  const mailFrom = String(process.env.MAIL_FROM || "").trim();
  const mailTo = String(process.env.MAIL_TO || "info@damilolaolaniyi.com").trim();

  if (!host || !mailFrom) {
    res.statusCode = 503;
    return res.end(
      JSON.stringify({
        error:
          "Booking email is not configured. In Vercel, set SMTP_HOST, MAIL_FROM, SMTP_USER, and SMTP_PASS (see api/booking.js comments).",
      }),
    );
  }

  const firstName = String(body.firstName || "").trim();
  const lastName = String(body.lastName || "").trim();
  const email = String(body.email || "").trim();
  const phone = String(body.phone || "").trim();
  const organisation = String(body.organisation || "").trim();
  const service = String(body.service || "").trim();
  const role = String(body.role || "").trim();
  const message = String(body.message || "").trim();

  if (!firstName || !lastName || !email || !organisation || !service) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: "Please fill in all required fields." }));
  }

  const port = Number(process.env.SMTP_PORT || 587) || 587;
  const secureEnv = String(process.env.SMTP_SECURE || "").toLowerCase();
  const secure = secureEnv === "true" || secureEnv === "1" || port === 465;

  const smtpUser = String(process.env.SMTP_USER || "").trim();
  const smtpPass = String(process.env.SMTP_PASS || "");

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: smtpUser ? { user: smtpUser, pass: smtpPass } : undefined,
  });

  const text = [
    `Name: ${firstName} ${lastName}`,
    `Email: ${email}`,
    `Phone: ${phone || "N/A"}`,
    `Organisation: ${organisation}`,
    `Service: ${service}`,
    `Role: ${role || "N/A"}`,
    "",
    message || "(No additional message)",
  ].join("\n");

  const rows = [
    ["Name", `${firstName} ${lastName}`],
    ["Email", email],
    ["Phone", phone || "N/A"],
    ["Organisation", organisation],
    ["Service", service],
    ["Role", role || "N/A"],
    ["Message", message || "(No additional message)"],
  ]
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px;border:1px solid #e5e5e5;font-weight:600;">${escapeHtml(k)}</td><td style="padding:8px 12px;border:1px solid #e5e5e5;">${escapeHtml(v).replace(/\n/g, "<br/>")}</td></tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;font-size:14px;color:#111;">
<p>New booking request from the DOGLC website.</p>
<table style="border-collapse:collapse;max-width:560px;">${rows}</table>
</body></html>`;

  try {
    await transporter.sendMail({
      from: mailFrom,
      to: mailTo,
      replyTo: email,
      subject: `[DOGLC] Booking request: ${service}`,
      text,
      html,
    });
  } catch (err) {
    console.error("[booking] SMTP error:", err && err.message ? err.message : err);
    res.statusCode = 502;
    return res.end(
      JSON.stringify({
        error:
          "Could not send your request right now. Please try again in a few minutes or email info@damilolaolaniyi.com.",
      }),
    );
  }

  res.statusCode = 200;
  return res.end(JSON.stringify({ ok: true }));
};
