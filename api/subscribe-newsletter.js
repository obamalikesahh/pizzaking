import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { toEmail } = req.body;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ionos.de',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE !== 'false',
    auth: {
      user: process.env.SMTP_USER || 'info@pizzaking-schleswig.de',
      pass: process.env.SMTP_PASS || 'Davit@1981',
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    await transporter.sendMail({
      from: `"Pizza King Schleswig" <${process.env.SMTP_USER || 'info@pizzaking-schleswig.de'}>`,
      to: toEmail,
      subject: `🍕 Willkommen im exklusiven Pizza King Club!`,
      html: `
        <div style="font-family: 'Georgia', serif; padding: 40px; background: #0a0b0a; color: #ffffff; border: 1px solid #cfa670; border-radius: 8px; text-align: center;">
          <h2 style="color: #cfa670; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">Willkommen im Club!</h2>
          <p style="font-size: 16px; color: #dddddd; line-height: 1.6; max-width: 500px; margin: 20px auto;">
            Danke, dass du dem exklusiven Pizza King Newsletter beigetreten bist.
          </p>
          <div style="margin: 30px 0;">
            <span style="display: inline-block; padding: 12px 24px; background: #cfa670; color: #000; font-weight: bold; border-radius: 4px; text-transform: uppercase; font-family: sans-serif; letter-spacing: 1px;">
              Dein Gutschein-Code: KING-10-OFF
            </span>
          </div>
        </div>
      `,
    });
    return res.status(200).json({ success: true, message: 'Newsletter email sent' });
  } catch (error) {
    console.error('Error sending newsletter email via Vercel Function:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
