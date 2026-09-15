/**
 * Pizza King E-Mail Service
 * Versendet E-Mails über Vercel Serverless Functions mit IONOS SMTP (Nodemailer).
 */

// Bot protection & Rate-Limiter Settings
const MAX_EMAILS_PER_DAY = 10;
const COOLDOWN_SECONDS = 30;

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

  if (emailStats.lastSent && (now - emailStats.lastSent) < (COOLDOWN_SECONDS * 1000)) {
    const waitTime = Math.ceil((COOLDOWN_SECONDS * 1000 - (now - emailStats.lastSent)) / 1000);
    return { allowed: false, error: `Bitte warte ${waitTime} Sekunden vor dem nächsten E-Mail Versand (Spam-Schutz).` };
  }

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

async function sendApiMail(endpoint, body) {
  const limitCheck = checkRateLimit();
  if (!limitCheck.allowed) {
    console.warn('⛔ [Bot-Protection] E-Mail blockiert:', limitCheck.error);
    return { success: false, error: limitCheck.error };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    if (response.ok && data.success) {
      recordEmailSent(limitCheck.stats);
      console.log(`✅ E-Mail erfolgreich über IONOS SMTP (${endpoint}) versendet:`, data);
      return { success: true, data };
    } else {
      console.error(`❌ E-Mail-Fehler (${endpoint}):`, data);
      return { success: false, error: data.error || 'Server E-Mail Fehler' };
    }
  } catch (err) {
    console.error(`❌ Netzwerkfehler beim E-Mail-Versand (${endpoint}):`, err);
    return { success: false, error: err.message };
  }
}

/**
 * 🔑 1. Verifizierungscode senden (IONOS SMTP via Vercel Api)
 */
export async function sendVerificationEmail(toEmail, userName, code) {
  console.log(`✉️ [IONOS SMTP] Sende Verifizierungscode an ${toEmail}...`);
  return await sendApiMail('/api/send-verification', { toEmail, userName, code });
}

/**
 * 🍕 2. Bestellbestätigung senden (IONOS SMTP via Vercel Api)
 */
export async function sendOrderConfirmationEmail(toEmail, order) {
  console.log(`✉️ [IONOS SMTP] Sende Bestellbestätigung für Order #${order.id} an ${toEmail}...`);
  return await sendApiMail('/api/send-order', { toEmail, order });
}

/**
 * 🎁 3. Newsletter-Gutschein senden (IONOS SMTP via Vercel Api)
 */
export async function sendNewsletterEmail(toEmail) {
  console.log(`✉️ [IONOS SMTP] Sende Newsletter Gutschein an ${toEmail}...`);
  return await sendApiMail('/api/subscribe-newsletter', { toEmail });
}
