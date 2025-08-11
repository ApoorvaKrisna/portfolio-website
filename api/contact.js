module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Ensure JSON body even if the platform doesn't auto-parse
    let body = req.body;
    if (!body || typeof body !== 'object') {
      try {
        let raw = '';
        for await (const chunk of req) raw += chunk;
        body = raw ? JSON.parse(raw) : {};
      } catch {
        body = {};
      }
    }

    const name = (body.name || '').trim();
    const email = (body.email || '').trim();
    const message = (body.message || '').trim();

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing RESEND_API_KEY' });
    }

    // Resend test accounts only allow sending to the exact account email until a domain is verified.
    const toAddress = process.env.RESEND_TO || 'apoorva.krisna@gmail.com';

    const payload = {
      from: 'Apoorva Portfolio <onboarding@resend.dev>',
      to: [toAddress],
      subject: `Portfolio Contact — ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      return res.status(502).json({ error: 'Email send failed', detail });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
};
