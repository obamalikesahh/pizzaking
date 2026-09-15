export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { toEmail, order } = await request.json();
    const apiKey = env.VITE_BREVO_API_KEY || env.BREVO_API_KEY;

    const itemsListHtml = (order?.items || []).map(i => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #fff;">
          <strong>${i.quantity || 1}x ${i.name}</strong>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: right; color: #cfa670; font-weight: bold;">
          ${((i.price || 0) * (i.quantity || 1)).toFixed(2).replace('.', ',')} €
        </td>
      </tr>
    `).join('');

    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey || '',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'Pizza King Schleswig', email: 'info@pizzaking-schleswig.de' },
        to: [{ email: toEmail, name: order?.customer || toEmail }],
        subject: `🍕 Bestellbestätigung #${order?.id} - Pizza King`,
        htmlContent: `
          <div style="font-family: sans-serif; background-color: #111; color: #fff; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-radius: 12px; padding: 20px; border: 1px solid #cfa670;">
              <h1 style="color: #cfa670; margin-top: 0;">Bestellbestätigung #${order?.id}</h1>
              <p>Hallo ${order?.customer || 'Kunde'}, vielen Dank für deine Bestellung!</p>
              <table style="width: 100%; margin-top: 15px;">${itemsListHtml}</table>
              <div style="margin-top: 20px; text-align: right; font-size: 18px; color: #cfa670; font-weight: bold;">
                Gesamtsumme: ${(order?.total || 0).toFixed(2).replace('.', ',')} €
              </div>
            </div>
          </div>
        `
      })
    });

    const data = await brevoRes.json();
    return new Response(JSON.stringify({ success: brevoRes.ok, data }), {
      status: brevoRes.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
