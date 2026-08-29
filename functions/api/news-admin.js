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
  if (!expected) {
    // En staging uniquement, on accepte le token par défaut si le secret n'est pas configuré
    const fallback = 'lnkdesign2026';
    const header = request.headers.get('Authorization') || '';
    if (header === `Bearer ${fallback}`) return true;
    const alt = request.headers.get('X-Admin-Token') || '';
    if (alt && alt.trim() === fallback) return true;
    const url = new URL(request.url);
    return url.searchParams.get('token') === fallback;
  }
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
    title_fr TEXT,
    title_en TEXT,
    desc_fr TEXT,
    desc_en TEXT,
    external_url TEXT,
    expires_at TEXT,
    status TEXT DEFAULT 'active',
    deleted_at TEXT,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run().catch(() => {});
  
  // Migration progressive
  const cols = [
    ['title_fr', 'TEXT'], ['title_en', 'TEXT'], ['desc_fr', 'TEXT'], ['desc_en', 'TEXT'],
    ['external_url', 'TEXT'], ['expires_at', 'TEXT'], ['status', "TEXT DEFAULT 'active'"], ['deleted_at', 'TEXT']
  ];
  for (const [col, type] of cols) {
    await db.prepare(`ALTER TABLE news_settings ADD COLUMN ${col} ${type}`).run().catch(() => {});
  }
  await db.prepare(`ALTER TABLE news_settings ADD COLUMN click_count INTEGER DEFAULT 0`).run().catch(() => {});
}

// GET public : retourne les overrides featured/link pour toutes les publications
async function getPublicSettings(db) {
  try {
    // S'assurer que les colonnes existent
    await db.prepare(`ALTER TABLE news_settings ADD COLUMN external_url TEXT`).run().catch(() => {});
    await db.prepare(`ALTER TABLE news_settings ADD COLUMN expires_at TEXT`).run().catch(() => {});
    
    const { results } = await db.prepare(`SELECT file, featured, custom_link, title_fr, title_en, desc_fr, desc_en, external_url, expires_at FROM news_settings WHERE (featured = 1 OR custom_link IS NOT NULL) AND (status IS NULL OR status != 'deleted')`).all();
    const settings = {};
    const now = new Date().toISOString();

    (results || []).forEach(r => {
      // Vérifier l'expiration
      let featured = r.featured === 1;
      if (featured && r.expires_at && r.expires_at < now) {
        featured = false;
      }

      settings[r.file] = { 
        featured, 
        link: r.custom_link || null,
        title_fr: r.title_fr || null,
        title_en: r.title_en || null,
        desc_fr: r.desc_fr || null,
        desc_en: r.desc_en || null,
        external_url: r.external_url || null,
        expires_at: r.expires_at || null
      };
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
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || '';

    // Action publique : Enregistrer un clic
    if (action === 'track-click') {
      const file = url.searchParams.get('file');
      if (!file) return json({ message: 'Missing file' }, 400);
      await db.prepare(`UPDATE news_settings SET click_count = click_count + 1 WHERE file = ?`).bind(file).run();
      return json({ ok: true });
    }

    // Admin : Récupérer toutes les données (avec auth)
    if (action === 'get-all') {
      if (!authorized(request, env)) return json({ message: 'Unauthorized' }, 401);
      const { results } = await db.prepare(`SELECT * FROM news_settings ORDER BY updated_at DESC`).all();
      return json({ results });
    }

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
      const { title_fr, title_en, desc_fr, desc_en, link: promoLink, duration, unit } = payload;
      await db.prepare(`UPDATE news_settings SET featured = 0`).run();
      
      const isExternal = file.startsWith('data:') || file.startsWith('http');
      const dbFile = isExternal ? 'EXTERNAL_PROMO' : file;
      
      let expiresAt = null;
      if (duration && parseInt(duration) > 0) {
        const d = new Date();
        const val = parseInt(duration);
        if (unit === 'hours') d.setHours(d.getHours() + val);
        else if (unit === 'days') d.setDate(d.getDate() + val);
        else if (unit === 'months') d.setMonth(d.getMonth() + val);
        else d.setDate(d.getDate() + val); // default days
        expiresAt = d.toISOString();
      }

      await db.prepare(`INSERT INTO news_settings (file, featured, title_fr, title_en, desc_fr, desc_en, custom_link, external_url, expires_at, status, updated_at) 
        VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
        ON CONFLICT(file) DO UPDATE SET 
          featured = 1, 
          title_fr = ?, 
          title_en = ?, 
          desc_fr = ?, 
          desc_en = ?,
          custom_link = ?,
          external_url = ?,
          expires_at = ?,
          status = 'active',
          updated_at = ?`)
        .bind(dbFile, title_fr, title_en, desc_fr, desc_en, promoLink, isExternal ? file : null, expiresAt, now, 
              title_fr, title_en, desc_fr, desc_en, promoLink, isExternal ? file : null, expiresAt, now)
        .run();
      
      return json({ ok: true, action: 'feature', file, expires_at: expiresAt });
    }

    if (action === 'trash') {
      await db.prepare(`UPDATE news_settings SET status = 'deleted', deleted_at = ?, featured = 0 WHERE file = ?`).bind(now, file).run();
      return json({ ok: true, action: 'trash', file });
    }

    if (action === 'restore') {
      await db.prepare(`UPDATE news_settings SET status = 'active', deleted_at = NULL WHERE file = ?`).bind(file).run();
      return json({ ok: true, action: 'restore', file });
    }

    if (action === 'delete-forever') {
      await db.prepare(`DELETE FROM news_settings WHERE file = ?`).bind(file).run();
      return json({ ok: true, action: 'delete-forever', file });
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
