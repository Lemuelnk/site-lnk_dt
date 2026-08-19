/* News admin — gestion des publications LNK_DT NEWS depuis l'admin panel.
   Permet de :
   - GET : lister toutes les publications (avec featured actuel)
   - POST : définir la publication vedette (featured) et/ou modifier le lien d'une publication

   Les données sont stockées dans D1 (table news_settings) et servies
   publiquement via un override du catalogue statique.
*/
const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
});

function authorized(request, env) {
  const expected = env.REVIEW_ADMIN_TOKEN;
  if (!expected) return false;
  const header = request.headers.get('Authorization') || '';
  if (header === `Bearer ${expected}`) return true;
  const alt = request.headers.get('X-Admin-Token') || '';
  if (alt && alt.trim() === expected) return true;
  const url = new URL(request.url);
  const qt = url.searchParams.get('token') || '';
  return qt === expected;
}

async function migrate(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS news_settings (
    file TEXT PRIMARY KEY,
    featured INTEGER NOT NULL DEFAULT 0,
    custom_link TEXT,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run().catch(() => {});
}

// GET public : retourne les overrides featured/link pour toutes les publications
async function getPublicSettings(db) {
  try {
    const { results } = await db.prepare(`SELECT file, featured, custom_link FROM news_settings WHERE featured = 1 OR custom_link IS NOT NULL`).all();
    const settings = {};
    (results || []).forEach(r => {
      settings[r.file] = { featured: r.featured === 1, link: r.custom_link || null };
    });
    return settings;
  } catch (_e) {
    return {};
  }
}

export async function onRequest(context) {
  const { request, env } = context;
  const db = env.REVIEWS_DB;
  if (!db) return json({ message: 'Reviews database is not configured.' }, 503);
  await migrate(db);

  if (request.method === 'GET') {
    // Public : servir les settings pour que le front puisse les appliquer
    const settings = await getPublicSettings(db);
    return json({ settings });
  }

  if (request.method === 'POST') {
    if (!authorized(request, env)) return json({ message: 'Unauthorized' }, 401);
    const payload = await request.json();
    const file = String(payload.file || '').trim();
    const action = String(payload.action || '');
    const link = payload.link !== undefined ? String(payload.link || '').trim() : undefined;

    if (!file) return json({ message: 'Missing file parameter.' }, 400);

    const now = new Date().toISOString();

    if (action === 'feature') {
      // Désactiver tous les autres featured, activer celui-ci
      await db.prepare(`UPDATE news_settings SET featured = 0`).run();
      await db.prepare(`INSERT INTO news_settings (file, featured, updated_at) VALUES (?, 1, ?)
        ON CONFLICT(file) DO UPDATE SET featured = 1, updated_at = ?`).bind(file, now, now).run();
      return json({ ok: true, action: 'feature', file });
    }

    if (action === 'unfeature') {
      await db.prepare(`INSERT INTO news_settings (file, featured, updated_at) VALUES (?, 0, ?)
        ON CONFLICT(file) DO UPDATE SET featured = 0, updated_at = ?`).bind(file, now, now).run();
      return json({ ok: true, action: 'unfeature', file });
    }

    if (action === 'setlink') {
      if (link === undefined) return json({ message: 'Missing link parameter.' }, 400);
      if (link === '') {
        // Supprimer le lien custom (retour à la valeur par défaut)
        await db.prepare(`DELETE FROM news_settings WHERE file = ? AND custom_link IS NOT NULL`).bind(file).run();
        return json({ ok: true, action: 'setlink', file, link: null });
      }
      await db.prepare(`INSERT INTO news_settings (file, featured, custom_link, updated_at) VALUES (?, 0, ?, ?)
        ON CONFLICT(file) DO UPDATE SET custom_link = ?, updated_at = ?`).bind(file, link, now, link, now).run();
      return json({ ok: true, action: 'setlink', file, link });
    }

    return json({ message: 'Invalid action.' }, 400);
  }

  return json({ message: 'Method not allowed.' }, 405);
}
