const nodemailer = require('nodemailer');

/**
 * Email Service — Reusable email transporter.
 * Uses SMTP env vars configured in .env.
 * Shared by password reset, invoice emails, and any future email needs.
 */

let transporter = null;

const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }
    return transporter;
};

/**
 * Send an email.
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} [options.text] - Plain text body
 * @param {string} [options.html] - HTML body
 */
const sendEmail = async ({ to, subject, text, html }) => {
    const transport = getTransporter();

    const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        text,
        html
    };

    return transport.sendMail(mailOptions);
};

module.exports = { sendEmail };
