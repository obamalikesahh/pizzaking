import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { toEmail, order } = req.body;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ionos.de',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE !== 'false', // true for 465
    auth: {
      user: process.env.SMTP_USER || 'info@pizzaking-schleswig.de',
      pass: process.env.SMTP_PASS || 'Davit@1981',
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    const itemsListHtml = (order?.items || []).map(i => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); width: 60px;">
          ${i.image ? `<img src="https://www.pizzaking-schleswig.com${i.image}" alt="${i.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; border: 1px solid #cfa670;" />` : ''}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05);">
          <strong style="color: #ffffff;">${i.quantity || 1}x ${i.name}</strong>
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: right; color: #cfa670; font-weight: bold;">
          ${((i.price || 0) * (i.quantity || 1)).toFixed(2).replace('.', ',')} €
        </td>
      </tr>
    `).join('');

    await transporter.sendMail({
      from: `"Pizza King Schleswig" <${process.env.SMTP_USER || 'info@pizzaking-schleswig.de'}>`,
      to: toEmail,
      subject: `🍕 Bestellbestätigung #${order?.id} - Pizza King`,
      html: `
        <div style="font-family: 'Inter', Helvetica, sans-serif; background-color: #111111; color: #ffffff; padding: 40px 20px; text-align: center;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid #cfa670;">
            <div style="background: linear-gradient(135deg, #cfa670 0%, #b88645 100%); padding: 30px 20px;">
              <h1 style="color: #111111; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">Pizza King</h1>
              <p style="color: #111111; margin: 10px 0 0; font-weight: 600;">Deine Bestellung ist eingegangen!</p>
            </div>
            <div style="padding: 30px 20px; text-align: left;">
              <h2 style="color: #cfa670; margin-top: 0; font-size: 22px;">Bestellbestätigung #${order?.id}</h2>
              <p style="font-size: 16px; color: #dddddd;">Hallo ${order?.customer || 'Kunde'},</p>
              <p style="font-size: 16px; color: #dddddd; line-height: 1.5;">Vielen Dank für deine Bestellung! Wir haben deine Bestellung erhalten und bereiten sie gerade frisch für dich zu.</p>
              
              <h3 style="color: #ffffff; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-top: 30px;">Deine Artikel</h3>
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                ${itemsListHtml}
              </table>
              
              <div style="margin-top: 20px; text-align: right; font-size: 20px; color: #cfa670; font-weight: bold;">
                Gesamtsumme: ${(order?.total || 0).toFixed(2).replace('.', ',')} €
              </div>
            </div>
            <div style="background-color: #0a0a0a; padding: 25px 20px; font-size: 14px; color: #888888; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
              <p style="margin: 0 0 5px 0;"><strong>Euer Pizza King Team!</strong></p>
              <p style="margin: 0 0 5px 0;">Adresse: Domziegelhof 12-14, 24837 Schleswig</p>
              <p style="margin: 0 0 5px 0;">Telefon: 04621/ 999 460 oder 04621/ 999 461</p>
              <p style="margin: 0;">Email: <a href="mailto:info@pizzaking-schleswig.de" style="color: #cfa670; text-decoration: none;">info@pizzaking-schleswig.de</a></p>
            </div>
          </div>
        </div>
      `,
    });
    return res.status(200).json({ success: true, message: 'Order email sent' });
  } catch (error) {
    console.error('Error sending order email via Vercel Function:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
