/**
 * Pizza King E-Mail Service
 * Versendet E-Mails sicher über den lokalen Node-Backend-Server (Port 3001) über IONOS SMTP.
 */

const BACKEND_URL = 'http://localhost:3002';

/**
 * 🔑 1. Verifizierungscode senden
 */
export async function sendVerificationEmail(toEmail, userName, code) {
  console.log(`✉️ [EMail-Service] Sende Verifizierungscode an ${toEmail} via IONOS Backend...`);

  try {
    const res = await fetch(`${BACKEND_URL}/api/send-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toEmail, userName, code })
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log('✅ IONOS Backend Mailer Result:', data);
      return { success: true, data };
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

/**
 * 🍕 2. Bestellbestätigung senden
 */
export async function sendOrderConfirmationEmail(toEmail, order) {
  console.log(`✉️ [EMail-Service] Sende Bestellbestätigung für Order ${order.id} via IONOS Backend...`);

  try {
    const res = await fetch(`${BACKEND_URL}/api/send-order`, {
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
