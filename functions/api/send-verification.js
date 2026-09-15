export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { toEmail, userName, code } = await request.json();
    const apiKey = env.VITE_BREVO_API_KEY || env.BREVO_API_KEY;

    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey || '',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'Pizza King Schleswig', email: 'info@pizzaking-schleswig.de' },
        to: [{ email: toEmail, name: userName || toEmail }],
        subject: `🔑 Dein Verifizierungscode für Pizza King: ${code}`,
        htmlContent: `
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
