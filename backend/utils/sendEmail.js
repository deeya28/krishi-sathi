const nodemailer = require("nodemailer");

// Sends an email using SMTP credentials from .env.
// For Gmail: EMAIL_USER is your Gmail address, EMAIL_PASS is an "App Password"
// (not your normal Gmail password) - generate one at
// https://myaccount.google.com/apppasswords (requires 2-Step Verification on).
async function sendEmail({ to, subject, html }) {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Krishi Sathi" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

module.exports = sendEmail;