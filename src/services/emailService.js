/**
 * Pizza King E-Mail Service
 * Versendet E-Mails sicher über den Backend-Server mit IONOS SMTP.
 */

import { API_URL } from '../api';

/**
 * 🔑 1. Verifizierungscode senden (via IONOS Backend)
 */
export async function sendVerificationEmail(toEmail, userName, code) {
  console.log(`✉️ [EMail-Service] Sende Verifizierungscode an ${toEmail}...`);

  try {
    const res = await fetch('/api/send-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toEmail, userName, code })
    });
    
    const data = await res.json();
    if (res.ok && data.success) {
      console.log('✅ Verifizierungs-E-Mail erfolgreich versendet:', data);
      return { success: true, data };
    } else {
      console.error('❌ E-Mail Server Rückmeldung:', data);
      return { success: false, error: data.error || 'Serverfehler beim Versand' };
    }
  } catch (err) {
    console.error('❌ Fehler beim E-Mail Versand:', err);
    return { success: false, error: err.message };
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

