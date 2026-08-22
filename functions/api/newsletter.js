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
      
      if (!email || !email.includes('@')) {
        return json({ message: 'Email invalide.' }, 400);
      }

      const id = crypto.randomUUID();
      try {
        await db.prepare(`INSERT INTO newsletter_subscribers (id, email) VALUES (?, ?)`).bind(id, email).run();
        return json({ ok: true, message: 'Inscription réussie !' });
      } catch (err) {
        if (err.message.includes('UNIQUE')) {
          return json({ ok: true, message: 'Déjà inscrit !' });
        }
        throw err;
      }
    } catch (e) {
      return json({ message: 'Erreur lors de l\'inscription.' }, 500);
    }
  }

  return json({ message: 'Method not allowed.' }, 405);
}
