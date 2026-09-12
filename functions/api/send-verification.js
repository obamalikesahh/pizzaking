export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { toEmail, userName, code } = body;

    const resendApiKey = env.RESEND_API_KEY;

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

    const data = await resendRes.json();

    if (!resendRes.ok) {
      console.error('Resend Error:', data);
      return new Response(JSON.stringify({ success: false, error: data }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
