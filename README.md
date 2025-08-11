## Apoorva Krisna — Personal Portfolio (Multi‑Page)

A modern, engaging multi‑page portfolio for a backend software engineer based in Gurugram, India. Built with HTML, CSS, and minimal JavaScript.

Pages: `index.html`, `about.html`, `skills.html`, `projects.html`, `achievements.html`, `blog.html`, `contact.html`.

Features
- Clean, bold tech palette (deep blues, warm greys, accent green)
- Subtle animated background on Home
- Scroll‑based reveals, counters, and skill bars
- Mobile navigation + light/dark themes
- Contact form wired to Resend (demo key as provided)

Local Preview

```bash
python3 -m http.server 5173
# open http://127.0.0.1:5173/index.html
```

Customize
- Update name and micro‑copy across pages
- Fill project links and blog URLs
- Replace the Resend key with an environment‑secure approach before production

Notes
- For production, do not expose API keys in client code. Use a server or serverless function to proxy the email send.

## Deployment (Vercel)

- This site includes a serverless function at `api/contact.js` to send emails via Resend.
- In Vercel, add an Environment Variable:
  - Key: `RESEND_API_KEY`
  - Value: your Resend API key (keep it secret)
- After deploying, the contact form posts to `/api/contact` and no key is exposed on the client.

SEO
- `robots.txt` and `sitemap.xml` are included. Update sitemap URLs to your domain once purchased.

Local test of API (optional)
- API routes run only on Vercel. For local-only testing you’d need a Node server; otherwise deploy and test at your Vercel URL.

### Local email testing (works on 127.0.0.1)

This repo includes a small Flask server that exposes `/api/contact` locally so you can test the contact form without deploying:

1) Create `.env` (same folder) with your key:
```
RESEND_API_KEY=your_resend_key
# Optional: override recipient for tests (Resend may restrict to your own email until domain is verified)
RESEND_TO=apoorva.krisna@gmail.com
```

2) Install and run the server:
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python server.py
```
This starts at `http://127.0.0.1:5000`.

3) Keep your static site running (port 5173) in another terminal. Submit the form at `http://127.0.0.1:5173/contact.html`. The browser will POST to `http://127.0.0.1:5000/api/contact` (CORS is allowed) if you set the endpoint in `script.js`, or you can change the fetch URL to `http://127.0.0.1:5000/api/contact` temporarily while testing locally.

After deploy to Vercel, switch the frontend back to `/api/contact` and set `RESEND_API_KEY` in Vercel.
