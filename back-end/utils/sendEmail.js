const nodemailer = require('nodemailer');
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');

let cachedTransporter;
const getTransporter = () => {
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }
  return cachedTransporter;
};

const sendEmail = async ({ to, subject, html }) => {
  const start = Date.now();
  console.log(`[EMAIL] Sending to ${to}...`);
  try {
    const info = await getTransporter().sendMail({
      from: `"MicroConnect" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(
      `[EMAIL] Sent to ${to} in ${Date.now() - start}ms. ` +
      `messageId=${info.messageId} accepted=${JSON.stringify(info.accepted)} ` +
      `rejected=${JSON.stringify(info.rejected)} response=${info.response}`
    );
  } catch (err) {
    console.error(`[EMAIL] FAILED to ${to} after ${Date.now() - start}ms: ${err.message}`);
    throw err;
  }
};

module.exports = sendEmail;
