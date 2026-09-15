export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { toEmail } = await request.json();
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
        to: [{ email: toEmail }],
        subject: `🍕 Willkommen im exklusiven Pizza King Club!`,
        htmlContent: `
          <div style="font-family: Georgia, serif; padding: 30px; background: #0a0b0a; color: #fff; border: 1px solid #cfa670; border-radius: 8px; text-align: center;">
            <h2 style="color: #cfa670;">Willkommen im Club!</h2>
            <p>Danke, dass du dem exklusiven Pizza King Newsletter beigetreten bist.</p>
            <div style="margin: 20px 0;">
              <span style="padding: 10px 20px; background: #cfa670; color: #000; font-weight: bold; border-radius: 4px;">
                Willkommens-Gutschein: KING-10-OFF
              </span>
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
