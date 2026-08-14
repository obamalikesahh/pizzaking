import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load the .env file from the parent directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Set up Nodemailer transporter using IONOS SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ionos.de',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify the connection
transporter.verify(function (error, success) {
  if (error) {
    console.error('SMTP Connection Error:', error);
  } else {
    console.log('✅ Server is ready to take our messages via IONOS SMTP');
  }
});

// Endpoint: Send Verification Code
app.post('/api/send-verification', async (req, res) => {
  const { toEmail, userName, code } = req.body;
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
    res.json({ success: true, message: 'Email sent' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint: Send Order Confirmation
app.post('/api/send-order', async (req, res) => {
  const { toEmail, order } = req.body;
  try {
    const itemsListHtml = order.items.map(i => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); width: 60px;">
          ${i.image ? `<img src="https://www.pizzaking-schleswig.com${i.image}" alt="${i.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; border: 1px solid #cfa670;" />` : ''}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05);">
          <strong style="color: #ffffff;">${i.quantity}x ${i.name}</strong>
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: right; color: #cfa670; font-weight: bold;">
          ${(i.price * i.quantity).toFixed(2).replace('.', ',')} €
        </td>
      </tr>
    `).join('');
    
    await transporter.sendMail({
      from: `"Pizza King Schleswig" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `🍕 Bestellbestätigung #${order.id} - Pizza King`,
      html: `
        <div style="font-family: 'Inter', Helvetica, sans-serif; background-color: #111111; color: #ffffff; padding: 40px 20px; text-align: center;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid #cfa670;">
            <div style="background: linear-gradient(135deg, #cfa670 0%, #b88645 100%); padding: 30px 20px;">
              <h1 style="color: #111111; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">Pizza King</h1>
              <p style="color: #111111; margin: 10px 0 0; font-weight: 600;">Deine Bestellung ist eingegangen!</p>
            </div>
            <div style="padding: 30px 20px; text-align: left;">
              <h2 style="color: #cfa670; margin-top: 0; font-size: 22px;">Bestellbestätigung #${order.id}</h2>
              <p style="font-size: 16px; color: #dddddd;">Hallo ${order.customer || 'Kunde'},</p>
              <p style="font-size: 16px; color: #dddddd; line-height: 1.5;">Vielen Dank für deine Bestellung! Wir haben deine Bestellung erhalten und bereiten sie gerade frisch für dich zu.</p>
              
              <h3 style="color: #ffffff; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-top: 30px;">Deine Artikel</h3>
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                ${itemsListHtml}
              </table>
              
              <div style="margin-top: 20px; text-align: right; font-size: 20px; color: #cfa670; font-weight: bold;">
                Gesamtsumme: ${(order.total || 0).toFixed(2).replace('.', ',')} €
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
    res.json({ success: true, message: 'Order email sent' });
  } catch (error) {
    console.error('Error sending order email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint: Subscribe Newsletter
app.post('/api/subscribe-newsletter', async (req, res) => {
  const { toEmail } = req.body;
  try {
    await transporter.sendMail({
      from: `"Pizza King Schleswig" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `🍕 Willkommen im exklusiven Pizza King Club!`,
      html: `
        <div style="font-family: 'Georgia', serif; padding: 40px; background: #0a0b0a; color: #ffffff; border: 1px solid #cfa670; border-radius: 8px; text-align: center;">
          <h2 style="color: #cfa670; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">Willkommen im Club!</h2>
          <p style="font-size: 16px; color: #dddddd; line-height: 1.6; max-width: 500px; margin: 20px auto;">
            Danke, dass du dem exklusiven Pizza King Newsletter beigetreten bist.
          </p>
          <p style="font-size: 16px; color: #dddddd; line-height: 1.6; max-width: 500px; margin: 0 auto 30px;">
            Als Mitglied erfährst du immer als Erster von unseren geheimen Angeboten, neuen Kreationen und erhältst exklusive Rabattcodes direkt in dein Postfach.
          </p>
          <div style="margin: 30px 0;">
            <span style="display: inline-block; padding: 12px 24px; background: #cfa670; color: #000; font-weight: bold; border-radius: 4px; text-transform: uppercase; font-family: sans-serif; letter-spacing: 1px;">
              Dein Willkommens-Geschenk folgt in Kürze!
            </span>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 40px; font-family: sans-serif;">
            &copy; 2026 Pizza King Schleswig. Alle Rechte vorbehalten.
          </p>
        </div>
      `,
    });
    res.json({ success: true, message: 'Newsletter email sent' });
  } catch (error) {
    console.error('Error sending newsletter email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`🚀 Email Backend Server running on http://localhost:${PORT}`);
});
