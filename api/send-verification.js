import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { toEmail, userName, code } = req.body;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ionos.de',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    await transporter.sendMail({
      from: `"Pizza King Schleswig" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `🔑 Dein Verifizierungscode für Pizza King: ${code}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 25px; background: #0a0b0a; color: #ffffff; border-radius: 12px; border: 1px solid #cfa670;">
          <h2 style="color: #cfa670;">Willkommen bei Pizza King Schleswig!</h2>
          <p>Hallo <strong>${userName}</strong>,</p>
          <p>Dein 6-stelliger Verifizierungscode lautet:</p>
          <div style="background: rgba(207, 166, 112, 0.2); border: 2px solid #cfa670; font-size: 28px; font-weight: bold; letter-spacing: 6px; padding: 18px; text-align: center; border-radius: 10px; color: #cfa670; margin: 25px 0;">
            ${code}
          </div>
        </div>
      `,
    });
    return res.status(200).json({ success: true, message: 'Email sent' });
  } catch (error) {
    console.error('Error sending email via Vercel Function:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
