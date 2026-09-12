import nodemailer from 'nodemailer';

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { toEmail, userName, code } = body;

    const smtpUser = env.SMTP_USER || 'info@pizzaking-schleswig.de';
    const smtpPass = env.SMTP_PASS || 'Davit@1981';

    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST || 'smtp.ionos.de',
      port: parseInt(env.SMTP_PORT || '587'),
      secure: env.SMTP_SECURE === 'true',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.sendMail({
      from: `"Pizza King Schleswig" <${smtpUser}>`,
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

    return new Response(JSON.stringify({ success: true, message: 'Email sent' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
