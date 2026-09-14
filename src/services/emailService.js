/**
 * Pizza King E-Mail Service
 * Versendet E-Mails direkt & zuverlässig über die Brevo HTTPS REST API.
 */

const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY;
const SENDER_EMAIL = 'info@pizzaking-schleswig.de';
const SENDER_NAME = 'Pizza King Schleswig';

// Bot protection & Rate-Limiter Settings
const MAX_EMAILS_PER_DAY = 10; // Max 10 E-Mails pro Nutzer/IP am Tag (schützt das 300/Tag Kontingent)
const COOLDOWN_SECONDS = 60;   // Mindestens 60 Sekunden Pause zwischen 2 E-Mails

function checkRateLimit() {
  const now = Date.now();
  const todayStr = new Date().toISOString().slice(0, 10);

  let emailStats = { date: todayStr, count: 0, lastSent: 0 };
  try {
    const saved = localStorage.getItem('pk_email_ratelimit');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === todayStr) {
        emailStats = parsed;
      }
    }
  } catch (e) {}

  // 1. Cooldown Check (Mindestens 60 Sekunden zwischen Anfragen)
  if (emailStats.lastSent && (now - emailStats.lastSent) < (COOLDOWN_SECONDS * 1000)) {
    const waitTime = Math.ceil((COOLDOWN_SECONDS * 1000 - (now - emailStats.lastSent)) / 1000);
    return { allowed: false, error: `Bitte warte ${waitTime} Sekunden vor dem nächsten E-Mail Versand (Spam-Schutz).` };
  }

  // 2. Tageslimit Check
  if (emailStats.count >= MAX_EMAILS_PER_DAY) {
    return { allowed: false, error: `Tageslimit für E-Mail Anfragen erreicht. Bitte versuche es morgen erneut.` };
  }

  return { allowed: true, stats: emailStats };
}

function recordEmailSent(stats) {
  const updated = {
    date: new Date().toISOString().slice(0, 10),
    count: (stats.count || 0) + 1,
    lastSent: Date.now()
  };
  try {
    localStorage.setItem('pk_email_ratelimit', JSON.stringify(updated));
  } catch (e) {}
}

async function sendBrevoMail({ toEmail, toName, subject, htmlContent }) {
  // Rate-Limit & Bot Check
  const limitCheck = checkRateLimit();
  if (!limitCheck.allowed) {
    console.warn('⛔ [Bot-Protection] E-Mail blockiert:', limitCheck.error);
    return { success: false, error: limitCheck.error };
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: toEmail, name: toName || toEmail }],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    const data = await response.json();
    if (response.ok) {
      recordEmailSent(limitCheck.stats);
      console.log('✅ Brevo E-Mail erfolgreich versendet:', data);
      return { success: true, data };
    } else {
      console.error('❌ Brevo E-Mail Fehler:', data);
      return { success: false, error: data.message || 'Brevo API Fehler' };
    }
  } catch (err) {
    console.error('❌ Netzwerkfehler beim Brevo E-Mail-Versand:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 🔑 1. Verifizierungscode senden
 */
export async function sendVerificationEmail(toEmail, userName, code) {
  console.log(`✉️ [Brevo Mail] Sende Verifizierungscode an ${toEmail}...`);

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 25px; background: #0a0b0a; color: #ffffff; border-radius: 12px; border: 1px solid #cfa670;">
      <h2 style="color: #cfa670;">Willkommen bei Pizza King Schleswig!</h2>
      <p>Hallo <strong>${userName}</strong>,</p>
      <p>Dein 6-stelliger Verifizierungscode lautet:</p>
      <div style="background: rgba(207, 166, 112, 0.2); border: 2px solid #cfa670; font-size: 28px; font-weight: bold; letter-spacing: 6px; padding: 18px; text-align: center; border-radius: 10px; color: #cfa670; margin: 25px 0;">
        ${code}
      </div>
    </div>
  `;

  return await sendBrevoMail({
    toEmail,
    toName: userName,
    subject: `🔑 Dein Verifizierungscode für Pizza King: ${code}`,
    htmlContent
  });
}

/**
 * 🍕 2. Bestellbestätigung senden
 */
export async function sendOrderConfirmationEmail(toEmail, order) {
  console.log(`✉️ [Brevo Mail] Sende Bestellbestätigung für Order #${order.id} an ${toEmail}...`);

  const itemsListHtml = (order.items || []).map(i => `
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

  const htmlContent = `
    <div style="font-family: 'Helvetica', sans-serif; background-color: #111111; color: #ffffff; padding: 40px 20px; text-align: center;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-radius: 12px; overflow: hidden; border: 1px solid #cfa670;">
        <div style="background: linear-gradient(135deg, #cfa670 0%, #b88645 100%); padding: 30px 20px;">
          <h1 style="color: #111111; margin: 0; font-size: 28px; text-transform: uppercase;">Pizza King</h1>
          <p style="color: #111111; margin: 10px 0 0; font-weight: 600;">Deine Bestellung ist eingegangen!</p>
        </div>
        <div style="padding: 30px 20px; text-align: left;">
          <h2 style="color: #cfa670; margin-top: 0; font-size: 22px;">Bestellbestätigung #${order.id}</h2>
          <p style="font-size: 16px; color: #dddddd;">Hallo ${order.customer || 'Kunde'},</p>
          <p style="font-size: 16px; color: #dddddd; line-height: 1.5;">Vielen Dank für deine Bestellung! Wir bereiten sie frisch für dich zu.</p>
          
          <h3 style="color: #ffffff; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-top: 30px;">Deine Artikel</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            ${itemsListHtml}
          </table>
          
          <div style="margin-top: 20px; text-align: right; font-size: 20px; color: #cfa670; font-weight: bold;">
            Gesamtsumme: ${(order.total || 0).toFixed(2).replace('.', ',')} €
          </div>
        </div>
        <div style="background-color: #0a0a0a; padding: 25px 20px; font-size: 14px; color: #888888; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
          <p style="margin: 0 0 5px 0;"><strong>Pizza King Schleswig</strong></p>
          <p style="margin: 0 0 5px 0;">Domziegelhof 12-14, 24837 Schleswig</p>
          <p style="margin: 0;">Tel: 04621/ 999 460 | 04621/ 999 461</p>
        </div>
      </div>
    </div>
  `;

  return await sendBrevoMail({
    toEmail,
    toName: order.customer,
    subject: `🍕 Bestellbestätigung #${order.id} - Pizza King`,
    htmlContent
  });
}

/**
 * 🎁 3. Newsletter-Gutschein senden
 */
export async function sendNewsletterEmail(toEmail) {
  console.log(`✉️ [Brevo Mail] Sende Newsletter Gutschein an ${toEmail}...`);

  const htmlContent = `
    <div style="font-family: 'Georgia', serif; padding: 40px; background: #0a0b0a; color: #ffffff; border: 1px solid #cfa670; border-radius: 8px; text-align: center;">
      <h2 style="color: #cfa670; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">Willkommen im Club!</h2>
      <p style="font-size: 16px; color: #dddddd; line-height: 1.6; max-width: 500px; margin: 20px auto;">
        Danke, dass du dem exklusiven Pizza King Newsletter beigetreten bist.
      </p>
      <div style="margin: 30px 0;">
        <span style="display: inline-block; padding: 12px 24px; background: #cfa670; color: #000; font-weight: bold; border-radius: 4px; text-transform: uppercase; font-family: sans-serif; letter-spacing: 1px;">
          Willkommens-Gutschein: KING-10-OFF
        </span>
      </div>
    </div>
  `;

  return await sendBrevoMail({
    toEmail,
    subject: `🍕 Willkommen im exklusiven Pizza King Club!`,
    htmlContent
  });
}


