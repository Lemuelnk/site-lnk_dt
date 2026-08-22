const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'} });

async function migrate(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run().catch(() => {});
}

export async function onRequest(context) {
  const { request, env } = context;
  const db = env.REVIEWS_DB;
  if (!db) return json({ message: 'Database not configured.' }, 503);
  await migrate(db);

  if (request.method === 'POST') {
    try {
      const payload = await request.json();
      const email = String(payload.email || '').trim().toLowerCase();
      
      const turnstileToken = payload['cf-turnstile-response'];
      const ip = request.headers.get('CF-Connecting-IP');
      
      // Simple verification helper inline to avoid dependency
      if (turnstileToken && env.TURNSTILE_SECRET) {
        const formData = new FormData();
        formData.append('secret', env.TURNSTILE_SECRET);
        formData.append('response', turnstileToken);
        formData.append('remoteip', ip);
        const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: formData });
        const outcome = await verify.json();
        if (!outcome.success) return json({ message: 'Spam protection failed.' }, 403);
      }

      if (!email || !email.includes('@')) {
        return json({ 
          fr: 'Email invalide.', 
          en: 'Invalid email.' 
        }, 400);
      }

      const id = crypto.randomUUID();
      try {
        await db.prepare(`INSERT INTO newsletter_subscribers (id, email) VALUES (?, ?)`).bind(id, email).run();
        return json({ 
          ok: true, 
          fr: 'Inscription réussie !', 
          en: 'Subscription successful!' 
        });
      } catch (err) {
        if (err.message.includes('UNIQUE')) {
          return json({ 
            ok: true, 
            fr: 'Déjà inscrit !', 
            en: 'Already subscribed!' 
          });
        }
        throw err;
      }
    } catch (e) {
      return json({ 
        fr: 'Erreur lors de l\'inscription.', 
        en: 'Error during subscription.' 
      }, 500);
    }
  }

  return json({ message: 'Method not allowed.' }, 405);
}
