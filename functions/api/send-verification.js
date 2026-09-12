export async function onRequestPost(context) {
  try {
    const { request } = context;
    const body = await request.json();

    // Call our Hetzner Node.js Backend Server running Nodemailer with IONOS SMTP
    const backendRes = await fetch('http://91.99.194.132:3002/api/send-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await backendRes.json();

    return new Response(JSON.stringify(data), {
      status: backendRes.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

