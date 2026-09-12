/**
 * Pizza King E-Mail Service
 * Versendet E-Mails sicher über den lokalen Node-Backend-Server (Port 3001) über IONOS SMTP.
 */

import { API_URL } from '../api';

/**
 * 🔑 1. Verifizierungscode senden
 */
export async function sendVerificationEmail(toEmail, userName, code) {
  console.log(`✉️ [EMail-Service] Sende Verifizierungscode an ${toEmail}...`);

  try {
    const res = await fetch(`${API_URL}/send-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toEmail, userName, code })
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log('✅ Mailer Result:', data);
      return { success: true, data };
    }
  } catch (err) {
    console.warn('Endpoint error, trying direct Resend fallback...', err);
  }

  // Direct Resend Fallback (guaranteed delivery)
  try {
    const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn('VITE_RESEND_API_KEY not set');
      return { success: false, error: 'Resend API Key missing' };
    }

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Pizza King Schleswig <onboarding@resend.dev>',
        to: [toEmail],
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
        `
      })
    });

    if (resendRes.ok) {
      const data = await resendRes.json();
      console.log('✅ Direct Resend Mailer Result:', data);
      return { success: true, data };
    } else {
      const errorData = await resendRes.json();
      console.error('❌ Resend API Error:', errorData);
      return { success: false, error: errorData };
    }
  } catch (directErr) {
    console.error('❌ Direct Resend Fallback failed:', directErr);
    return { success: false, error: directErr.message };
  }
}

/**
 * 🍕 2. Bestellbestätigung senden
 */
export async function sendOrderConfirmationEmail(toEmail, order) {
  console.log(`✉️ [EMail-Service] Sende Bestellbestätigung für Order ${order.id} via IONOS Backend...`);

  try {
    const res = await fetch(`${API_URL}/send-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toEmail, order })
    });
    
    if (res.ok) {
      console.log('✅ IONOS Backend: Bestellbestätigung versendet!');
      return { success: true };
    } else {
      console.error('❌ IONOS Backend Fehler bei Bestellung');
      return { success: false };
    }
  } catch (e) {
    console.error('Backend Server offline für Order-Email', e);
    return { success: false };
  }
}

/**
 * 🎁 3. Newsletter-Gutschein senden
 */
export async function sendNewsletterEmail(toEmail) {
  console.log(`✉️ [EMail-Service] Sende Newsletter Gutschein an ${toEmail} via IONOS Backend...`);

  try {
    const res = await fetch(`${API_URL}/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: toEmail })
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log('✅ IONOS Backend Newsletter Result:', data);
      return { success: true, code: data.code };
    } else {
      const errorData = await res.json();
      console.error('❌ IONOS Backend Fehler:', errorData);
      return { success: false, error: errorData };
    }
  } catch (backendErr) {
    console.error('Backend Server offline oder nicht erreichbar!', backendErr);
    return { success: false, error: backendErr.message };
  }
}
