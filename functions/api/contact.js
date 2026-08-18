const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'} });

async function verifyTurnstile(token, secret, ip) {
  if (!token) return false;
  const formData = new FormData();
  formData.append('secret', secret);
  formData.append('response', token);
  formData.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: formData });
  const outcome = await res.json();
  return outcome.success;
}

function authorized(request, env){
  const expected = env.REVIEW_ADMIN_TOKEN;
  if(!expected) return false;
  const header = request.headers.get('Authorization') || '';
  if(header === `Bearer ${expected}`) return true;
  const alt = request.headers.get('X-Admin-Token') || '';
  if(alt && alt.trim() === expected) return true;
  const url = new URL(request.url);
  const qt = url.searchParams.get('token') || '';
  return qt === expected;
}

async function migrate(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS project_requests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT DEFAULT '',
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run().catch(() => {});
}

export async function onRequest(context) {
  const { request, env } = context;
  const db = env.REVIEWS_DB;
  if (!db) return json({ message: 'Database not configured.' }, 503);
  await migrate(db);

  // POST : Soumission publique ou action admin
  if (request.method === 'POST') {
    const payload = await request.json();
    
    // CAS 1 : Action Admin (nécessite token)
    if (payload.action && ['read', 'archive', 'delete'].includes(payload.action)) {
      if (!authorized(request, env)) return json({ message: 'Unauthorized' }, 401);
      const id = String(payload.id || '');
      if (payload.action === 'delete') {
        await db.prepare(`DELETE FROM project_requests WHERE id = ?`).bind(id).run();
        return json({ ok: true, deleted: true });
      }
      const nextStatus = payload.action === 'read' ? 'read' : 'archived';
      await db.prepare(`UPDATE project_requests SET status = ? WHERE id = ?`).bind(nextStatus, id).run();
      return json({ ok: true, status: nextStatus });
    }

    // CAS 2 : Soumission publique (nécessite Turnstile)
    const turnstileToken = payload['cf-turnstile-response'];
    const ip = request.headers.get('CF-Connecting-IP');
    const isHuman = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET_KEY, ip);
    if (!isHuman) return json({ message: 'Spam protection failed.' }, 403);

    const name = String(payload.name || '').trim();
    const email = String(payload.email || '').trim();
    const subject = String(payload.subject || '').trim();
    const message = String(payload.message || '').trim();

    if (!name || !email || !message) return json({ message: 'Missing fields.' }, 400);

    const id = crypto.randomUUID();
    await db.prepare(`INSERT INTO project_requests (id, name, email, subject, message) VALUES (?, ?, ?, ?, ?)`).bind(id, name, email, subject, message).run();

    return json({ ok: true, message: 'Message sent successfully.' });
  }

  // GET : Liste admin (nécessite token)
  if (request.method === 'GET') {
    if (!authorized(request, env)) return json({ message: 'Unauthorized' }, 401);
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'all';
    let query = `SELECT * FROM project_requests ORDER BY created_at DESC`;
    let bind = [];
    if (status !== 'all') {
      query = `SELECT * FROM project_requests WHERE status = ? ORDER BY created_at DESC`;
      bind = [status];
    }
    const result = await db.prepare(query).bind(...bind).all();
    return json({ requests: result.results || [] });
  }

  return json({ message: 'Method not allowed.' }, 405);
}
