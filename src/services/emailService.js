/**
 * Pizza King E-Mail Service
 * Versendet E-Mails sicher über den Backend-Server mit IONOS SMTP.
 */

import { API_URL } from '../api';

/**
 * 🔑 1. Verifizierungscode senden (via IONOS Backend)
 */
export async function sendVerificationEmail(toEmail, userName, code) {
  console.log(`✉️ [EMail-Service] Sende Verifizierungscode an ${toEmail} via IONOS Backend...`);

  // Versuche es zuerst über das Backend API (Hetzner Node.js / IONOS SMTP)
  try {
    const res = await fetch(`${API_URL}/send-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toEmail, userName, code })
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log('✅ IONOS Backend Mailer Result:', data);
      return { success: true, data };
    }
  } catch (err) {
    console.warn('Backend API error for verification email:', err);
  }

  // Cloudflare Function Fallback
  try {
    const res = await fetch('/api/send-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toEmail, userName, code })
    });
    
    if (res.ok) {
      const data = await res.json();
      return { success: true, data };
    }
  } catch (err) {
    console.error('Fallback error:', err);
  }

  return { success: false, error: 'E-Mail konnte nicht gesendet werden.' };
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
    const res = await fetch(`${API_URL}/subscribe-newsletter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toEmail })
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log('✅ IONOS Backend Newsletter Result:', data);
      return { success: true };
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

